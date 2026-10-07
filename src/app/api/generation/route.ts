import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getGenerationStyle } from "@/lib/ai/style-catalog";
import {
  generationConfigured,
  generationHash,
  idempotencySchema,
  enqueueErrorStatus,
} from "@/lib/ai/generation-request";
import { processGeneration } from "@/lib/ai/generation-worker";
export const runtime = "nodejs";
export const maxDuration = 300;
const schema = z.object({
  uploadId: z.string().uuid(),
  styleKey: z.string().max(120),
  prompt: z.string().max(2000).optional(),
});
export async function POST(request: Request) {
  if (!generationConfigured())
    return NextResponse.json(
      { error: "GENERATION_SERVICE_NOT_CONFIGURED" },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const key = idempotencySchema.safeParse(
      request.headers.get("Idempotency-Key"),
    ),
    parsed = schema.safeParse(await request.json().catch(() => null));
  if (!key.success || !parsed.success)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const style = getGenerationStyle(parsed.data.styleKey);
  if (!style)
    return NextResponse.json({ error: "INVALID_STYLE" }, { status: 400 });
  const db = createServiceClient();
  const { data: upload } = await db
    .from("uploads")
    .select("id,verified_at,sha256")
    .eq("id", parsed.data.uploadId)
    .eq("user_id", user.id)
    .single();
  if (!upload?.verified_at)
    return NextResponse.json({ error: "UPLOAD_NOT_VERIFIED" }, { status: 400 });
  const prompt = [style.prompt, parsed.data.prompt].filter(Boolean).join(", "),
    hash = generationHash(upload.sha256 ?? upload.id, style.key, prompt);
  const { data: job, error } = await db.rpc("enqueue_generation", {
    p_user_id: user.id,
    p_upload_id: upload.id,
    p_style_key: style.key,
    p_prompt: prompt,
    p_key: key.data,
    p_hash: hash,
  });
  if (error || !job)
    return NextResponse.json(
      {
        error: error?.message.includes("IDEMPOTENCY")
          ? "IDEMPOTENCY_CONFLICT"
          : error?.message.includes("QUOTA")
            ? "GENERATION_QUOTA_EXCEEDED"
            : "GENERATION_JOB_CREATE_FAILED",
      },
      { status: enqueueErrorStatus(error?.message ?? "") },
    );
  if (job.status === "queued")
    after(async () => {
      try {
        await processGeneration(job.id, user.id);
      } catch {
        console.error("generation_dispatch_failed", { jobId: job.id });
      }
    });
  let artworkId: null | string = null;
  if (job.result_version_id) {
    const { data: v } = await db
      .from("artwork_versions")
      .select("artwork_id")
      .eq("id", job.result_version_id)
      .single();
    artworkId = v?.artwork_id ?? null;
  }
  return NextResponse.json(
    {
      job: {
        id: job.id,
        status: job.status,
        style_key: job.style_key,
        created_at: job.created_at,
      },
      artworkId,
    },
    { status: 202 },
  );
}

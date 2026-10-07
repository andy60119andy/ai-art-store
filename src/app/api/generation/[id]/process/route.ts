import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generationConfigured } from "@/lib/ai/generation-request";
import { processGeneration } from "@/lib/ai/generation-worker";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!generationConfigured())
    return NextResponse.json(
      { error: "GENERATION_SERVICE_NOT_CONFIGURED" },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const db = await createClient();
  const { data: job } = await db
    .from("generation_jobs")
    .select("id,status,result_version_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!job)
    return NextResponse.json(
      { error: "GENERATION_NOT_FOUND" },
      { status: 404 },
    );
  if (job.status === "queued")
    after(async () => {
      try {
        await processGeneration(id, user.id);
      } catch {
        console.error("generation_dispatch_failed", { jobId: id });
      }
    });
  let artworkId = null;
  if (job.result_version_id) {
    const { data: v } = await db
      .from("artwork_versions")
      .select("artwork_id")
      .eq("id", job.result_version_id)
      .single();
    artworkId = v?.artwork_id ?? null;
  }
  return NextResponse.json(
    { job: { id: job.id, status: job.status }, artworkId },
    { status: job.status === "succeeded" ? 200 : 202 },
  );
}

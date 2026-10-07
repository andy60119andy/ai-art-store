import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const db = await createClient();
  const { data: job, error } = await db
    .from("generation_jobs")
    .select(
      "id,status,style_key,error_message,created_at,started_at,completed_at,lease_expires_at,result_version_id",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !job)
    return NextResponse.json(
      { error: "GENERATION_NOT_FOUND" },
      { status: 404 },
    );
  const timedOut =
      job.status === "processing" &&
      job.lease_expires_at &&
      Date.parse(job.lease_expires_at) < Date.now(),
    notDispatched =
      job.status === "queued" &&
      Date.parse(job.created_at) < Date.now() - 600000;
  if ((timedOut || notDispatched) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = createServiceClient();
    const { data: expired } = await service
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: "GENERATION_TIMEOUT",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", job.status)
      .select("id")
      .maybeSingle();
    if (expired) {
      job.status = "failed";
      job.error_message = "GENERATION_TIMEOUT";
    }
  }
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
    {
      job: {
        id: job.id,
        status: job.status,
        style_key: job.style_key,
        error_message: job.error_message,
        created_at: job.created_at,
        started_at: job.started_at,
        completed_at: job.completed_at,
      },
      artworkId,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

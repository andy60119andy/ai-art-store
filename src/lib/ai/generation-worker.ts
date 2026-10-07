import { createServiceClient } from "@/lib/supabase/service";
import { getAiProvider } from "./provider";
import { validateImage } from "./image-validation";
export async function processGeneration(jobId: string, userId: string) {
  const db = createServiceClient(),
    token = crypto.randomUUID();
  const { data: claimed, error } = await db.rpc("claim_generation", {
    p_job_id: jobId,
    p_user_id: userId,
    p_token: token,
  });
  if (error) throw Error("GENERATION_CLAIM_FAILED");
  const job = claimed?.[0];
  if (!job) return;
  try {
    const { data: upload } = await db
      .from("uploads")
      .select("storage_path,verified_at")
      .eq("id", job.upload_id)
      .eq("user_id", userId)
      .single();
    if (!upload?.verified_at) throw Error("UPLOAD_NOT_VERIFIED");
    const { data: signed, error: signError } = await db.storage
      .from("artwork-uploads")
      .createSignedUrl(upload.storage_path, 300);
    if (signError || !signed?.signedUrl)
      throw Error("SOURCE_IMAGE_UNAVAILABLE");
    const result = await getAiProvider().generate({
      imageUrl: signed.signedUrl,
      styleKey: job.style_key,
      prompt: job.prompt ?? undefined,
    });
    if (
      result.status !== "succeeded" ||
      !result.outputUrl?.startsWith("data:image/")
    )
      throw Error("AI_GENERATION_FAILED");
    const raw = result.outputUrl.split(",")[1];
    if (!raw) throw Error("INVALID_GENERATION_RESULT");
    const image = await validateImage(Buffer.from(raw, "base64"));
    const path = `${userId}/generations/${jobId}/${token}.${image.ext}`;
    const { error: storageError } = await db.storage
      .from("artwork-uploads")
      .upload(path, image.bytes, { contentType: image.mime, upsert: false });
    if (storageError) throw Error("RESULT_STORAGE_FAILED");
    const { error: finishError } = await db.rpc("finish_generation", {
      p_job_id: jobId,
      p_user_id: userId,
      p_token: token,
      p_path: path,
      p_width: image.width,
      p_height: image.height,
      p_provider_id: result.providerJobId ?? null,
    });
    if (finishError) throw Error("RESULT_COMMIT_FAILED");
  } catch (error) {
    const code =
      error instanceof Error && /Timeout|Abort/.test(error.name)
        ? "GENERATION_TIMEOUT"
        : "AI_GENERATION_FAILED";
    // Never expose provider response bodies or signed URLs to clients.
    console.error("generation_failed", { jobId, code });
    await db
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: code,
        completed_at: new Date().toISOString(),
        lease_expires_at: null,
      })
      .eq("id", jobId)
      .eq("user_id", userId)
      .eq("status", "processing")
      .eq("lease_token", token);
  }
}

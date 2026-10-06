import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAiProvider } from "@/lib/ai/provider";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .select("id, user_id, upload_id, style_key, prompt, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (jobError || !job) return NextResponse.json({ error: "GENERATION_NOT_FOUND" }, { status: 404 });
  if (job.status === "succeeded") return NextResponse.json({ job });

  const { data: upload } = await supabase
    .from("uploads")
    .select("storage_path")
    .eq("id", job.upload_id)
    .eq("user_id", user.id)
    .single();

  if (!upload) return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: 404 });

  await supabase
    .from("generation_jobs")
    .update({ status: "processing", started_at: new Date().toISOString(), error_message: null })
    .eq("id", job.id)
    .eq("user_id", user.id);

  try {
    const { data: signed, error: signedError } = await supabase.storage
      .from("artwork-uploads")
      .createSignedUrl(upload.storage_path, 300);

    if (signedError || !signed?.signedUrl) throw new Error("SOURCE_IMAGE_SIGNED_URL_FAILED");

    const result = await getAiProvider().generate({
      imageUrl: signed.signedUrl,
      styleKey: job.style_key,
      prompt: job.prompt ?? undefined,
    });

    if (result.status !== "succeeded" || !result.outputUrl?.startsWith("data:image/")) {
      throw new Error(result.error || "AI_GENERATION_FAILED");
    }

    const base64 = result.outputUrl.split(",")[1];
    const imageBytes = Buffer.from(base64, "base64");
    const outputPath = `${user.id}/generations/${job.id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("artwork-uploads")
      .upload(outputPath, imageBytes, { contentType: "image/png", upsert: true });

    if (uploadError) throw new Error(`OUTPUT_STORAGE_UPLOAD_FAILED:${uploadError.message}`);

    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert({ user_id: user.id, title: "AI Generated Artwork", status: "ready" })
      .select("id")
      .single();

    if (artworkError || !artwork) throw new Error("ARTWORK_CREATE_FAILED");

    const { error: versionError } = await supabase.from("artwork_versions").insert({
      artwork_id: artwork.id,
      generation_job_id: job.id,
      storage_path: outputPath,
      version_no: 1,
    });

    if (versionError) throw new Error("ARTWORK_VERSION_CREATE_FAILED");

    const { data: updatedJob } = await supabase
      .from("generation_jobs")
      .update({ status: "succeeded", completed_at: new Date().toISOString(), provider_job_id: result.providerJobId ?? null })
      .eq("id", job.id)
      .eq("user_id", user.id)
      .select("id, status, style_key, created_at, started_at, completed_at")
      .single();

    return NextResponse.json({ job: updatedJob, artworkId: artwork.id, storagePath: outputPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI_GENERATION_FAILED";
    await supabase.from("generation_jobs").update({
      status: "failed",
      error_message: message.slice(0, 2000),
      completed_at: new Date().toISOString(),
    }).eq("id", job.id).eq("user_id", user.id);

    return NextResponse.json({ error: "AI_GENERATION_FAILED", message }, { status: 502 });
  }
}

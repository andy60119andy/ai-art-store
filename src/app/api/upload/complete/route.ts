import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { validateImage } from "@/lib/ai/image-validation";
import { z } from "zod";
const schema = z.object({ path: z.string().min(1).max(500) });
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json(
      { error: "UPLOAD_SERVICE_NOT_CONFIGURED" },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const db = createServiceClient();
  const { data: upload } = await db
    .from("uploads")
    .select("id,storage_path,mime_type,size_bytes,verified_at")
    .eq("storage_path", parsed.data.path)
    .eq("user_id", user.id)
    .single();
  if (!upload)
    return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: 404 });
  if (upload.verified_at) return NextResponse.json({ upload });
  const { data: blob, error } = await db.storage
    .from("artwork-uploads")
    .download(upload.storage_path);
  if (error || !blob)
    return NextResponse.json({ error: "UPLOAD_INCOMPLETE" }, { status: 409 });
  try {
    const image = await validateImage(Buffer.from(await blob.arrayBuffer()));
    if (image.mime !== upload.mime_type || blob.size !== upload.size_bytes)
      return NextResponse.json(
        { error: "UPLOAD_METADATA_MISMATCH" },
        { status: 400 },
      );
    const { data, error: updateError } = await db
      .from("uploads")
      .update({
        width_px: image.width,
        height_px: image.height,
        sha256: image.hash,
        verified_at: new Date().toISOString(),
      })
      .eq("id", upload.id)
      .eq("user_id", user.id)
      .select("id,storage_path,mime_type,size_bytes,width_px,height_px")
      .single();
    if (updateError)
      return NextResponse.json(
        { error: "UPLOAD_VERIFY_FAILED" },
        { status: 500 },
      );
    return NextResponse.json({ upload: data });
  } catch {
    return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
  }
}

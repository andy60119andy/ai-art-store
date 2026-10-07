import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getGenerationStyle } from "@/lib/ai/style-catalog";
import {
  generationConfigured,
  idempotencySchema,
} from "@/lib/ai/generation-request";
import { uploadInputSchema } from "@/lib/validation/upload";
const schema = uploadInputSchema.extend({
  email: z.string().email(),
  styleKey: z.string().max(120),
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
    body = schema.safeParse(await request.json().catch(() => null));
  if (!key.success || !body.success || !getGenerationStyle(body.data.styleKey))
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  if (body.data.email.toLowerCase() !== user.email?.toLowerCase())
    return NextResponse.json({ error: "EMAIL_MISMATCH" }, { status: 403 });
  const db = createServiceClient(),
    ext =
      body.data.contentType === "image/jpeg"
        ? "jpg"
        : body.data.contentType.split("/")[1],
    path = `${user.id}/${key.data}.${ext}`;
  const { data: existing, error: lookupError } = await db
    .from("uploads")
    .select("id,storage_path,mime_type,size_bytes,verified_at")
    .eq("id", key.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (lookupError)
    return NextResponse.json(
      { error: "UPLOAD_LOOKUP_FAILED" },
      { status: 500 },
    );
  if (
    existing &&
    (existing.storage_path !== path ||
      existing.mime_type !== body.data.contentType ||
      (!existing.verified_at && existing.size_bytes !== body.data.sizeBytes))
  )
    return NextResponse.json(
      { error: "IDEMPOTENCY_CONFLICT" },
      { status: 409 },
    );
  if (existing?.verified_at)
    return NextResponse.json({ uploadId: existing.id, verified: true });
  if (!existing) {
    const { error } = await db
      .from("uploads")
      .insert({
        id: key.data,
        user_id: user.id,
        storage_path: path,
        mime_type: body.data.contentType,
        size_bytes: body.data.sizeBytes,
      });
    if (error && error.code !== "23505")
      return NextResponse.json(
        { error: "UPLOAD_RECORD_FAILED" },
        { status: 500 },
      );
  }
  const { data: signed, error } = await db.storage
    .from("artwork-uploads")
    .createSignedUploadUrl(path);
  if (error || !signed)
    return NextResponse.json({ error: "UPLOAD_SIGN_FAILED" }, { status: 502 });
  return NextResponse.json({
    uploadId: key.data,
    path,
    token: signed.token,
    verified: false,
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadInputSchema } from "@/lib/validation/upload";
import { createServiceClient } from "@/lib/supabase/service";

function extension(contentType: string) {
  return contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json(
      { error: "UPLOAD_SERVICE_NOT_CONFIGURED" },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = uploadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_UPLOAD", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const path = user.id + "/" + id + "." + extension(parsed.data.contentType);
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from("artwork-uploads")
    .createSignedUploadUrl(path);
  if (error)
    return NextResponse.json({ error: "STORAGE_ERROR" }, { status: 500 });

  const { error: rowError } = await supabase.from("uploads").insert({
    user_id: user.id,
    storage_path: path,
    mime_type: parsed.data.contentType,
    size_bytes: parsed.data.sizeBytes,
  });

  if (rowError)
    return NextResponse.json({ error: "UPLOAD_RECORD_ERROR" }, { status: 500 });

  return NextResponse.json({ path, token: data.token });
}

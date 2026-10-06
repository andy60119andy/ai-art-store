import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  path: z.string().min(1).max(500),
  widthPx: z.number().int().positive().max(30000).optional(),
  heightPx: z.number().int().positive().max(30000).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uploads")
    .update({ width_px: parsed.data.widthPx, height_px: parsed.data.heightPx })
    .eq("storage_path", parsed.data.path)
    .eq("user_id", user.id)
    .select("id, storage_path, mime_type, size_bytes, width_px, height_px, created_at")
    .single();

  if (error) return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ upload: data });
}
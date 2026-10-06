import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ART_STYLES } from "@/lib/ai/styles";

const schema = z.object({
  uploadId: z.string().uuid(),
  styleKey: z.string(),
  prompt: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const style = ART_STYLES.find((item) => item.key === parsed.data.styleKey);
  if (!style) return NextResponse.json({ error: "INVALID_STYLE" }, { status: 400 });

  const supabase = await createClient();
  const { data: upload } = await supabase.from("uploads").select("id, storage_path").eq("id", parsed.data.uploadId).eq("user_id", user.id).single();
  if (!upload) return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: 404 });

  const { data: job, error } = await supabase.from("generation_jobs").insert({
    user_id: user.id,
    upload_id: upload.id,
    style_key: style.key,
    prompt: [style.prompt, parsed.data.prompt].filter(Boolean).join(", "),
    status: "queued",
  }).select("id, status, style_key, created_at").single();

  if (error) return NextResponse.json({ error: "GENERATION_JOB_CREATE_FAILED" }, { status: 500 });
  return NextResponse.json({ job });
}
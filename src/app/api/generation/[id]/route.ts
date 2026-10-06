import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("generation_jobs")
    .select("id, status, style_key, error_message, created_at, started_at, completed_at")
    .eq("id", id).eq("user_id", user.id).single();

  if (error) return NextResponse.json({ error: "GENERATION_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ job: data });
}
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("id, title, status, created_at, updated_at, artwork_versions(id, storage_path, width_px, height_px, version_no, created_at)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "ARTWORK_NOT_FOUND" }, { status: 404 });

  const versions = await Promise.all((data.artwork_versions ?? []).map(async (version) => {
    const { data: signed } = await supabase.storage.from("artwork-uploads").createSignedUrl(version.storage_path, 3600);
    return { ...version, signedUrl: signed?.signedUrl ?? null };
  }));

  return NextResponse.json({ artwork: { ...data, artwork_versions: versions } });
}

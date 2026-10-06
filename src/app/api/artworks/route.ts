import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select("id, title, status, created_at, updated_at, artwork_versions(id, storage_path, width_px, height_px, version_no, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "ARTWORKS_FETCH_FAILED" }, { status: 500 });

  const artworks = await Promise.all((data ?? []).map(async (artwork) => {
    const versions = await Promise.all((artwork.artwork_versions ?? []).map(async (version) => {
      const { data: signed } = await supabase.storage.from("artwork-uploads").createSignedUrl(version.storage_path, 3600);
      return { ...version, signedUrl: signed?.signedUrl ?? null };
    }));
    return { ...artwork, artwork_versions: versions };
  }));

  return NextResponse.json({ artworks });
}

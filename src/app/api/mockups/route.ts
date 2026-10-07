import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "artwork-uploads";
const MIN_MM = 100;
const MAX_WIDTH_MM = 3000;
const MAX_HEIGHT_MM = 6000;

function frameColor(frame: { color: string | null; material: string | null }) {
  if (frame.color?.includes("黑")) return { outer: "#171717", inner: "#303030" };
  if (frame.color?.includes("原木") || frame.material?.includes("木")) return { outer: "#8a5a32", inner: "#c28b5a" };
  return { outer: "#444444", inner: "#666666" };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const artworkId = body?.artworkId;
  const sizeId = typeof body?.sizeId === "string" && body.sizeId.length > 0 ? body.sizeId : null;
  const frameId = body?.frameId;
  const paperId = body?.paperId;
  const customWidthMm = body?.customWidthMm == null ? null : Math.floor(Number(body.customWidthMm));
  const customHeightMm = body?.customHeightMm == null ? null : Math.floor(Number(body.customHeightMm));
  const isCustom = customWidthMm !== null || customHeightMm !== null;
  const widthForValidation = customWidthMm ?? -1;
  const heightForValidation = customHeightMm ?? -1;

  if (![artworkId, frameId, paperId].every((v) => typeof v === "string" && v.length > 0)) {
    return NextResponse.json({ error: "INVALID_SELECTION" }, { status: 400 });
  }
  if (isCustom) {
    if (!Number.isFinite(widthForValidation) || !Number.isFinite(heightForValidation) ||
      widthForValidation < MIN_MM || widthForValidation > MAX_WIDTH_MM ||
      heightForValidation < MIN_MM || heightForValidation > MAX_HEIGHT_MM) {
      return NextResponse.json({ error: "INVALID_CUSTOM_SIZE" }, { status: 400 });
    }
  } else if (!sizeId) {
    return NextResponse.json({ error: "INVALID_SIZE" }, { status: 400 });
  }

  const supabase = await createClient();
  const [{ data: artwork }, { data: size }, { data: frame }, { data: paper }, { data: template }] = await Promise.all([
    supabase.from("artworks").select("id").eq("id", artworkId).eq("user_id", user.id).maybeSingle(),
    sizeId ? supabase.from("product_sizes").select("id,width_mm,height_mm").eq("id", sizeId).eq("active", true).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("frames").select("id,name,material,color").eq("id", frameId).eq("active", true).maybeSingle(),
    supabase.from("papers").select("id,name").eq("id", paperId).eq("active", true).maybeSingle(),
    supabase.from("frame_templates").select("border_px,mat_px,shadow_px").eq("frame_id", frameId).eq("active", true).maybeSingle()
  ]);

  if (!artwork || !frame || !paper || (!isCustom && !size)) {
    return NextResponse.json({ error: "INVALID_SELECTION" }, { status: 400 });
  }

  const { data: version } = await supabase.from("artwork_versions")
    .select("storage_path,width_px,height_px")
    .eq("artwork_id", artworkId)
    .order("version_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!version) return NextResponse.json({ error: "ARTWORK_VERSION_NOT_FOUND" }, { status: 404 });

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(version.storage_path, 300);
  if (!signed?.signedUrl) return NextResponse.json({ error: "SOURCE_URL_FAILED" }, { status: 500 });

  const source = await fetch(signed.signedUrl);
  if (!source.ok) return NextResponse.json({ error: "SOURCE_FETCH_FAILED" }, { status: 502 });
  const input = Buffer.from(await source.arrayBuffer());

  const templateValues = template ?? { border_px: 48, mat_px: 28, shadow_px: 30 };
  const framePx = Math.max(32, Math.min(96, templateValues.border_px));
  const matPx = Math.max(12, Math.min(64, templateValues.mat_px));
  const shadowPx = Math.max(12, Math.min(48, templateValues.shadow_px));
  const targetWidthMm = isCustom ? widthForValidation : size!.width_mm;
  const targetHeightMm = isCustom ? heightForValidation : size!.height_mm;
  const artW = 720;
  const artH = Math.max(240, Math.round(artW * (targetHeightMm / targetWidthMm)));
  const innerW = artW + matPx * 2;
  const innerH = artH + matPx * 2;
  const canvasW = innerW + framePx * 2 + shadowPx * 2;
  const canvasH = innerH + framePx * 2 + shadowPx * 2;
  const colors = frameColor(frame);

  const resized = await sharp(input).resize(artW, artH, { fit: "cover", position: "centre" }).png().toBuffer();
  const matte = await sharp({
    create: { width: innerW, height: innerH, channels: 4, background: "#f7f4ee" }
  }).png().toBuffer();

  const framed = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: "#f1ede5" }
  })
    .composite([
      { input: Buffer.from(`<svg width="${canvasW}" height="${canvasH}"><rect width="100%" height="100%" fill="#d8d1c6"/><rect x="${shadowPx}" y="${shadowPx}" width="${canvasW-shadowPx*2}" height="${canvasH-shadowPx*2}" rx="8" fill="#111" opacity=".18"/></svg>`) },
      { input: Buffer.from(`<svg width="${canvasW}" height="${canvasH}"><rect x="${shadowPx}" y="${shadowPx}" width="${canvasW-shadowPx*2}" height="${canvasH-shadowPx*2}" fill="${colors.outer}"/><rect x="${shadowPx+framePx}" y="${shadowPx+framePx}" width="${innerW}" height="${innerH}" fill="${colors.inner}"/></svg>`) },
      { input: matte, left: shadowPx + framePx, top: shadowPx + framePx },
      { input: resized, left: shadowPx + framePx + matPx, top: shadowPx + framePx + matPx }
    ])
    .png()
    .toBuffer();

  const path = `${user.id}/mockups/${crypto.randomUUID()}.png`;
  const upload = await supabase.storage.from(BUCKET).upload(path, framed, { contentType: "image/png", upsert: false });
  if (upload.error) return NextResponse.json({ error: "MOCKUP_UPLOAD_FAILED" }, { status: 500 });

  const { data: mockup, error } = await supabase.from("mockups").insert({
    user_id: user.id,
    artwork_id: artworkId,
    size_id: sizeId,
    frame_id: frameId,
    paper_id: paperId,
    custom_width_mm: isCustom ? widthForValidation : null,
    custom_height_mm: isCustom ? heightForValidation : null,
    storage_path: path,
    width_px: canvasW,
    height_px: canvasH
  }).select("id,storage_path,width_px,height_px,created_at").single();

  if (error || !mockup) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "MOCKUP_SAVE_FAILED" }, { status: 500 });
  }

  const { data: preview } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return NextResponse.json({ mockup, signedUrl: preview?.signedUrl ?? null });
}

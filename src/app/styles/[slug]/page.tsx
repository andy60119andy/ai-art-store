import { notFound } from "next/navigation";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import StyleDetail from "@/components/site/StyleDetail";
export function generateStaticParams() {
  return REFERENCE_GALLERY.map((s) => ({ slug: s.key }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = REFERENCE_GALLERY.find((s) => s.key === slug);
  return { title: s ? `${s.name} | AI ART STORE` : "藝術風格" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = REFERENCE_GALLERY.find((s) => s.key === slug);
  if (!s) notFound();
  return <StyleDetail style={s} />;
}

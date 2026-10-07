import { notFound, redirect } from "next/navigation";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import { OCCASION_COLLECTIONS } from "@/lib/ai/collections";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (REFERENCE_GALLERY.some((s) => s.key === slug))
    redirect(`/styles/${slug}`);
  if (OCCASION_COLLECTIONS.some((s) => s.slug === slug))
    redirect(`/occasions/${slug}`);
  if (slug === "my-orders") redirect("/orders");
  notFound();
}

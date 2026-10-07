import { notFound } from "next/navigation";
import { GIFT_COLLECTIONS } from "@/lib/ai/collections";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import { CollectionPage } from "@/components/site/InnerPage";
export function generateStaticParams() {
  return GIFT_COLLECTIONS.map((s) => ({ slug: s.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = GIFT_COLLECTIONS.find((s) => s.slug === slug);
  if (!item) notFound();
  return (
    <CollectionPage
      title={item.name}
      subtitle={item.subtitle}
      image={`/images/reference/styles/${item.image}-thumb.webp`}
      styles={REFERENCE_GALLERY.filter((s) =>
        (item.categories as readonly string[]).includes(s.category),
      )}
      parent={{ name: "送禮靈感", href: "/gift-ideas" }}
    />
  );
}

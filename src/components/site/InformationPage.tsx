import Link from "next/link";
import { Breadcrumb } from "./InnerPage";
export default function InformationPage({
  title,
  kicker,
  description,
  sections,
}: {
  title: string;
  kicker: string;
  description: string;
  sections: { title: string; text: string }[];
}) {
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title={title} />
      <section className="arto-container arto-section clone-information">
        <span className="arto-eyebrow">{kicker}</span>
        <h1>{title}</h1>
        <p className="clone-info-lead">{description}</p>
        {sections.map((s) => (
          <article key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
        <Link href="/contact" className="arto-outline">
          查看聯絡入口 →
        </Link>
      </section>
    </main>
  );
}

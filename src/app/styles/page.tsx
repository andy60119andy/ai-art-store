import Link from "next/link";
import { Breadcrumb, InnerCTA, StyleCards } from "@/components/site/InnerPage";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
const groups = [
  {
    name: "繪畫與色彩",
    category: "Art",
    description: "水彩、油畫與普普藝術，為生活帶來豐富的色彩。",
  },
  {
    name: "線條與極簡",
    category: "Home",
    description: "俐落的構圖與留白，搭配現代居家。",
  },
  {
    name: "卡通與動畫",
    category: "Cartoon",
    description: "用充滿想像力的角色，重現照片裡的個性。",
  },
  {
    name: "寵物與陪伴",
    category: "Pets",
    description: "把家裡最可愛的成員，變成畫面的主角。",
  },
  {
    name: "情侶與婚禮",
    category: "Couples",
    description: "用畫作珍藏兩個人的日常與重要時刻。",
  },
  {
    name: "家庭與人像",
    category: "Family",
    description: "為合照與家庭故事，找到溫暖的筆觸。",
  },
  {
    name: "婚禮紀念",
    category: "Wedding",
    description: "從婚紗照到場地與花束，留住那一天。",
  },
  {
    name: "車輛與生活",
    category: "Vehicles",
    description: "將喜歡的車、船與生活風景做成專屬藝術。",
  },
  {
    name: "人像與里程碑",
    category: "Portrait",
    description: "畢業、誕生與紀念，收藏值得記住的時刻。",
  },
  {
    name: "藝術禮物",
    category: "Gifts",
    description: "用一張照片，送出一份專屬心意。",
  },
];
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title="全部藝術風格" />
      <section className="arto-index-hero arto-container">
        <span className="arto-eyebrow">EVERY STYLE IN ONE PLACE</span>
        <h1>
          找到屬於你的
          <br />
          <em>藝術風格</em>
        </h1>
        <p>
          從溫柔水彩到鮮明普普藝術，從個人人像到一家人的故事。探索 79
          種參考風格，找到你喜歡的畫面。
        </p>
        <div>
          <Link className="arto-button" href="/shop">
            瀏覽風格圖庫 →
          </Link>
          <Link className="arto-outline" href="/gift-ideas">
            尋找送禮靈感
          </Link>
        </div>
      </section>
      <nav
        className="arto-category-jumps arto-container"
        aria-label="風格分類捷徑"
      >
        {groups.map((g) => (
          <a key={g.category} href={`#category-${g.category}`}>
            {g.name}
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <section
          className="arto-section arto-container arto-category-section"
          id={`category-${g.category}`}
          key={g.category}
        >
          <h2>{g.name}</h2>
          <p>{g.description}</p>
          <StyleCards
            styles={REFERENCE_GALLERY.filter((s) => s.category === g.category)}
          />
        </section>
      ))}
      <InnerCTA />
    </main>
  );
}

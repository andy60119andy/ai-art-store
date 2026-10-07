export const ART_STYLES = [
  { key: "oil-painting", name: "油畫", prompt: "rich oil painting texture, museum-quality brushwork" },
  { key: "watercolor", name: "水彩", prompt: "delicate watercolor illustration, soft paper texture" },
  { key: "japanese-illustration", name: "日系插畫", prompt: "clean Japanese illustration, expressive details" },
  { key: "retro-poster", name: "復古海報", prompt: "vintage poster illustration, tasteful print texture" },
  { key: "minimalist", name: "極簡藝術", prompt: "minimal contemporary art, refined composition" },
  { key: "pencil-sketch", name: "鉛筆素描", prompt: "detailed graphite pencil drawing, natural paper texture" },
  { key: "pop-art", name: "普普藝術", prompt: "bold graphic pop art, high contrast, clean shapes" },
  { key: "storybook", name: "繪本插畫", prompt: "warm storybook illustration, charming hand-painted detail" },
  { key: "cinematic", name: "電影感", prompt: "cinematic portrait, dramatic but natural lighting, rich depth" },
  { key: "ink-wash", name: "水墨", prompt: "elegant East Asian ink wash painting, expressive brushwork" },
  { key: "line-art", name: "線稿", prompt: "refined minimalist line art, clean negative space" },
  { key: "vintage-film", name: "復古底片", prompt: "timeless vintage film portrait, subtle grain, editorial composition" },
] as const;
export type ArtStyleKey = (typeof ART_STYLES)[number]["key"];
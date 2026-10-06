export const ART_STYLES = [
  { key: "oil-painting", name: "油畫", prompt: "rich oil painting texture, museum-quality brushwork" },
  { key: "watercolor", name: "水彩", prompt: "delicate watercolor illustration, soft paper texture" },
  { key: "japanese-illustration", name: "日系插畫", prompt: "clean Japanese illustration, expressive details" },
  { key: "retro-poster", name: "復古海報", prompt: "vintage poster illustration, tasteful print texture" },
  { key: "minimalist", name: "極簡藝術", prompt: "minimal contemporary art, refined composition" },
] as const;

export type ArtStyleKey = (typeof ART_STYLES)[number]["key"];
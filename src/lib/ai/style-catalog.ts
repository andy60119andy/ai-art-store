import { REFERENCE_GALLERY } from "./reference-gallery";
import { ART_STYLES } from "./styles";
const treatments: Record<string, string> = {
  Cartoon:
    "stylized cartoon illustration with expressive features and clean contours",
  Art: "fine art painting with intentional brushwork and a coherent palette",
  Pets: "detailed animal portrait preserving breed, markings, anatomy and expression",
  Couples:
    "warm romantic portrait preserving both subjects and their natural interaction",
  Wedding:
    "elegant celebratory illustration preserving people, venue and meaningful details",
  Gifts: "personal gift illustration with a cohesive artistic composition",
  Family:
    "warm family illustration preserving every person's identity and position",
  Home: "architectural illustration preserving building shape and recognizable details",
  Vehicles:
    "automotive illustration preserving mechanical details and proportions",
  Portrait:
    "expressive artistic portrait preserving identity and facial structure",
};
const special: Record<string, string> = {
  "anime-portrait":
    "Japanese anime illustration, expressive eyes, clean linework and cel shading",
  "watercolor-portrait":
    "transparent watercolor washes, delicate pigments, soft paper texture",
  "oil-painting-portrait":
    "layered oil paint, visible brushwork, rich texture and nuanced lighting",
  "minimalist-line-art-portrait":
    "minimal continuous contour lines, clean negative space, restrained detail",
  "pencil-sketch-portrait":
    "graphite pencil drawing with delicate hatching and paper texture",
  "royal-pet-portrait":
    "regal animal portrait in an ornate historical costume, painted dramatic lighting",
  "pop-art-portrait":
    "graphic pop art, bold color blocks, halftone texture and strong outlines",
  "comic-book-portrait":
    "comic illustration with ink outlines, halftone shadows and dynamic composition",
  "ghibli-portrait":
    "warm hand-painted Japanese animation, watercolor scenery and gentle natural lighting",
  "pixar-portrait":
    "polished three-dimensional animated character portrait with expressive features",
};
export const GENERATION_STYLES = REFERENCE_GALLERY.map((s) => ({
  ...s,
  prompt: `${special[s.key] ?? treatments[s.category] ?? treatments.Portrait}. Visual direction: ${s.name.replace(/Portrait|Print|Poster/g, "").trim()}. Preserve source subjects; do not add text or new people.`,
}));
export function getGenerationStyle(key: string) {
  return (
    GENERATION_STYLES.find((s) => s.key === key) ??
    ART_STYLES.find((s) => s.key === key)
  );
}

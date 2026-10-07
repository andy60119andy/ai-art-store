import { describe, it, expect } from "vitest";
import { GENERATION_STYLES, getGenerationStyle } from "./style-catalog";
import { REFERENCE_GALLERY } from "./reference-gallery";
describe("style routing", () => {
  it("resolves every displayed style to a generation configuration", () => {
    expect(GENERATION_STYLES).toHaveLength(79);
    for (const s of REFERENCE_GALLERY) {
      expect(getGenerationStyle(s.key)?.key).toBe(s.key);
      expect(getGenerationStyle(s.key)?.prompt.length).toBeGreaterThan(30);
    }
  });
  it("keeps existing links compatible and rejects unknown styles", () => {
    expect(getGenerationStyle("watercolor")?.name).toBe("水彩");
    expect(getGenerationStyle("made-up-style")).toBeUndefined();
  });
});

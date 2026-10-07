import { describe, it, expect } from "vitest";
import { mockupMatchesSelection } from "./mockup";
const preview = {
  artwork_id: "art",
  frame_id: "wood",
  paper_id: "matte",
  size_id: null,
  custom_width_mm: 600,
  custom_height_mm: 900,
};
const selection = {
  artworkId: "art",
  frameId: "wood",
  paperId: "matte",
  sizeId: null,
  customWidthMm: 600,
  customHeightMm: 900,
};
describe("cart preview validation", () => {
  it("accepts the exact custom print shown in the preview", () =>
    expect(mockupMatchesSelection(preview, selection)).toBe(true));
  it("rejects a changed print width", () =>
    expect(
      mockupMatchesSelection(preview, { ...selection, customWidthMm: 1200 }),
    ).toBe(false));
  it("rejects switching a custom preview to standard size", () =>
    expect(
      mockupMatchesSelection(preview, {
        ...selection,
        sizeId: "a3",
        customWidthMm: null,
        customHeightMm: null,
      }),
    ).toBe(false));
  it("rejects a changed frame or paper", () => {
    expect(
      mockupMatchesSelection(preview, { ...selection, frameId: "black" }),
    ).toBe(false);
    expect(
      mockupMatchesSelection(preview, { ...selection, paperId: "gloss" }),
    ).toBe(false);
  });
});

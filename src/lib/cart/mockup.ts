export function mockupMatchesSelection(
  mockup: {
    artwork_id: string;
    frame_id: string;
    paper_id: string;
    size_id: string | null;
    custom_width_mm: number | null;
    custom_height_mm: number | null;
  },
  selection: {
    artworkId: string;
    frameId: string;
    paperId: string;
    sizeId: string | null;
    customWidthMm: number | null;
    customHeightMm: number | null;
  },
) {
  return (
    mockup.artwork_id === selection.artworkId &&
    mockup.frame_id === selection.frameId &&
    mockup.paper_id === selection.paperId &&
    mockup.size_id === selection.sizeId &&
    mockup.custom_width_mm === selection.customWidthMm &&
    mockup.custom_height_mm === selection.customHeightMm
  );
}

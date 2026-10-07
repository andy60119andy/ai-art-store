import Image from "next/image";
export default function LargeFormatScene({
  width = 120,
  height = 90,
  image = "/images/large-format/abstract-landscape.svg",
}: {
  width?: number;
  height?: number;
  image?: string;
}) {
  const ratio = width / height;
  const artWidth = Math.min(76, (52 / 1.18) * ratio);
  return (
    <div
      className="lf-scene"
      role="img"
      aria-label={`${width} × ${height} 公分藝術作品空間比例示意`}
    >
      <div className="lf-scene-window" />
      <span className="lf-scene-tag">ART IN YOUR SPACE</span>
      <div
        className="lf-wall-art"
        style={{ width: `${artWidth}%`, aspectRatio: ratio, maxHeight: "58%" }}
      >
        <Image src={image} alt="" fill sizes="(max-width:700px) 85vw, 550px" />
        <span className="lf-art-dimension">
          {width} × {height} cm
        </span>
      </div>
      <div className="lf-console">
        <div />
        <div />
        <div />
      </div>
      <div className="lf-vase" />
      <div className="lf-scene-floor" />
      <span className="lf-scene-caption">空間示意 · 畫面依選擇比例裁切</span>
    </div>
  );
}

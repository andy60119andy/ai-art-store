import InformationPage from "@/components/site/InformationPage";
export default function Page() {
  return (
    <InformationPage
      {...{
        title: "關於 AI ART STORE",
        kicker: "OUR STORY",
        description: "從照片裡的回憶，到空間裡的藝術。",
        sections: [
          {
            title: "創作與印刷一起規劃",
            text: "結合 AI 藝術探索與家族大圖輸出經驗，讓照片創作、尺寸與配框形成完整的選擇流程。",
          },
          {
            title: "120 cm 可印幅寬",
            text: "長幅作品可依需求規劃，實際製作需要確認圖像解析度、材料、加工及運送。",
          },
          {
            title: "先看見，再決定",
            text: "目前為內部測試，可探索風格與配框效果；AI 生成、正式報價與結帳需待服務接通。",
          },
        ],
      }}
    />
  );
}

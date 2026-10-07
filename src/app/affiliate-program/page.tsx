import InformationPage from "@/components/site/InformationPage";
export default function Page() {
  return (
    <InformationPage
      {...{
        title: "合作提案",
        kicker: "PARTNER WITH US",
        description: "為創作者、設計師與空間規劃者保留合作入口。",
        sections: [
          {
            title: "適合的合作方向",
            text: "藝術內容介紹、居家搭配、送禮提案，以及店面與商業空間的作品規劃。",
          },
          {
            title: "合作流程",
            text: "可透過聯絡頁留下你的作品類型、合作構想與需求。",
          },
          {
            title: "目前狀態",
            text: "合作方案仍在規劃，尚未啟用佣金、追蹤連結、付款或結算服務。",
          },
        ],
      }}
    />
  );
}

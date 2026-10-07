import InformationPage from "@/components/site/InformationPage";
export default function Page() {
  return (
    <InformationPage
      {...{
        title: "售後與修改說明",
        kicker: "INTERNAL TEST · AFTERCARE",
        description: "正式付款與訂製交易尚未啟用，目前沒有可執行的退款流程。",
        sections: [
          {
            title: "作品修改",
            text: "服務接通後可明確發起另一個生成任務；生成結果可能不同，請確認作品後再規劃印刷。",
          },
          {
            title: "製作前確認",
            text: "印刷前需確認尺寸、裁切、解析度、帆布材質，不能只依情境示意圖投入生產。",
          },
          {
            title: "正式售後方案",
            text: "退款、取消、重印、配送與瑕疵處理條件待正式營運前確認，不沿用其他商家的承諾。",
          },
        ],
      }}
    />
  );
}

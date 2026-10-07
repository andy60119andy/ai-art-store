import InformationPage from "@/components/site/InformationPage";
export default function Page() {
  return (
    <InformationPage
      {...{
        title: "服務使用說明",
        kicker: "INTERNAL TEST · SERVICE",
        description: "目前網站用於測試操作流程，尚未開放正式交易。",
        sections: [
          {
            title: "風格與作品",
            text: "展示圖片用於風格參考，不代表你的照片已生成；實際成果依來源照片與模型而異。",
          },
          {
            title: "尺寸與預覽",
            text: "牆面與配框畫面為視覺示意，實際製作尺寸、品質、材質與價格需要另行確認。",
          },
          {
            title: "交易狀態",
            text: "付款入口保持停用，此站的預覽及需求提交不構成付款或生產承諾。",
          },
          {
            title: "正式條款",
            text: "公司資料、交易規則及完整條款將於正式營運前補齊。",
          },
        ],
      }}
    />
  );
}

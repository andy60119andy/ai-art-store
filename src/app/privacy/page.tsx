import InformationPage from "@/components/site/InformationPage";
export default function Page() {
  return (
    <InformationPage
      {...{
        title: "隱私與資料說明",
        kicker: "INTERNAL TEST · PRIVACY",
        description:
          "這是目前測試流程的資料使用說明，正式政策需在對外營運前確認。",
        sections: [
          {
            title: "照片與創作資料",
            text: "選圖時先在你的分頁預覽；按下生成後，服務接通時才會上傳至本站私有儲存並交由 AI 服務處理。",
          },
          {
            title: "帳戶與存取",
            text: "作品與訂單依登入帳戶限制存取，不會因為填入他人的信箱就取得作品。",
          },
          {
            title: "聯絡表單",
            text: "收件服務啟用後，需求會儲存供客服查閱；不會自動寄信給第三方。",
          },
          {
            title: "保留與刪除",
            text: "正式保留期間與刪除流程尚待確認，請勿在內測站上傳敏感資料。",
          },
        ],
      }}
    />
  );
}

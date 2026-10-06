# TASK-016 — 真實畫框 Mockup

## 完成內容
- 使用 Sharp 在伺服器端產生確定性的 PNG 畫框 Mockup。
- 來源只允許目前登入會員自己的 artwork。
- 尺寸、畫框、紙張均重新從啟用中的 catalog 驗證。
- 生成後存回私有 Supabase Storage。
- mockups table 保存作品與商品配置的關聯。
- 前端可在選定作品與規格後生成實際成品預覽。

## 安全
- Mockup API 不接受任意 storage path。
- 所有來源 artwork 先驗證 user_id。
- Storage 維持 private，僅回傳短期 signed URL。
- Mockup 輸出檔名使用 UUID。

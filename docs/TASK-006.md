# TASK-006 — 真實 AI 生圖 Provider 與結果儲存

已完成：
- 接入 OpenAI Images API 的 image edit 流程。
- 使用會員自己的 Supabase Storage 私有圖片作為輸入。
- 生成後把 PNG 寫回 artwork-uploads/{userId}/generations/{jobId}.png。
- 建立 artworks 與 artwork_versions。
- generation job 會從 queued → processing → succeeded/failed。
- /api/generation/{id}/process 提供實際生成入口。
- 生成頁會建立任務後立即執行處理。

環境變數：
- OPENAI_API_KEY
- OPENAI_IMAGE_MODEL（預設 gpt-image-2）
- OPENAI_IMAGE_SIZE（預設 1024x1024）

注意：
1. OpenAI API 金鑰只能放在伺服器環境變數，不能放在瀏覽器。
2. Supabase 的 supabase/storage.sql 必須先在實際 Supabase 專案執行，才能使用私有 bucket。
3. 目前 process route 是同步 HTTP 處理；下一階段會改成背景 worker/queue、重試、冪等與成本/點數控管。

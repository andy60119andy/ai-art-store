# 綠界金流與宅配啟用

本次延續既有綠界全方位金流，結帳幣別 TWD。首頁 USD 價格為參考，不會自動當作台幣金額收款。

1. 建立／連結 Supabase，依序套用 migrations，包含 `0014_canvas_checkout.sql` 與 `0015_mainland_canvas_backend.sql`。
2. 在商品目錄確認帆布產品與三種標準尺寸（203×254、406×508、610×762 mm），設定實際台幣售價。舊紙張與外框購物車必須重新選擇商品。
3. 在資料庫 `checkout_settings` 設定 shipping_fee_twd 與 enabled=true。運費以資料庫為唯一計價來源，未設定禁止建立訂單。
4. 在 Vercel 設定 NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY、NEXT_PUBLIC_APP_URL，以及 ECPAY_MERCHANT_ID、ECPAY_HASH_KEY、ECPAY_HASH_IV、ECPAY_MODE=test。正式金鑰直接輸入 Vercel，不貼到聊天。
5. 使用綠界測試環境核對成功／失敗付款、重複回呼、錯誤金額及簽章。測試付款不建立實際出貨單。
6. 驗證後將 ECPAY_MODE 改為 production 並設定正式商家金鑰。

已付款正式訂單自動建立待出貨記錄；後台填入物流商及追蹤單號，更新宅配狀態。尚未串接物流商預約取件、電子託運單或運費報價 API；需要另選承運商並連結商家帳戶。

未取得資料庫與商家設定前，結帳保持不可收款。資料庫更新尚未在正式資料庫執行。

本島配送與帆布商品後端：套用 0015 後可到 /admin/store-settings 設定台幣基本售價、各尺寸加價、確認售價與宅配運費。配送排除離島（含綠島、蘭嶼、小琉球、旗津）及海外；管理員須確認郵遞區號與實際地址一致。資料庫、AI 與支付設定缺失時不宣稱服務已接通。PayPal 個人帳戶尚未串接正式網站結帳。

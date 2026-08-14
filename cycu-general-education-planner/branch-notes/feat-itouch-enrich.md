分支：feat/itouch-enrich

目的：實作 server-side 或自動化流程來比對 iTouch 官方開課資料，並將準確開課資訊回寫至 recommendations（enriched）。

嘗試項目：
- 建立 Node 腳本（Puppeteer）模擬 iTouch 查詢並抓取課程資料（注意：需處理登入或 SPA 動態資料與 CORS）。
- 或使用學校公開 API（若有）來取得課程清單。
- 將抓到的欄位（班別、時段、教室、開班狀態）寫入 recommendations 的對應記錄（verified=true, time, room）。

備註：此分支會包含 server-side 腳本範例與說明，將另建 `scripts/enrich_itouch.js`。請先確認是否允許在 repo 中加入 Puppeteer 依賴。

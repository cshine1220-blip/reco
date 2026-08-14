分支：feat/ci-enrichment

目的：在 CI（GitHub Actions）中加入 enrichment 工作流程，定期抓取外部推薦來源、比對官方課程資料，並自動 commit 回 repo（或建立 pull request）。

嘗試項目：
- 撰寫 Action Workflow（例如 `.github/workflows/enrich.yml`），每日或每次 PR 觸發。 
- 在 workflow 中執行 `scripts/update_recommendations.js` 或 `scripts/enrich_itouch.js`，將結果 commit。
- 處理 GITHUB_TOKEN 權限與推送策略（直接 push 或建立 PR）。

備註：此分支會包含 Actions 範例與 workflow 模板，並說明權限需求。請確認 repository 的 Actions 權限允許 workflows 推送。

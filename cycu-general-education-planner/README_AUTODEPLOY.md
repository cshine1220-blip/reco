自動化更新與 GitHub Pages 部署說明

1. 將本資料夾推到 GitHub（例如儲存庫根目錄包含 outputs/ 資料夾）：
   - 建議 main 分支為部署分支

2. GitHub Actions 工作流程：
   - `.github/workflows/update-recommendations.yml`：排程每天執行 `npm run update:recs`，將 RSS 文章加入 `recommendations.json` 並自動提交。
   - `.github/workflows/deploy_pages.yml`：當 `main` 有 push 時，將 `outputs/cycu-general-education-planner` 發佈到 GitHub Pages。

3. 設定說明：
   - 編輯 `feeds.json`，填入你想定期抓取的 RSS 或站台。
   - 若使用私有 repo，確認 `GITHUB_TOKEN` 權限允許 actions 提交與 pages 發佈。

4. 本地測試：
   - 在 `outputs/cycu-general-education-planner` 執行：

```bash
npm install
npm run update:recs
```

完成後 `recommendations.json` 會更新。

5. 注意事項：
   - RSS 或網站不得違反對方使用條款。若要抓取社群平台（如 Threads/Dcard），需使用平台 API 或依平台規定。
   - 自動插入的內容標為 `verified: false`，後續可由人工或自動化流程核對。

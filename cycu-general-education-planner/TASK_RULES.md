任務規則（專案層級）

1) 每次執行修改或重要操作前，先備份 `index.html` 並在備份檔名加入進度標記。

使用方式（在該資料夾執行 PowerShell）：

```
# 範例：標記為 pre-edit
.
./save_snapshot.ps1 'pre-edit'
```

備份會放在 `backups/` 資料夾，檔名範例：

`index.html.20260814-142530.pre-edit.bak`

2) 我（助理）會在每次要修改 `index.html` 前，提醒並執行該腳本以符合此規則。

3) 若要自動化或改成其他命名規則，請指示要採用的格式。
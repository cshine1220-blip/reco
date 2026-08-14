Param(
  [string]$status = "work"
)

# 將目前目錄切成腳本所在資料夾，並建立 backups 目錄
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not (Test-Path $scriptDir)) { $scriptDir = Get-Location }
$backups = Join-Path $scriptDir "backups"
if (-not (Test-Path $backups)) { New-Item -ItemType Directory -Path $backups | Out-Null }

# 產生時間戳與目標檔名
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$label = ($status -replace '\\s+', '_')
$src = Join-Path $scriptDir "index.html"
$dest = Join-Path $backups ("index.html.$timestamp.$label.bak")

if (Test-Path $src) {
  Copy-Item -Path $src -Destination $dest -Force
  Write-Output "Saved snapshot: $dest"
} else {
  Write-Output "Source file not found: $src"
}

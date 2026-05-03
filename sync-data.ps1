$src = "$PSScriptRoot\results"
$dst = "$PSScriptRoot\frontend\public\data"

New-Item -ItemType Directory -Force -Path $dst | Out-Null

Copy-Item "$src\summary.json"           "$dst\summary.json"           -Force
Copy-Item "$src\summary_insample.json"  "$dst\summary_insample.json"  -Force
Copy-Item "$src\summary_oos.json"       "$dst\summary_oos.json"       -Force
Copy-Item "$src\orb_trades_full.csv"    "$dst\orb_trades_full.csv"    -Force
Copy-Item "$src\orb_trades_insample.csv" "$dst\orb_trades_insample.csv" -Force
Copy-Item "$src\orb_trades_oos.csv"     "$dst\orb_trades_oos.csv"     -Force

Write-Host "Synced results -> frontend/public/data" -ForegroundColor Green

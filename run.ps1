# Run the backtester
# Usage: .\run.ps1 [data_dir] [starting_balance]
# Example: .\run.ps1 ..\quant\data 10000
param(
    [string]$DataDir = "..\quant\data",
    [double]$Balance = 10000
)
java -cp out com.trading.Main $DataDir $Balance

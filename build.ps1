# Compile all Java sources into out/
$src = Get-ChildItem -Path "src" -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
New-Item -ItemType Directory -Force -Path "out" | Out-Null
Write-Host "Compiling $($src.Count) source files..."
javac -encoding UTF-8 -d out $src
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Run with: .\run.ps1"
} else {
    Write-Host "Build FAILED."
}

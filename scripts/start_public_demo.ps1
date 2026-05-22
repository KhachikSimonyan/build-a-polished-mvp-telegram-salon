param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\.."),
  [string]$Port = "3000"
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectRoot

$cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflared)) {
  throw "cloudflared was not found. Install it with: winget install --id Cloudflare.cloudflared -e"
}

$logDir = Join-Path $ProjectRoot ".demo"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$outLog = Join-Path $logDir "cloudflared.out.log"
$errLog = Join-Path $logDir "cloudflared.err.log"
Remove-Item -LiteralPath $outLog, $errLog -Force -ErrorAction SilentlyContinue

Write-Host "Starting local app..."
& "$PSScriptRoot\start_demo.ps1" -ProjectRoot $ProjectRoot -Port $Port

Write-Host "Starting public Cloudflare tunnel..."
Start-Process -FilePath $cloudflared -ArgumentList @("tunnel", "--url", "http://localhost:$Port") -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WindowStyle Hidden

$publicUrl = ""
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1
  $logText = ""
  if (Test-Path $outLog) { $logText += "`n" + (Get-Content -Path $outLog -Raw -ErrorAction SilentlyContinue) }
  if (Test-Path $errLog) { $logText += "`n" + (Get-Content -Path $errLog -Raw -ErrorAction SilentlyContinue) }
  $match = [regex]::Match($logText, "https://[a-z0-9-]+\.trycloudflare\.com")
  if ($match.Success) {
    $publicUrl = $match.Value
    break
  }
}

if (-not $publicUrl) {
  throw "Could not read Cloudflare public URL. Check .demo/cloudflared.err.log"
}

$envPath = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envPath)) {
  Copy-Item ".env.demo.example" ".env"
}

$envContent = Get-Content -Path $envPath -Raw
$envContent = [regex]::Replace($envContent, "(?m)^BASE_URL=.*$", "BASE_URL=$publicUrl")
$envContent = [regex]::Replace($envContent, "(?m)^DISABLE_TELEGRAM_BOT=.*$", "DISABLE_TELEGRAM_BOT=")
[System.IO.File]::WriteAllText((Resolve-Path $envPath), $envContent, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Restarting app so Telegram uses the public URL..."
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like "*uvicorn*main:app*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Sleep -Seconds 2
Start-Process -FilePath (Join-Path $ProjectRoot ".venv\Scripts\python.exe") -ArgumentList @("-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", $Port) -WorkingDirectory $ProjectRoot -WindowStyle Hidden

Write-Host ""
Write-Host "Public demo URL:"
Write-Host "  $publicUrl"
Write-Host ""
Write-Host "Send /start to your Telegram bot."

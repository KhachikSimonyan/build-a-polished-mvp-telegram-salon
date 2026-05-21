$ErrorActionPreference = "SilentlyContinue"

Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like "*uvicorn*main:app*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

Get-Process |
  Where-Object { $_.ProcessName -like "*cloudflared*" -or $_.ProcessName -like "*ngrok*" } |
  Stop-Process -Force

Write-Host "Maison Rose demo processes stopped."

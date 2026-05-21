param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\.."),
  [string]$Port = "3000",
  [string]$DatabaseName = "salon_booking",
  [string]$DatabasePassword = "postgres"
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectRoot

$python = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
  Write-Host "Creating local Python environment..."
  $bundledPython = "C:\Users\simon\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  if (Test-Path $bundledPython) {
    & $bundledPython -m venv .venv
  } else {
    py -m venv .venv
  }
}

Write-Host "Installing Python packages..."
& $python -m pip install -r requirements.txt

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$createdb = "C:\Program Files\PostgreSQL\17\bin\createdb.exe"
if (-not (Test-Path $psql)) {
  throw "PostgreSQL was not found. Install PostgreSQL 17 first."
}

$env:PGPASSWORD = $DatabasePassword
$dbExists = & $psql -U postgres -h localhost -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName'"
if (-not $dbExists) {
  Write-Host "Creating local database $DatabaseName..."
  & $createdb -U postgres -h localhost -p 5432 $DatabaseName
}

$envPath = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envPath)) {
  Copy-Item ".env.demo.example" ".env"
}

Write-Host "Starting Maison Rose demo on http://localhost:$Port"
Start-Process -FilePath $python -ArgumentList @("-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", $Port) -WorkingDirectory $ProjectRoot -WindowStyle Hidden

Write-Host "Open:"
Write-Host "  Client: http://localhost:$Port"
Write-Host "  Admin:  http://localhost:$Port/admin"
Write-Host "Admin password is in .env"

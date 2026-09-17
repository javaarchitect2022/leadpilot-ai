# ==============================================================================
# LeadPilot AI — Automated Dev Deployment Script (PowerShell / Windows)
# ==============================================================================

Write-Host "🚀 [LeadPilot AI] Starting Dev Deployment Pipeline..." -ForegroundColor Cyan

# 1. Run automated test suite to ensure commit integrity
Write-Host "🧪 [1/4] Running automated tests..." -ForegroundColor Yellow
npm test -- --run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

# 2. Re-generate Prisma client if schema was modified
Write-Host "📦 [2/4] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generation failed! Aborting." -ForegroundColor Red
    exit 1
}

# 3. Build & start the Dev/Test Stack (SQLite Engine + Cloudflare Tunnel)
Write-Host "🐳 [3/4] Building and launching Dev Docker stack..." -ForegroundColor Yellow
docker compose -f docker-compose.test.yml up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build/up failed!" -ForegroundColor Red
    exit 1
}

# 4. Wait for Cloudflare Tunnel to establish
Write-Host "⏳ [4/4] Connecting to Cloudflare Global Edge..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "🎉 [LeadPilot AI] Dev Deployment Succeeded!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Live Cloudflare Test URL:" -ForegroundColor Cyan

$tunnelLogs = docker compose -f docker-compose.test.yml logs cloudflared-test 2>&1
$urlLine = $tunnelLogs | Select-String -Pattern "trycloudflare.com" | Select-Object -Last 1
if ($urlLine) {
    Write-Host $urlLine.Line -ForegroundColor White -BackgroundColor DarkBlue
} else {
    Write-Host "Tunnel initializing... View URL via: docker compose -f docker-compose.test.yml logs cloudflared-test" -ForegroundColor Gray
}
Write-Host "==============================================================================" -ForegroundColor Green


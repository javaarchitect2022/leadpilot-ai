#!/usr/bin/env bash
# ==============================================================================
# LeadPilot AI — Automated Dev Deployment Script (Bash / Linux / macOS)
# ==============================================================================
set -e

echo "🚀 [LeadPilot AI] Starting Dev Deployment Pipeline..."

# 1. Run automated test suite to ensure commit integrity
echo "🧪 [1/4] Running automated tests..."
npm test -- --run

# 2. Re-generate Prisma client if schema was modified
echo "📦 [2/4] Generating Prisma Client..."
npm run db:generate

# 3. Build & start the Dev/Test Stack (SQLite Engine + Cloudflare Tunnel)
echo "🐳 [3/4] Building and launching Dev Docker stack..."
docker compose -f docker-compose.test.yml up -d --build

# 4. Wait for Cloudflare Tunnel to establish
echo "⏳ [4/4] Connecting to Cloudflare Global Edge..."
sleep 5

echo ""
echo "=============================================================================="
echo "🎉 [LeadPilot AI] Dev Deployment Succeeded!"
echo "=============================================================================="
echo "Live Cloudflare Test URL:"
docker compose -f docker-compose.test.yml logs cloudflared-test | grep -i "trycloudflare.com" | tail -n 1 || true
echo "=============================================================================="


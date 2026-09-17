#!/usr/bin/env node
// ==============================================================================
// LeadPilot AI — Cross-Platform Dev Deployment Script
// Runs on Windows, Linux, and macOS via: npm run deploy:dev
// ==============================================================================

import { execSync } from "child_process";

function run(cmd, desc) {
  console.log(`\n\x1b[33m⚡ ${desc}...\x1b[0m`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`\x1b[31m❌ Failed: ${desc}\x1b[0m`);
    process.exit(1);
  }
}

console.log("\x1b[36m==============================================================================\x1b[0m");
console.log("\x1b[36m🚀 [LeadPilot AI] Automated Dev Deployment Pipeline\x1b[0m");
console.log("\x1b[36m==============================================================================\x1b[0m");

// 1. Run Tests
run("npm test -- --run", "Step 1/3: Running Test Suite Validation");

// 2. Generate Prisma
run("npx prisma generate", "Step 2/3: Generating Prisma Client");

// 3. Launch Dev Docker Stack with SQLite & Cloudflare Tunnel
run("docker compose -f docker-compose.test.yml up -d --build", "Step 3/3: Launching Dev Stack via Docker Compose");

console.log("\n\x1b[32m==============================================================================\x1b[0m");
console.log("\x1b[32m🎉 Dev Deployment Successfully Started!\x1b[0m");
console.log("\x1b[32m==============================================================================\x1b[0m");
console.log("Checking Cloudflare Quick Tunnel URL (waiting 5 seconds)...");

setTimeout(() => {
  try {
    const logs = execSync("docker compose -f docker-compose.test.yml logs cloudflared-test", { encoding: "utf8" });
    const lines = logs.split("\n");
    const urlLine = lines.find((l) => l.includes("trycloudflare.com"));
    if (urlLine) {
      console.log(`\n\x1b[44m\x1b[37m Live Cloudflare Test URL: ${urlLine.trim()} \x1b[0m\n`);
    } else {
      console.log("\nTunnel initializing. Check URL with: docker compose -f docker-compose.test.yml logs cloudflared-test\n");
    }
  } catch {
    console.log("Check URL with: docker compose -f docker-compose.test.yml logs cloudflared-test");
  }
}, 5000);


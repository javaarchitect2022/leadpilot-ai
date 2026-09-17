#!/usr/bin/env node
// ==============================================================================
// LeadPilot AI — Git Post-Commit Hook Installer
// Automatically triggers dev deployment every time you run `git commit`
// ==============================================================================

import fs from "fs";
import path from "path";

const gitDir = path.resolve(process.cwd(), ".git");
const hooksDir = path.resolve(gitDir, "hooks");

if (!fs.existsSync(gitDir)) {
  console.log("\x1b[33mℹ️ Git repository not found. Initializing git repository...\x1b[0m");
  import("child_process").then(({ execSync }) => {
    try {
      execSync("git init", { stdio: "inherit" });
      installHook();
    } catch (e) {
      console.error("\x1b[31mFailed to initialize git\x1b[0m", e);
    }
  });
} else {
  installHook();
}

function installHook() {
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const hookPath = path.join(hooksDir, "post-commit");
  const hookScript = `#!/bin/sh
echo ""
echo "🚀 [Git Hook] Post-commit detected! Triggering automated Dev deployment..."
node scripts/deploy-dev.mjs
`;

  fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
  console.log("\x1b[32m✅ Git post-commit hook successfully installed!\x1b[0m");
  console.log("\x1b[36mEvery time you run 'git commit', LeadPilot AI will automatically build and deploy to your dev Cloudflare environment.\x1b[0m\n");
}


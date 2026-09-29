#!/usr/bin/env node
/**
 * Qmoosa Pi - Safe One-Click Finisher
 *
 * This command performs local verification only. It intentionally does not
 * commit, push, force-push, change repository settings, spend Pi, or mark
 * external approvals complete.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

function run(command, cwd = ROOT_DIR, env = process.env) {
  console.log(`$ ${command}`);
  execSync(command, { cwd, stdio: "inherit", env });
}

function requireFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function main() {
  console.log("\nQmoosa Pi safe one-click verification\n");

  run("node scripts/qmoosa-doctor.js");
  run("pnpm exec tsc --noEmit");
  run("npm ci", path.join(ROOT_DIR, "backend"));
  run("npm test", path.join(ROOT_DIR, "backend"));
  run("npm run syntax", path.join(ROOT_DIR, "backend"));

  const buildEnv = {
    ...process.env,
    GITHUB_PAGES: "true",
    NEXT_PUBLIC_PI_SANDBOX: process.env.NEXT_PUBLIC_PI_SANDBOX || "true",
  };
  run("pnpm run build", ROOT_DIR, buildEnv);

  requireFile("out/index.html");
  requireFile("out/.well-known/x402-bazaar.json");
  requireFile("out/validation-key.txt");

  console.log("\nMachine-verifiable repository checks passed.");
  console.log("No git push, force-push, wallet action, or external approval was performed.");
  console.log("Use the GitHub Actions One-Click Finisher for the reviewable deployment path.");
}

try {
  main();
} catch (error) {
  console.error("\nVerification failed:", error.message);
  process.exit(1);
}

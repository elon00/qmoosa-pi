#!/usr/bin/env node
const fs = require("fs");

const checks = [
  ["Qmoosa Pi package name", () => require("../package.json").name === "qmoosa-pi"],
  ["Pi SDK type definitions", () => fs.existsSync("types/pi.d.ts")],
  ["Backend environment template", () => fs.existsSync("backend/.env.example")],
  ["Production readiness document", () => fs.existsSync("docs/PRODUCTION_READINESS.md")],
  ["Security policy", () => fs.existsSync("SECURITY.md")],
  ["Pi validation file", () => fs.existsSync("public/validation-key.txt")],
  ["x402 discovery file", () => fs.existsSync("public/.well-known/x402-bazaar.json")],
  ["GitHub Pages workflow", () => fs.existsSync(".github/workflows/pages.yml")],
];

let failed = 0;
for (const [name, check] of checks) {
  let ok = false;
  try { ok = Boolean(check()); } catch {}
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}

if (failed) {
  console.error(`\n${failed} readiness check(s) failed.`);
  process.exit(1);
}

console.log("\nAll repository readiness checks passed.");
console.log("External Pi/GitHub account approvals are intentionally not marked complete.");

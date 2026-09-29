#!/usr/bin/env node
/**
 * Qmoosa Pi - One-Click Project Finisher & Production Deployer
 * Cross-platform automated orchestrator (Windows, macOS, Linux)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPO_URL = 'https://github.com/elon00/qmoosa-pi.git';
const PAGES_BASE_URL = 'https://elon00.github.io/qmoosa-pi';

function log(stage, msg) {
  console.log(`\n\x1b[1;36m[STEP ${stage}]\x1b[0m \x1b[1m${msg}\x1b[0m`);
}

function success(msg) {
  console.log(`\x1b[1;32m✔ ${msg}\x1b[0m`);
}

function warn(msg) {
  console.log(`\x1b[1;33m⚠ ${msg}\x1b[0m`);
}

function run(cmd, cwd = ROOT_DIR, env = process.env) {
  console.log(`\x1b[90m$ ${cmd}\x1b[0m`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    }).on('error', (err) => {
      resolve({ status: null, error: err.message });
    });
  });
}

async function main() {
  console.log('\n============================================================');
  console.log('       🚀 QMOOSA PI: ONE-CLICK AUTOMATION FINISHER          ');
  console.log('       Web 4.0 Pi-Native Launchpad & Conway Platform       ');
  console.log('============================================================\n');

  // STEP 1: Repository Readiness Doctor
  log('1/8', 'Running Repository Readiness Doctor...');
  run('node scripts/qmoosa-doctor.js');
  success('Repository readiness checks passed.');

  // STEP 2: TypeScript & Syntax Verification
  log('2/8', 'Verifying TypeScript Types & Linting...');
  run('pnpm exec tsc --noEmit');
  success('TypeScript types verified cleanly.');

  // STEP 3: Backend Syntax & Protocol Tests
  log('3/8', 'Running Backend Syntax & Unit Tests...');
  run('npm test', path.join(ROOT_DIR, 'backend'));
  success('Backend tests passed.');

  // STEP 4: Production Static Export
  log('4/8', 'Compiling Production Static Export (Next.js 14)...');
  const buildEnv = { ...process.env, GITHUB_PAGES: 'true', NEXT_PUBLIC_PI_SANDBOX: 'false' };
  run('pnpm run build', ROOT_DIR, buildEnv);
  
  // Ensure .nojekyll exists
  const nojekyllPath = path.join(ROOT_DIR, 'out', '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  success('Static production build exported to out/ with .nojekyll present.');

  // STEP 5: Verify Critical Output Files
  log('5/8', 'Verifying Exported Static Artifacts...');
  const requiredFiles = [
    'out/index.html',
    'out/.nojekyll',
    'out/.well-known/x402-bazaar.json',
    'out/.well-known/pi.toml',
    'out/validation-key.txt'
  ];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(ROOT_DIR, f))) {
      throw new Error(`Missing expected production export: ${f}`);
    }
  }
  success('All required RFC discovery and manifest files verified in out/');

  // STEP 6: Push Code Updates to Main Branch
  log('6/8', 'Synchronizing Main Branch with GitHub...');
  try {
    run('git add -A');
    try {
      run('git commit -m "chore: automated sync via one-click finisher [skip ci]"');
    } catch {
      // Nothing to commit
    }
    run('git push origin main');
    success('Main branch synchronized with origin/main.');
  } catch (err) {
    warn(`Main branch push skipped or already up-to-date: ${err.message}`);
  }

  // STEP 7: Deploy Static Build to gh-pages Branch
  log('7/8', 'Publishing Static Export to gh-pages Branch...');
  const outDir = path.join(ROOT_DIR, 'out');
  const gitDir = path.join(outDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  run('git init -b gh-pages', outDir);
  run(`git remote add origin ${REPO_URL}`, outDir);
  run('git add -A', outDir);
  run('git commit -m "deploy: automated one-click production release [skip ci]"', outDir);
  run('git push origin gh-pages --force', outDir);
  fs.rmSync(gitDir, { recursive: true, force: true });
  success('gh-pages branch successfully deployed and published.');

  // STEP 8: Live Verification
  log('8/8', 'Verifying Live Production Endpoints...');
  const endpoints = [
    `${PAGES_BASE_URL}/`,
    `${PAGES_BASE_URL}/.well-known/x402-bazaar.json`,
    `${PAGES_BASE_URL}/.well-known/pi.toml`,
    `${PAGES_BASE_URL}/validation-key.txt`
  ];

  console.log('\nChecking live HTTP status (may take ~30s for Fastly CDN cache renewal):');
  for (const ep of endpoints) {
    const res = await checkUrl(ep);
    const code = res.status || 'ERR';
    const statusColor = code === 200 ? '\x1b[1;32m' : '\x1b[1;33m';
    console.log(`  ${statusColor}[${code}]\x1b[0m ${ep}`);
  }

  console.log('\n============================================================');
  console.log('       🎉 QMOOSA PI ONE-CLICK FINISHER COMPLETE!           ');
  console.log('============================================================');
  console.log(`\n• Live Production DApp : ${PAGES_BASE_URL}/`);
  console.log(`• x402 Discovery URI   : ${PAGES_BASE_URL}/.well-known/x402-bazaar.json`);
  console.log(`• GitHub Repository    : https://github.com/elon00/qmoosa-pi`);
  console.log(`• Manual Workflow      : https://github.com/elon00/qmoosa-pi/actions/workflows/qmoosa-one-click.yml\n`);
}

main().catch((err) => {
  console.error('\n\x1b[1;31m✖ One-Click Finisher failed:\x1b[0m', err.message);
  process.exit(1);
});

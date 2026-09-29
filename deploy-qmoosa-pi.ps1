<#
.SYNOPSIS
    Qmoosa Pi: 1-Click Project Finisher & Production Deployer for Windows
.DESCRIPTION
    Executes repository doctor, type checks, backend tests, production static build,
    git synchronization, and GitHub Pages force deployment in one single click.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       🚀 QMOOSA PI: ONE-CLICK AUTOMATION FINISHER          " -ForegroundColor Cyan
Write-Host "       Web 4.0 Pi-Native Launchpad & Conway Platform       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $RepoRoot

# Execute the orchestrator via node
node "$RepoRoot\scripts\one-click-finisher.js"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Qmoosa Pi has finished all build, test, and deployment gates." -ForegroundColor Green
    Write-Host "View live at: https://elon00.github.io/qmoosa-pi/" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] One-Click Finisher failed with exit code $LASTEXITCODE." -ForegroundColor Red
}

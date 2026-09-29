#!/usr/bin/env bash
# Qmoosa Pi: 1-Click Project Finisher & Production Deployer for Unix / macOS / Git Bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

node "$DIR/scripts/one-click-finisher.js"

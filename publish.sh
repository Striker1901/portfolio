#!/bin/bash
# Publish the site to GitHub Pages in one step.
#
# Usage:
#     ./publish.sh "commit message"     # message optional
#
# What it does:
#   1. If assets/css/style.css or assets/js/main.js changed, runs ./bump-assets.sh
#      automatically (so the ?v= cache-bust stamp is never forgotten).
#   2. Stages everything (.gitignore keeps CLAUDE.md / .DS_Store out), commits.
#   3. Pushes to origin main — Pages rebuilds in ~60–90s.
#
set -e
cd "$(dirname "$0")"

MSG="${1:-Update site — $(date +%Y-%m-%d)}"

if ! git diff --quiet HEAD -- assets/css/style.css assets/js/main.js; then
  echo "CSS/JS changed — bumping asset cache stamp..."
  ./bump-assets.sh
fi

git add -A

if git diff --cached --quiet; then
  echo "Nothing to publish — working tree matches the last commit."
  exit 0
fi

git commit -m "$MSG"
git push origin main

echo ""
echo "Pushed. Live in ~60–90s → https://striker1901.github.io/portfolio/"

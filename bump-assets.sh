#!/bin/bash
# Cache-bust the CSS/JS asset URLs in every HTML page.
#
# Why: GitHub Pages serves assets/css/style.css and assets/js/main.js from the
# same path with a 10-minute cache header, and mobile browsers hold them even
# longer — so after a deploy the page HTML updates but the old CSS/JS can stay
# cached, making changes "not show up" on phones. Appending a fresh ?v=<stamp>
# makes the browser treat them as new files and fetch them immediately.
#
# Run this AFTER editing assets/css/style.css or assets/js/main.js and BEFORE
# committing, then push as usual:
#     ./bump-assets.sh
#
set -e
cd "$(dirname "$0")"
V=$(date +%s)
n=0
for f in *.html; do
  sed -i '' -E \
    -e "s|assets/css/style\.css(\?v=[0-9]+)?|assets/css/style.css?v=$V|g" \
    -e "s|assets/js/main\.js(\?v=[0-9]+)?|assets/js/main.js?v=$V|g" \
    "$f"
  n=$((n + 1))
done
echo "Bumped asset version to ?v=$V across $n HTML files."

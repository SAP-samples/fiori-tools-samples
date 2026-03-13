#!/bin/bash
# Markdown linting script for fiori-tools-samples
# Usage:
#   ./scripts/lint-markdown.sh          - lint all markdown files
#   ./scripts/lint-markdown.sh --fix    - lint and auto-fix all markdown files
#   ./scripts/lint-markdown.sh <file>   - lint a specific file

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

FIX_FLAG=""
TARGET="**/*.md"

for arg in "$@"; do
  case "$arg" in
    --fix) FIX_FLAG="--fix" ;;
    *)     TARGET="$arg" ;;
  esac
done

if [ -n "$FIX_FLAG" ]; then
  echo "🔧 Auto-fixing markdown: $TARGET"
else
  echo "🔍 Linting markdown: $TARGET"
fi

npx markdownlint-cli $TARGET $FIX_FLAG

echo "✅ Markdown lint complete"

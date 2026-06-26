#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${REPO_NAME:-earth-structure}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v gh >/dev/null 2>&1; then
  GH=gh
elif [[ -x /tmp/gh_2.63.2_macOS_arm64/bin/gh ]]; then
  GH=/tmp/gh_2.63.2_macOS_arm64/bin/gh
else
  echo "GitHub CLI (gh) is required. Install: brew install gh"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Log in to GitHub first:"
  echo "  $GH auth login"
  exit 1
fi

OWNER="$("$GH" api user -q .login)"
REMOTE="https://github.com/${OWNER}/${REPO_NAME}.git"

if "$GH" repo view "${OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
  echo "Repo ${OWNER}/${REPO_NAME} already exists."
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REMOTE"
  git push -u origin main
else
  "$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --push
fi

echo "Enabling GitHub Pages (GitHub Actions)..."
"$GH" api \
  --method PUT \
  "repos/${OWNER}/${REPO_NAME}/pages" \
  -f build_type=workflow \
  >/dev/null 2>&1 || \
"$GH" api \
  --method POST \
  "repos/${OWNER}/${REPO_NAME}/pages" \
  -f build_type=workflow \
  >/dev/null

echo ""
echo "Deployment started. Watch progress:"
echo "  $GH run list --repo ${OWNER}/${REPO_NAME}"
echo ""
echo "Live site (after Actions completes):"
echo "  https://${OWNER}.github.io/${REPO_NAME}/"

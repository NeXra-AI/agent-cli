#!/usr/bin/env bash
# Build standalone single-file binaries for 5 platforms via `bun build --compile`.
# Output: dist/binaries/nexra-<os>-<arch>
#
# Requires bun (https://bun.sh). Falls back to a friendly error if missing.

set -euo pipefail

if ! command -v bun >/dev/null 2>&1; then
  echo "✗ bun not found. Install: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

cd "$(dirname "$0")/.."

VERSION=$(node -e "console.log(require('./package.json').version)")
OUT=dist/binaries
mkdir -p "$OUT"

PLATFORMS=(
  "bun-linux-x64        nexra-linux-x64"
  "bun-linux-arm64      nexra-linux-arm64"
  "bun-darwin-x64       nexra-macos-x64"
  "bun-darwin-arm64     nexra-macos-arm64"
  "bun-windows-x64      nexra-windows-x64.exe"
)

echo "Building NeXra Agent CLI v$VERSION binaries..."
for line in "${PLATFORMS[@]}"; do
  TARGET=$(echo "$line" | awk '{print $1}')
  NAME=$(echo "$line" | awk '{print $2}')
  echo "  → $TARGET → $OUT/$NAME"
  bun build --compile --minify --target="$TARGET" --outfile "$OUT/$NAME" src/index.ts
done

echo
echo "✓ Binaries in $OUT/"
ls -lh "$OUT/"
echo
echo "SHA256:"
shasum -a 256 "$OUT/"* | tee "$OUT/SHASUMS256.txt"

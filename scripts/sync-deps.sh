#!/bin/sh
set -eu

# sync-deps.sh - Automatic dependency synchronization with fingerprinting for local development
# Usage: sync-deps.sh <npm-script-to-run> [args...]
# Example: sync-deps.sh npm run dev

if [ $# -eq 0 ]; then
  echo "Usage: $0 <npm-script> [args...]" >&2
  echo "Example: $0 npm run dev" >&2
  exit 1
fi

# Detect package directory: check current dir, then parent (for school portal at /app/client)
PACKAGE_DIR="."
if [ ! -f "package.json" ] && [ -f "../package.json" ]; then
  PACKAGE_DIR=".."
elif [ ! -f "package.json" ]; then
  echo "[sync-deps] ERROR: No package.json found in current or parent directory" >&2
  exit 1
fi

cd "$PACKAGE_DIR"

# Calculate fingerprint from package.json and package-lock.json (if present)
FINGERPRINT_FILE="node_modules/.deps_fingerprint"

compute_fingerprint() {
  hash_input=""
  hash_input="${hash_input}$(cat package.json)"
  if [ -f "package-lock.json" ]; then
    hash_input="${hash_input}$(cat package-lock.json)"
  fi
  printf '%s' "$hash_input" | sha256sum | cut -d' ' -f1
}

CURRENT_FINGERPRINT="$(compute_fingerprint)"

# Check if node_modules exists and fingerprint matches
if [ -d "node_modules" ] && [ -f "$FINGERPRINT_FILE" ]; then
  STORED_FINGERPRINT="$(cat "$FINGERPRINT_FILE" 2>/dev/null || echo "")"
  if [ "$CURRENT_FINGERPRINT" = "$STORED_FINGERPRINT" ]; then
    echo "[sync-deps] Dependencies up to date (fingerprint matches). Skipping installation."
    cd - >/dev/null
    exec "$@"
  fi
fi

echo "[sync-deps] Dependency change detected or first run. Installing..."

# Install dependencies
if [ -f "package-lock.json" ]; then
  echo "[sync-deps] Running 'npm ci'..."
  if npm ci --no-audit --no-fund 2>&1; then
    # Success
    :
  else
    # npm ci failed - likely lockfile out of sync, fall back to npm install
    echo "[sync-deps] 'npm ci' failed (lockfile out of sync?), falling back to 'npm install'..."
    if ! npm install --no-audit --no-fund 2>&1; then
      echo "[sync-deps] ERROR: 'npm install' failed." >&2
      exit 1
    fi
  fi
else
  echo "[sync-deps] No package-lock.json found, running 'npm install'..."
  if ! npm install --no-audit --no-fund 2>&1; then
    echo "[sync-deps] ERROR: 'npm install' failed." >&2
    exit 1
  fi
fi

# Save fingerprint after successful installation
mkdir -p node_modules
printf '%s' "$CURRENT_FINGERPRINT" > "$FINGERPRINT_FILE"

echo "[sync-deps] Dependencies synchronized successfully. Starting application..."

cd - >/dev/null
exec "$@"
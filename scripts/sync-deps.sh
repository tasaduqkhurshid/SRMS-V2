
#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# SRMS dependency synchronization script
#
# Purpose:
#   Automatically install dependencies when package.json or package-lock.json
#   changes, then start the requested application command.
#
# Usage:
#   bash /sync-deps.sh npm run dev
#
# Supported package layouts:
#   API:     /app/package.json
#   School:  /app/client/package.json
#   Student: /app/package.json
#   Admin:   /app/package.json
#
# IMPORTANT:
#   The application command always runs from the directory containing the
#   package.json. This is essential for the School portal.
###############################################################################

log() {
    echo "[sync-deps] $*"
}

error() {
    echo "[sync-deps] ERROR: $*" >&2
    exit 1
}

###############################################################################
# 1. Validate arguments
###############################################################################

if [ "$#" -eq 0 ]; then
    error "No application command supplied.

Usage:
  bash /sync-deps.sh npm run dev
  bash /sync-deps.sh npm run start"
fi

###############################################################################
# 2. Detect package directory
###############################################################################

ORIGINAL_DIR="$(pwd)"
PACKAGE_DIR=""

if [ -f "$ORIGINAL_DIR/package.json" ]; then
    PACKAGE_DIR="$ORIGINAL_DIR"

elif [ -f "$ORIGINAL_DIR/client/package.json" ]; then
    PACKAGE_DIR="$ORIGINAL_DIR/client"

elif [ -f "$ORIGINAL_DIR/../package.json" ]; then
    PACKAGE_DIR="$(cd "$ORIGINAL_DIR/.." && pwd)"

else
    error "No package.json found in:
  $ORIGINAL_DIR
  $ORIGINAL_DIR/client
  $ORIGINAL_DIR/.."
fi

cd "$PACKAGE_DIR"

log "Working directory: $PACKAGE_DIR"

###############################################################################
# 3. Verify npm and Node.js
###############################################################################

command -v node >/dev/null 2>&1 || error "Node.js is not installed."
command -v npm >/dev/null 2>&1 || error "npm is not installed."

log "Node version: $(node --version)"
log "NPM version: $(npm --version)"

###############################################################################
# 4. Fingerprint dependency files
###############################################################################

FINGERPRINT_FILE="node_modules/.deps_fingerprint"

compute_fingerprint() {
    {
        cat package.json

        if [ -f package-lock.json ]; then
            cat package-lock.json
        fi

    } | sha256sum | awk '{print $1}'
}

CURRENT_FINGERPRINT="$(compute_fingerprint)"

###############################################################################
# 5. Check existing dependencies
###############################################################################

DEPENDENCIES_UP_TO_DATE="false"

if [ -d node_modules ] && [ -f "$FINGERPRINT_FILE" ]; then

    STORED_FINGERPRINT="$(cat "$FINGERPRINT_FILE" 2>/dev/null || true)"

    if [ "$CURRENT_FINGERPRINT" = "$STORED_FINGERPRINT" ]; then
        DEPENDENCIES_UP_TO_DATE="true"
    fi
fi

###############################################################################
# 6. Install dependencies when required
###############################################################################

if [ "$DEPENDENCIES_UP_TO_DATE" = "true" ]; then

    log "Dependencies are up to date."
    log "Skipping installation."

else

    log "Dependency changes detected or first installation."
    log "Installing dependencies..."

    if [ -f package-lock.json ]; then

        log "Running npm ci..."

        if npm ci --no-audit --no-fund; then
            log "npm ci completed successfully."

        else
            log "WARNING: npm ci failed."
            log "Trying npm install as fallback..."

            if ! npm install --no-audit --no-fund; then
                error "Both npm ci and npm install failed."
            fi

            log "npm install fallback completed successfully."
        fi

    else

        log "No package-lock.json found."
        log "Running npm install..."

        if ! npm install --no-audit --no-fund; then
            error "npm install failed."
        fi

        log "npm install completed successfully."

    fi

    ############################################################################
    # 7. Save fingerprint only after successful installation
    ############################################################################

    mkdir -p node_modules

    printf '%s' "$CURRENT_FINGERPRINT" > "$FINGERPRINT_FILE"

    log "Dependency fingerprint saved."

fi

###############################################################################
# 8. Start application
###############################################################################

log "Dependency synchronization completed."
log "Starting application..."
log "Command: $*"
log "Directory: $(pwd)"

# IMPORTANT:
# Do not return to ORIGINAL_DIR here.
# npm must execute from PACKAGE_DIR.
#
# exec replaces this script with the application process, allowing Docker
# to receive application signals and track its exit status correctly.

exec "$@"
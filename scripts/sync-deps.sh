#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# SRMS dependency synchronization script
#
# Purpose:
#   Automatically install dependencies when package.json, package-lock.json,
#   Node.js version, npm version, OS platform, CPU architecture, or libc
#   changes. Then start the requested application command.
#
# Usage:
#   bash /sync-deps.sh npm run dev
#   bash /sync-deps.sh npm run start
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

NODE_VERSION="$(node --version)"
NPM_VERSION="$(npm --version)"
NODE_PLATFORM="$(node -e "console.log(process.platform)")"
NODE_ARCH="$(node -e "console.log(process.arch)")"

###############################################################################
# 4. Detect libc/platform information
###############################################################################

detect_libc() {
    # glibc detection
    if command -v ldd >/dev/null 2>&1; then
        if ldd --version 2>&1 | grep -qi "glibc"; then
            echo "glibc"
            return
        fi
    fi

    # musl detection (Alpine Linux)
    if compgen -G "/lib/ld-musl-*.so.1" >/dev/null 2>&1; then
        echo "musl"
        return
    fi

    # macOS uses dyld, not ldd
    if [ "$NODE_PLATFORM" = "darwin" ]; then
        echo "dyld"
        return
    fi

    # Windows
    if [ "$NODE_PLATFORM" = "win32" ]; then
        echo "msvcrt"
        return
    fi

    echo "unknown"
}

DETECTED_LIBC="$(detect_libc)"

log "Node version: $NODE_VERSION"
log "NPM version: $NPM_VERSION"
log "Platform: $NODE_PLATFORM"
log "Architecture: $NODE_ARCH"
log "Libc: $DETECTED_LIBC"

###############################################################################
# 5. Fingerprint dependency files + platform information
###############################################################################

FINGERPRINT_FILE="node_modules/.deps_fingerprint"

compute_fingerprint() {
    {
        cat package.json

        if [ -f package-lock.json ]; then
            cat package-lock.json
        fi

        echo "NODE_VERSION=$NODE_VERSION"
        echo "NPM_VERSION=$NPM_VERSION"
        echo "NODE_PLATFORM=$NODE_PLATFORM"
        echo "NODE_ARCH=$NODE_ARCH"
        echo "LIBC=$DETECTED_LIBC"
    } | sha256sum | awk '{print $1}'
}

CURRENT_FINGERPRINT="$(compute_fingerprint)"

###############################################################################
# 6. Optional dependency validation
###############################################################################

# Determine the expected Rollup native optional dependency for the current
# platform/architecture/libc combination.
# Rollup packages follow the pattern: @rollup/rollup-<platform>-<arch>-<libc>
# Examples:
#   @rollup/rollup-linux-x64-gnu     (Linux x64, glibc)
#   @rollup/rollup-linux-x64-musl    (Linux x64, musl/Alpine)
#   @rollup/rollup-linux-arm64-gnu   (Linux ARM64, glibc)
#   @rollup/rollup-darwin-x64        (macOS Intel)
#   @rollup/rollup-darwin-arm64      (macOS Apple Silicon)
#   @rollup/rollup-win32-x64-msvc    (Windows x64)
expected_rollup_package() {
    case "$NODE_PLATFORM-$NODE_ARCH-$DETECTED_LIBC" in
        linux-x64-glibc)     echo "@rollup/rollup-linux-x64-gnu" ;;
        linux-arm64-glibc)   echo "@rollup/rollup-linux-arm64-gnu" ;;
        linux-arm-glibc)     echo "@rollup/rollup-linux-arm-gnueabihf" ;;
        linux-x64-musl)      echo "@rollup/rollup-linux-x64-musl" ;;
        linux-arm64-musl)    echo "@rollup/rollup-linux-arm64-musl" ;;
        linux-arm-musl)      echo "@rollup/rollup-linux-arm-musl" ;;
        darwin-x64-dyld)     echo "@rollup/rollup-darwin-x64" ;;
        darwin-arm64-dyld)   echo "@rollup/rollup-darwin-arm64" ;;
        win32-x64-msvcrt)    echo "@rollup/rollup-win32-x64-msvc" ;;
        win32-arm64-msvcrt)  echo "@rollup/rollup-win32-arm64-msvc" ;;
        freebsd-x64-unknown) echo "@rollup/rollup-freebsd-x64" ;;
        openbsd-x64-unknown) echo "@rollup/rollup-openbsd-x64" ;;
        android-arm64-unknown) echo "@rollup/rollup-android-arm64" ;;
        android-arm-unknown)   echo "@rollup/rollup-android-arm" ;;
        android-ia32-unknown)  echo "@rollup/rollup-android-ia32" ;;
        *)                     echo "" ;;
    esac
}

validate_optional_dependencies() {
    # Skip Rollup validation if this project does not use Rollup.
    if [ ! -d "node_modules/rollup" ]; then
        log "Rollup is not installed in this project. Skipping Rollup validation."
        return 0
    fi

    local rollup_pkg
    rollup_pkg="$(expected_rollup_package)"

    if [ -z "$rollup_pkg" ]; then
        log "No known Rollup optional dependency for platform: $NODE_PLATFORM-$NODE_ARCH-$DETECTED_LIBC"
        return 0
    fi

    local rollup_dir_name
    rollup_dir_name="$(basename "$rollup_pkg")"
    local rollup_path="node_modules/@rollup/$rollup_dir_name"

    if [ ! -d "$rollup_path" ]; then
        log "Missing platform-specific optional dependency: $rollup_pkg"
        return 1
    fi

    log "Optional dependency present: $rollup_pkg"
    return 0
}

###############################################################################
# 7. Check existing dependencies
###############################################################################

DEPENDENCIES_UP_TO_DATE="false"

if [ -d node_modules ] && [ -f "$FINGERPRINT_FILE" ]; then

    STORED_FINGERPRINT="$(cat "$FINGERPRINT_FILE" 2>/dev/null || true)"

    if [ "$CURRENT_FINGERPRINT" = "$STORED_FINGERPRINT" ]; then
        # Fingerprint matches, but validate optional dependencies too
        if validate_optional_dependencies; then
            DEPENDENCIES_UP_TO_DATE="true"
        else
            log "Fingerprint matches but optional dependencies are missing or stale."
            log "Forcing dependency re-installation."
        fi
    fi
fi

###############################################################################
# 8. Install dependencies when required
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
    # 9. Validate optional dependencies after installation
    ############################################################################

    log "Validating platform-specific optional dependencies..."

    if ! validate_optional_dependencies; then
        error "Optional dependency validation failed after installation.
Expected package may not be available for platform: $NODE_PLATFORM-$NODE_ARCH-$DETECTED_LIBC"
    fi

    ############################################################################
    # 10. Save fingerprint only after successful installation and validation
    ############################################################################

    mkdir -p node_modules

    printf '%s' "$CURRENT_FINGERPRINT" > "$FINGERPRINT_FILE"

    log "Dependency fingerprint saved."

fi

###############################################################################
# 11. Start application
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

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMMAND="${1:-up}"
if [[ "$COMMAND" == "start" ]]; then COMMAND="up"; fi
exec "$ROOT_DIR/setup" "$COMMAND"

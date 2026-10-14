#!/usr/bin/env bash
# Start SRMS Admin Portal (Vite dev server in Docker)
# Usage: ./start-admin.sh [up|down|restart|status|logs|help]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILES="-f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/docker-compose.override.yml"
SERVICE_NAME="sms-admin"
PORT=5174
URL="http://localhost:${PORT}/"

# Source shared helpers
# shellcheck source=scripts/startup-helpers.sh
source "$ROOT_DIR/scripts/startup-helpers.sh"

load_env

usage() {
  cat <<'EOF'
SRMS Admin Portal Development Server (Docker)

Usage: ./start-admin.sh [command]

Commands:
  up        Start Vite dev server in Docker (default)
  down      Stop and remove container
  restart   Restart container
  status    Show container status
  logs      Follow container logs
  help      Show this help

Environment:
  VITE_API_PROXY_TARGET   API proxy target (default: http://sms-api:5000)

The server runs with HMR. File changes trigger hot module replacement.
Access at: http://localhost:5174/
EOF
}

require_docker

cd "$ROOT_DIR"

case "${1:-up}" in
  up)
    info "Starting Admin Portal in Docker (development mode)..."
    docker compose $COMPOSE_FILES up -d --build --wait "$SERVICE_NAME"
    success "Admin Portal started at ${URL}"
    ;;
  down)
    info "Stopping Admin Portal..."
    docker compose $COMPOSE_FILES stop "$SERVICE_NAME"
    docker compose $COMPOSE_FILES rm -f "$SERVICE_NAME"
    success "Admin Portal stopped."
    ;;
  restart)
    info "Restarting Admin Portal..."
    docker compose $COMPOSE_FILES restart "$SERVICE_NAME"
    success "Admin Portal restarted at ${URL}"
    ;;
  status)
    docker compose $COMPOSE_FILES ps "$SERVICE_NAME"
    ;;
  logs)
    docker compose $COMPOSE_FILES logs -f --tail=200 "$SERVICE_NAME"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
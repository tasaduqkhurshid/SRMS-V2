#!/usr/bin/env bash
# Start all SRMS Client Portals (School, Admin, Student) in Docker
# Usage: ./start-client.sh [up|down|restart|status|logs|help]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILES="-f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/docker-compose.override.yml"
SERVICES=("sms-school" "sms-admin" "sms-student")

# Source shared helpers
# shellcheck source=scripts/startup-helpers.sh
source "$ROOT_DIR/scripts/startup-helpers.sh"

load_env

usage() {
  cat <<'EOF'
SRMS All Client Portals Development Servers (Docker)

Usage: ./start-client.sh [command]

Commands:
  up        Start all three Vite dev servers in Docker (default)
  down      Stop and remove all containers
  restart   Restart all containers
  status    Show all containers status
  logs      Follow all containers logs
  help      Show this help

All servers run with HMR. File changes trigger hot module replacement.
Access URLs:
  School:   http://localhost:5173/admin/
  Admin:    http://localhost:5174/
  Student:  http://localhost:8080/
EOF
}

require_docker

cd "$ROOT_DIR"

case "${1:-up}" in
  up)
    info "Starting all client portals in Docker (development mode)..."
    docker compose $COMPOSE_FILES up -d --build --wait "${SERVICES[@]}"
    print_dev_urls
    success "All client portals started."
    ;;
  down)
    info "Stopping all client portals..."
    docker compose $COMPOSE_FILES stop "${SERVICES[@]}"
    docker compose $COMPOSE_FILES rm -f "${SERVICES[@]}"
    success "All client portals stopped."
    ;;
  restart)
    info "Restarting all client portals..."
    docker compose $COMPOSE_FILES restart "${SERVICES[@]}"
    print_dev_urls
    success "All client portals restarted."
    ;;
  status)
    docker compose $COMPOSE_FILES ps "${SERVICES[@]}"
    ;;
  logs)
    docker compose $COMPOSE_FILES logs -f --tail=200 "${SERVICES[@]}"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
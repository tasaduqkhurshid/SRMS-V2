#!/usr/bin/env bash
# Start SRMS API Server (Docker development mode with Nodemon)
# Usage: ./start-server.sh [up|down|restart|status|logs|help]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILES="-f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/docker-compose.override.yml"
SERVICE_NAME="sms-api"
API_URL="${API_URL:-http://localhost:5000}"

# Source shared helpers
# shellcheck source=scripts/startup-helpers.sh
source "$ROOT_DIR/scripts/startup-helpers.sh"

load_env

usage() {
  cat <<'EOF'
SRMS API Development Server (Docker)

Usage: ./start-server.sh [command]

Commands:
  up        Start API with MongoDB and Redis in Docker (default)
  down      Stop API, MongoDB, and Redis containers
  restart   Restart all services
  status    Show service status
  logs      Follow service logs
  help      Show this help

Environment:
  DB_TYPE=docker|local    Select database mode (default: from .env or docker)

The API runs with Nodemon for hot reload. Source code changes trigger automatic restart.
Database runs in Docker (or local if DB_TYPE=local).
Access at: http://localhost:5000
EOF
}

require_docker

cd "$ROOT_DIR"

case "${1:-up}" in
  up)
    info "Starting SRMS API in Docker (development mode with Nodemon)..."
    info "Database mode: $(get_db_type)"
    
    # Use root docker-compose with override for development
    docker compose $COMPOSE_FILES up -d --build --wait mongodb redis "$SERVICE_NAME"
    
    success "SRMS API started at ${API_URL}"
    printf "%b\n" "${YELLOW}Dev:${NC} Backend source is mounted; Nodemon restarts on file changes."
    printf "%b\n" "${YELLOW}Note:${NC} Run './setup db' from project root to initialize database."
    ;;
  down)
    info "Stopping SRMS API stack..."
    docker compose $COMPOSE_FILES stop "$SERVICE_NAME" mongodb redis
    docker compose $COMPOSE_FILES rm -f "$SERVICE_NAME" mongodb redis
    success "SRMS API stack stopped. Database volumes preserved."
    ;;
  restart)
    info "Restarting SRMS API stack..."
    docker compose $COMPOSE_FILES restart "$SERVICE_NAME" mongodb redis
    success "SRMS API restarted at ${API_URL}"
    ;;
  status)
    docker compose $COMPOSE_FILES ps "$SERVICE_NAME" mongodb redis
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
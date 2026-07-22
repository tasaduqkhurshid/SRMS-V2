#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_URL:-http://localhost:5000}"

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

info() {
  printf "%b\n" "${YELLOW}==>${NC} $*"
}

success() {
  printf "%b\n" "${GREEN}OK:${NC} $*"
}

error() {
  printf "%b\n" "${RED}ERROR:${NC} $*" >&2
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "$1 is required but was not found."
    exit 1
  fi
}

require_docker() {
  require_command docker

  if ! docker compose version >/dev/null 2>&1; then
    error "Docker Compose v2 is required. Install Docker Compose or enable the Docker Compose plugin."
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running or your user cannot access the Docker daemon."
    exit 1
  fi
}

wait_for_container_health() {
  local container="$1"
  local label="$2"
  local max_attempts="${3:-60}"
  local attempt=1
  local status

  info "Waiting for ${label} to become healthy..."

  while [ "$attempt" -le "$max_attempts" ]; do
    if ! docker inspect "$container" >/dev/null 2>&1; then
      error "Container '${container}' does not exist."
      exit 1
    fi

    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container")"

    if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
      success "${label} is ${status}."
      return 0
    fi

    sleep 2
    attempt=$((attempt + 1))
  done

  error "${label} did not become healthy in time."
  docker compose ps
  docker compose logs --tail=100
  exit 1
}

main() {
  require_docker
  cd "$SCRIPT_DIR"

  info "Building and starting SRMS API, MongoDB, and Redis..."
  docker compose up -d --build

  wait_for_container_health srms-mongodb "MongoDB"
  wait_for_container_health srms-server "SRMS API"

  success "SRMS API started at ${API_URL}"
  printf "%b\n" "${YELLOW}Dev:${NC} Backend source is mounted and nodemon will restart the API when files change."
  printf "%b\n" "${YELLOW}Note:${NC} Database migrations and seeders were not run."
  printf "%b\n" "${YELLOW}Next:${NC} Run './srmsapi/setup db' from the project root when you want to initialize the database."
}

main "$@"

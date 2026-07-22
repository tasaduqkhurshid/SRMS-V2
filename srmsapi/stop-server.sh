#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    error "docker is required but was not found."
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    error "Docker Compose v2 is required. Install Docker Compose or enable the Docker Compose plugin."
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running or your user cannot access the Docker daemon."
    exit 1
  fi
}

main() {
  require_docker
  cd "$SCRIPT_DIR"

  info "Stopping SRMS API, MongoDB, and Redis..."
  docker compose down
  success "SRMS API stack stopped. Database volumes were kept."
}

main "$@"

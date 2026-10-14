#!/usr/bin/env bash
# Shared helper functions for SRMS V2 startup scripts
# Source this file: source "$(dirname "${BASH_SOURCE[0]}")/scripts/startup-helpers.sh"

set -euo pipefail

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

# Logging functions
info() {
  printf "%b\n" "${BLUE}==>${NC} $*"
}

success() {
  printf "%b\n" "${GREEN}OK:${NC} $*"
}

warn() {
  printf "%b\n" "${YELLOW}!!>${NC} $*"
}

error() {
  printf "%b\n" "${RED}ERROR:${NC} $*" >&2
}

# Resolve the repository root directory
resolve_root_dir() {
  if [[ -n "${SRMS_ROOT_DIR:-}" ]]; then
    printf '%s' "$SRMS_ROOT_DIR"
    return
  fi
  local dir
  dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  printf '%s' "$dir"
}

ROOT_DIR="$(resolve_root_dir)"
export SRMS_ROOT_DIR="$ROOT_DIR"

# Load environment variables from .env if present
load_env() {
  local env_file="${ROOT_DIR}/.env"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$env_file"
    set +a
  fi
}

# Determine DB_TYPE (docker or local)
get_db_type() {
  local db_type="${DB_TYPE:-}"
  if [[ -z "$db_type" ]]; then
    db_type="$(docker compose config --environment 2>/dev/null | sed -n 's/^DB_TYPE=//p' | head -n 1)"
  fi
  db_type="${db_type:-docker}"
  if [[ "$db_type" != "docker" && "$db_type" != "local" ]]; then
    error "Invalid DB_TYPE '$db_type'; choose docker or local."
    exit 2
  fi
  printf '%s' "$db_type"
}

# Get docker compose command with appropriate profile
compose() {
  local db_type
  db_type="$(get_db_type)"
  if [[ "$db_type" == "docker" ]]; then
    docker compose --profile docker "$@"
  else
    docker compose --profile local "$@"
  fi
}

# Check if a service is running in the root compose project
is_service_running() {
  local service="$1"
  compose ps --status running --services 2>/dev/null | grep -qx "$service"
}

# Wait for a compose service to be healthy
wait_for_service_health() {
  local service="$1"
  local label="${2:-$service}"
  local max_attempts="${3:-60}"
  local attempt=1
  local status

  info "Waiting for ${label} to become healthy..."

  while [[ "$attempt" -le "$max_attempts" ]]; do
    if ! compose ps "$service" >/dev/null 2>&1; then
      error "Service '${service}' does not exist in compose project."
      return 1
    fi

    status="$(compose ps --format json "$service" 2>/dev/null | jq -r '.[0].Health // .[0].State // "unknown"' 2>/dev/null || echo "unknown")"

    if [[ "$status" == "healthy" || "$status" == "running" ]]; then
      success "${label} is ${status}."
      return 0
    fi

    sleep 2
    attempt=$((attempt + 1))
  done

  error "${label} did not become healthy in time."
  compose ps
  compose logs --tail=50 "$service"
  return 1
}

# Check if a command exists
require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    error "$cmd is required but was not found."
    exit 1
  fi
}

# Check Docker availability
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

# Get a compose environment variable value
compose_env_value() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    value="$(docker compose config --environment 2>/dev/null | sed -n "s/^${name}=//p" | head -n 1)"
  fi
  printf '%s' "$value"
}

# Print portal URLs
print_portal_urls() {
  local root_domain http_port
  root_domain="$(compose_env_value ROOT_DOMAIN)"
  root_domain="${root_domain:-sms.local}"
  http_port="$(compose_env_value HTTP_PORT)"
  http_port="${http_port:-80}"

  printf '\nPortals are available at:\n'
  if [[ "$http_port" != "80" ]]; then
    printf '  Super Admin: http://admin.%s:%s\n' "$root_domain" "$http_port"
    printf '  School:      http://%s:%s/admin/\n' "$root_domain" "$http_port"
    printf '  Student:     http://%s:%s/\n' "$root_domain" "$http_port"
    printf '  API:         http://%s:%s/api/\n' "$root_domain" "$http_port"
  else
    printf '  Super Admin: http://admin.%s\n' "$root_domain"
    printf '  School:      http://%s/admin/\n' "$root_domain"
    printf '  Student:     http://%s/\n' "$root_domain"
    printf '  API:         http://%s/api/\n' "$root_domain"
  fi
}

# Print development URLs (for direct Vite/Nodemon access)
print_dev_urls() {
  local api_url="${API_URL:-http://localhost:5000}"
  local school_url="${SCHOOL_URL:-http://localhost:5173}"
  local admin_url="${ADMIN_URL:-http://localhost:5174}"
  local student_url="${STUDENT_URL:-http://localhost:8080}"

  printf '\nDevelopment servers:\n'
  printf '  API:      %s\n' "$api_url"
  printf '  School:   %s/admin/\n' "$school_url"
  printf '  Admin:    %s\n' "$admin_url"
  printf '  Student:  %s\n' "$student_url"
}

# Trap handler for cleanup on interrupt
setup_cleanup_trap() {
  local cleanup_func="$1"
  trap "$cleanup_func" INT TERM
}

# Run a command in the background and track its PID
run_bg() {
  "$@" &
  printf '%d' "$!"
}

# Wait for all background PIDs
wait_for_pids() {
  local pids=("$@")
  local pid
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      wait "$pid"
    fi
  done
}

# Kill all background PIDs
kill_pids() {
  local pids=("$@")
  local pid
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  sleep 0.5
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
}

# Check if we're in a TTY (for interactive prompts)
is_tty() {
  [[ -t 0 && -t 1 ]]
}

# Prompt for confirmation
confirm() {
  local prompt="$1"
  if is_tty; then
    printf '%s [y/N]: ' "$prompt"
    read -r response
    [[ "$response" =~ ^[Yy]$ ]]
  else
    warn "Non-interactive mode: assuming 'no' for confirmation: $prompt"
    return 1
  fi
}
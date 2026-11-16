#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# SRMS unified multi-portal stack startup script
#
# Cross-platform: works on Windows Git Bash, Linux Mint, Ubuntu.
#
# IMPORTANT CRLF NOTE FOR WINDOWS GIT BASH:
#   If this script itself was checked out with CRLF line endings, Bash may
#   fail to parse it before any normalization runs. To fix permanently:
#
#     git config core.autocrlf input
#     git checkout start-all.sh scripts/sync-deps.sh
#
#   .gitattributes enforces LF endings for all *.sh/*.bash files on checkout.
###############################################################################

#------------------------------------------------------------------------------
# Environment / shell detection
#------------------------------------------------------------------------------
detect_os() {
  local os
  os="$(uname -s 2>/dev/null || echo unknown)"
  case "$os" in
    Linux*)     echo "linux" ;;
    Darwin*)    echo "macos" ;;
    CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
    *)          echo "unknown" ;;
  esac
}

OS="$(detect_os)"
IS_WINDOWS="false"
if [ "$OS" = "windows" ]; then
  IS_WINDOWS="true"
fi

#------------------------------------------------------------------------------
# Resolve project root reliably
#------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
cd "$ROOT_DIR"

#------------------------------------------------------------------------------
# Normalize shell script line endings (CRLF -> LF)
#
# Normalizes .sh and .bash files before Docker mounts them into containers.
# Excludes .git, node_modules and generated directories. Handles paths with
# spaces. Does not alter binary files. Preserves file permissions. Reports
# which scripts were modified. Avoids unnecessary writes when already LF.
#------------------------------------------------------------------------------
normalize_line_endings() {
  local normalized=0
  local f rel

  while IFS= read -r -d '' f; do
    # Skip binary files
    if file "$f" 2>/dev/null | grep -qi "binary"; then
      continue
    fi

    # Skip if already LF-only (no CRLF)
    if ! grep -lU $'\r' "$f" >/dev/null 2>&1; then
      continue
    fi

    rel="${f#$ROOT_DIR/}"

    # Write LF-only version to temp, then replace (preserves permissions via mv)
    local tmp
    tmp="$(mktemp)"
    tr -d '\r' < "$f" > "$tmp"
    cat "$tmp" > "$f"
    rm -f "$tmp"

    echo "[start-all] Normalized line endings: $rel"
    normalized=1
  done < <(find "$ROOT_DIR" -type f \( -name '*.sh' -o -name '*.bash' \) \
    -not -path "$ROOT_DIR/.git/*" \
    -not -path "$ROOT_DIR/*/node_modules/*" \
    -not -path "$ROOT_DIR/node_modules/*" \
    -print0 2>/dev/null || true)

  if [ "$normalized" -eq 1 ]; then
    echo "[start-all] Shell script line endings normalized (CRLF -> LF)."
  fi
}

#------------------------------------------------------------------------------
# Executable permissions
#------------------------------------------------------------------------------
fix_permissions() {
  chmod +x "$ROOT_DIR/start-all.sh" 2>/dev/null || true
  chmod +x "$ROOT_DIR/scripts/sync-deps.sh" 2>/dev/null || true
  chmod +x "$ROOT_DIR/setup" 2>/dev/null || true
  local f
  for f in "$ROOT_DIR"/start-*.sh "$ROOT_DIR"/stop-*.sh; do
    [ -f "$f" ] && chmod +x "$f" 2>/dev/null || true
  done
}

#------------------------------------------------------------------------------
# Validate prerequisites
#------------------------------------------------------------------------------
validate_prerequisites() {
  local command="$1"
  local missing=0

  command -v docker >/dev/null 2>&1 || {
    echo "ERROR: Docker is required but not installed or not in PATH." >&2
    missing=1
  }

  docker compose version >/dev/null 2>&1 || {
    echo "ERROR: Docker Compose v2 is required but not installed or not in PATH." >&2
    missing=1
  }

  if [ "$missing" -eq 1 ]; then
    exit 1
  fi

  case "$command" in
    config|services|help|-h|--help) ;;
    *)
      docker info >/dev/null 2>&1 || {
        echo "ERROR: Docker daemon is not running or your user cannot access the Docker daemon." >&2
        exit 1
      }
      ;;
  esac
}

#------------------------------------------------------------------------------
# Validate configuration files
#------------------------------------------------------------------------------
validate_config() {
  local environment="$1"
  local environment_file

  case "$environment" in
    production)
      environment_file="$ROOT_DIR/.env.production"
      ;;
    docker)
      environment_file="$ROOT_DIR/.env.production"
      ;;
    local)
      environment_file="$ROOT_DIR/.env.local"
      [[ -f "$environment_file" ]] || environment_file="$ROOT_DIR/.env"
      ;;
    *)
      echo "ERROR: Unknown environment '$environment'." >&2
      exit 2
      ;;
  esac

  if [[ "$environment" != production ]]; then
    [[ -f "$ROOT_DIR/.env" ]] || {
      echo 'ERROR: Missing .env. Copy .env.example to .env and configure credentials.' >&2
      exit 2
    }
  fi

  [[ -f "$environment_file" ]] || {
    echo "ERROR: Missing environment config: $environment_file" >&2
    exit 2
  }

  echo "$environment_file"
}

#------------------------------------------------------------------------------
# Compose command wrapper with profiles
#
# Precedence: explicit shell environment variables > .env file >
#   selected environment file (.env.local / .env.production)
#------------------------------------------------------------------------------
compose_base() {
  local environment="$1"
  local environment_file="$2"
  shift 2

  if [[ "$environment" == production ]]; then
    NODE_ENV=production docker compose --env-file "$environment_file" "$@"
  else
    docker compose --env-file "$ROOT_DIR/.env" --env-file "$environment_file" "$@"
  fi
}

#------------------------------------------------------------------------------
# Print portal URLs
#------------------------------------------------------------------------------
print_portal_urls() {
  local environment_file="$1"
  local environment="$2"
  local root_domain mapped_port

  root_domain="$(grep -E '^ROOT_DOMAIN=' "$ROOT_DIR/.env" "$environment_file" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
  root_domain="${root_domain:-sms.local}"

  mapped_port="$(docker compose port sms-nginx 80 2>/dev/null | sed -n '1s/.*://p' || true)"

  printf '\nPortals are available at:\n'
  if [[ -n "$mapped_port" && "$mapped_port" != "80" ]]; then
    printf '  Super Admin: http://admin.%s:%s\n' "$root_domain" "$mapped_port"
    printf '  School:      http://school.%s:%s\n' "$root_domain" "$mapped_port"
    printf '  Student:     http://student.%s:%s\n' "$root_domain" "$mapped_port"
    printf '  API:         http://api.%s:%s\n' "$root_domain" "$mapped_port"
  else
    printf '  Super Admin: http://admin.%s\n' "$root_domain"
    printf '  School:      http://school.%s\n' "$root_domain"
    printf '  Student:     http://student.%s\n' "$root_domain"
    printf '  API:         http://api.%s\n' "$root_domain"
  fi
  printf '\n'
}

#------------------------------------------------------------------------------
# Wait for service health
#
# Checks actual container health via `docker compose ps`. Supports Compose v2.
# Handles starting / healthy / unhealthy / exited states. Reliable per-service
# timeout. Shows relevant logs when a service becomes unhealthy. Returns
# non-zero when a required service fails.
#------------------------------------------------------------------------------
wait_for_health() {
  local max_wait="${SRMS_STARTUP_WAIT_SECONDS:-120}"
  local service
  local elapsed
  local status
  local failed=0

  echo "[start-all] Waiting for services to become healthy..."
  for service in "$@"; do
    elapsed=0
    while [ "$elapsed" -lt "$max_wait" ]; do
      status="$(docker compose ps --format json "$service" 2>/dev/null | grep -o '"Status":"[^"]*"' | head -n1 || true)"

      if echo "$status" | grep -q "healthy"; then
        echo "  [OK] $service is healthy."
        break
      fi

      if echo "$status" | grep -q "unhealthy\|Exit\|error\|unhealthy"; then
        echo "  [FAIL] $service entered error state: $status" >&2
        echo "  [LOGS] Recent logs for $service:" >&2
        docker compose logs --tail=30 "$service" 2>/dev/null >&2 || true
        failed=1
        break
      fi

      sleep 2
      elapsed=$((elapsed + 2))
    done

    if [ "$elapsed" -ge "$max_wait" ]; then
      echo "  [WARN] $service did not report healthy within ${max_wait}s." >&2
      failed=1
    fi
  done

  return $failed
}

#------------------------------------------------------------------------------
# Usage
#------------------------------------------------------------------------------
usage() {
  cat <<'EOF'
SRMS unified multi-portal stack

Usage: ./start-all.sh [-e|--env local|docker|production] [up|down|restart|status|logs|config|services|help]

  up       Build and start the selected stack; local development is the default
  down     Stop containers, keep database volumes
  restart  Rebuild and restart all services
  status   Show service health
  logs     Follow all service logs
  config   Validate the merged Docker Compose configuration
  services Print Compose service names

ENVIRONMENT (set in .env or -e flag):
  local       - Local development (Vite/Nodemon, host MongoDB)
  docker      - Production-style with containerized MongoDB
  production  - Production deployment (uses .env.production)

Use -e docker for the production-style runtime. Local Vite and Nodemon mode is the default.
EOF
}

#------------------------------------------------------------------------------
# Main
#------------------------------------------------------------------------------
environment="${ENVIRONMENT:-local}"
command="up"
while (($#)); do
  case "$1" in
    -e|--env)
      (($# >= 2)) || { echo "Missing value for $1" >&2; exit 2; }
      environment="$2"
      shift 2
      ;;
    up|down|restart|status|logs|config|services|help|-h|--help)
      command="$1"
      shift
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [[ "$environment" != local && "$environment" != docker && "$environment" != production ]]; then
  echo "Invalid environment '$environment'; choose local, docker, or production." >&2
  exit 2
fi

validate_prerequisites "$command"

# Normalize line endings and fix permissions before Docker touches anything
normalize_line_endings
fix_permissions

environment_file="$(validate_config "$environment")"

compose_env_value() {
  local name="$1"
  docker compose --env-file "$ROOT_DIR/.env" --env-file "$environment_file" config --environment 2>/dev/null \
    | sed -n "s/^${name}=//p" | head -n 1
}

db_type="${DB_TYPE:-$(compose_env_value DB_TYPE)}"
db_type="${db_type:-docker}"
if [[ "$db_type" != docker && "$db_type" != local ]]; then
  echo "Invalid DB_TYPE '$db_type'; choose docker or local." >&2
  exit 2
fi

profiles=()
if [[ "$db_type" == docker ]]; then
  profiles+=(--profile docker)
fi
if [[ "$environment" == local ]]; then
  profiles+=(--profile local)
fi

# Validate required upstream env vars
for name in NGINX_SCHOOL_UPSTREAM NGINX_STUDENT_UPSTREAM NGINX_ADMIN_UPSTREAM NGINX_API_UPSTREAM NGINX_SCHOOL_STRIP_PREFIX; do
  [[ -n "$(compose_env_value "$name")" ]] || {
    echo "Missing $name in $environment_file." >&2
    exit 2
  }
done

compose() {
  if [[ "$environment" == production ]]; then
    NODE_ENV=production docker compose --env-file "$environment_file" "${profiles[@]}" "$@"
  else
    docker compose --env-file "$ROOT_DIR/.env" --env-file "$environment_file" "${profiles[@]}" "$@"
  fi
}

case "$command" in
  up)
    echo "[start-all] Starting SRMS stack (environment=$environment, db_type=$db_type)..."

    if [[ "$environment" == local ]]; then
      if [[ "$db_type" == docker ]]; then
        compose up --build -d --wait --remove-orphans \
          mongodb sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
      else
        compose up --build -d --wait --remove-orphans \
          sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
      fi
    else
      if [[ "$db_type" == docker ]]; then
        compose up --build -d --wait --remove-orphans \
          mongodb redis sms-api sms-school sms-admin sms-student sms-nginx
      else
        compose up --build -d --wait --remove-orphans \
          redis sms-api sms-school sms-admin sms-student sms-nginx
      fi
    fi

    # Nginx expands the mounted config template only when its container starts.
    compose up -d --no-deps --force-recreate --wait sms-nginx

    # Wait for health on dependent services (failures are NOT silently ignored)
    if [[ "$environment" == local ]]; then
      wait_for_health sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
    else
      wait_for_health sms-api sms-school sms-admin sms-student sms-nginx
    fi

    compose ps
    print_portal_urls "$environment_file" "$environment"
    ;;

  down)
    # Never use -v: persistent database and Redis volumes must be preserved.
    compose down --remove-orphans
    ;;

  restart)
    echo "[start-all] Restarting SRMS stack (environment=$environment, db_type=$db_type)..."

    if [[ "$environment" == local ]]; then
      if [[ "$db_type" == docker ]]; then
        compose up --build -d --force-recreate --wait --remove-orphans \
          mongodb sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
      else
        compose up --build -d --force-recreate --wait --remove-orphans \
          sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
      fi
    else
      if [[ "$db_type" == docker ]]; then
        compose up --build -d --force-recreate --wait --remove-orphans \
          mongodb redis sms-api sms-school sms-admin sms-student sms-nginx
      else
        compose up --build -d --force-recreate --wait --remove-orphans \
          redis sms-api sms-school sms-admin sms-student sms-nginx
      fi
    fi

    compose up -d --no-deps --force-recreate --wait sms-nginx

    if [[ "$environment" == local ]]; then
      wait_for_health sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
    else
      wait_for_health sms-api sms-school sms-admin sms-student sms-nginx
    fi

    compose ps
    print_portal_urls "$environment_file" "$environment"
    ;;

  status)
    compose ps
    ;;

  logs)
    compose logs -f --tail=200
    ;;

  services)
    compose config --services
    ;;

  config)
    compose config --quiet
    echo "Compose configuration is valid."
    ;;

  help|-h|--help)
    usage
    ;;

  *)
    usage >&2
    exit 2
    ;;
esac

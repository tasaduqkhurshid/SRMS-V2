#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

environment="${ENVIRONMENT:-docker}"
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
if [[ "$environment" != docker && "$environment" != local ]]; then
  echo "Invalid environment '$environment'; choose docker or local." >&2
  exit 2
fi
command -v docker >/dev/null 2>&1 || { echo 'Docker is required.' >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required.' >&2; exit 1; }
case "$command" in config|services|help|-h|--help) ;; *) docker info >/dev/null 2>&1 || { echo 'Docker is not running or your user cannot access the Docker daemon.' >&2; exit 1; } ;; esac

db_type="${DB_TYPE:-}"
if [[ -z "$db_type" ]]; then
  db_type="$(docker compose config --environment | sed -n 's/^DB_TYPE=//p' | head -n 1)"
fi
db_type="${db_type:-docker}"
if [[ "$db_type" != docker && "$db_type" != local ]]; then
  echo "Invalid DB_TYPE '$db_type'; choose docker or local." >&2
  exit 2
fi
profiles=()
if [[ "$db_type" == docker ]]; then profiles+=(--profile docker); fi
if [[ "$environment" == local ]]; then profiles+=(--profile local); fi
export SCHOOL_UPSTREAM=sms-school STUDENT_UPSTREAM=sms-student ADMIN_UPSTREAM=sms-admin API_UPSTREAM=sms-api
if [[ "$environment" == local ]]; then
  export SCHOOL_UPSTREAM=sms-school-local STUDENT_UPSTREAM=sms-student-local
  export ADMIN_UPSTREAM=sms-admin-local API_UPSTREAM=sms-api-local
fi
compose() { docker compose "${profiles[@]}" "$@"; }

usage() {
  cat <<'EOF'
SRMS unified multi-portal stack

Usage: ./start-all.sh [-e|--env docker|local] [up|down|restart|status|logs|config]

  up       Build and start the selected stack; production is the default
  down     Stop containers, keep database volumes
  restart  Rebuild and restart all services
  status   Show service health
  logs     Follow all service logs
  config   Validate the merged Docker Compose configuration
  services Print Compose service names

Use -e local for Vite and Nodemon development mode.
EOF
}

print_portal_urls() {
  local compose_environment root_domain mapped_port
  compose_environment="$(compose config --environment)"
  root_domain="$(printf '%s\n' "$compose_environment" | sed -n 's/^ROOT_DOMAIN=//p' | head -n 1)"
  root_domain="${root_domain:-sms.local}"
  mapped_port="$(compose port sms-nginx 80 2>/dev/null | sed -n '1s/.*://p')"

  printf '\nPortals are available at:\n'
  if [[ -n "$mapped_port" && "$mapped_port" != "80" ]]; then
    printf '  Super Admin: http://admin.%s:%s\n' "$root_domain" "$mapped_port"
  else
    printf '  Super Admin: http://admin.%s\n' "$root_domain"
  fi
}

case "$command" in
  up)
    if [[ "$environment" == local ]]; then
      compose up --build -d --wait --remove-orphans sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
    else
      compose up --build -d --wait --remove-orphans mongodb redis sms-api sms-school sms-admin sms-student sms-nginx
    fi
    # Nginx expands the mounted config template only when its container starts.
    # Recreate just the proxy so edits to that template take effect on every run.
    compose up -d --no-deps --force-recreate --wait sms-nginx
    compose ps
    print_portal_urls
    ;;
  down)
    compose down --remove-orphans
    ;;
  restart)
    if [[ "$environment" == local ]]; then
      compose up --build -d --force-recreate --wait --remove-orphans sms-api-local sms-school-local sms-admin-local sms-student-local sms-nginx
    else
      compose up --build -d --force-recreate --wait --remove-orphans mongodb redis sms-api sms-school sms-admin sms-student sms-nginx
    fi
    compose ps
    print_portal_urls
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

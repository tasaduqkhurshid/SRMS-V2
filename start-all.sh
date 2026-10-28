#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

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
if [[ "$environment" != docker && "$environment" != local ]]; then
  echo "Invalid environment '$environment'; choose docker or local." >&2
  exit 2
fi
environment_file="$ROOT_DIR/.env.production"
if [[ "$environment" == local ]]; then environment_file="$ROOT_DIR/.env.local"; fi
[[ -f "$ROOT_DIR/.env" ]] || { echo 'Missing .env. Copy .env.example to .env and configure local credentials.' >&2; exit 2; }
[[ -f "$environment_file" ]] || { echo "Missing environment config: $environment_file" >&2; exit 2; }
command -v docker >/dev/null 2>&1 || { echo 'Docker is required.' >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required.' >&2; exit 1; }
case "$command" in config|services|help|-h|--help) ;; *) docker info >/dev/null 2>&1 || { echo 'Docker is not running or your user cannot access the Docker daemon.' >&2; exit 1; } ;; esac

compose_base() { docker compose --env-file "$ROOT_DIR/.env" --env-file "$environment_file" "$@"; }
compose_environment="$(compose_base config --environment)"
compose_env_value() {
  local name="$1"
  printf '%s\n' "$compose_environment" | sed -n "s/^${name}=//p" | head -n 1
}

db_type="${DB_TYPE:-$(compose_env_value DB_TYPE)}"
db_type="${db_type:-docker}"
if [[ "$db_type" != docker && "$db_type" != local ]]; then
  echo "Invalid DB_TYPE '$db_type'; choose docker or local." >&2
  exit 2
fi
profiles=()
if [[ "$db_type" == docker ]]; then profiles+=(--profile docker); fi
if [[ "$environment" == local ]]; then
  profiles+=(--profile local)
fi
for name in NGINX_SCHOOL_UPSTREAM NGINX_STUDENT_UPSTREAM NGINX_ADMIN_UPSTREAM NGINX_API_UPSTREAM NGINX_SCHOOL_STRIP_PREFIX; do
  [[ -n "$(compose_env_value "$name")" ]] || {
    echo "Missing $name in $environment_file." >&2
    exit 2
  }
done
compose() { compose_base "${profiles[@]}" "$@"; }

usage() {
  cat <<'EOF'
SRMS unified multi-portal stack

Usage: ./start-all.sh [-e|--env docker|local] [up|down|restart|status|logs|config]

  up       Build and start the selected stack; local development is the default
  down     Stop containers, keep database volumes
  restart  Rebuild and restart all services
  status   Show service health
  logs     Follow all service logs
  config   Validate the merged Docker Compose configuration
  services Print Compose service names

Use -e docker for the production-style runtime. Local Vite and Nodemon mode is the default.
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

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

configured_db_type="${DB_TYPE:-}"
if [[ -z "$configured_db_type" ]]; then
  configured_db_type="$(docker compose config --environment | sed -n 's/^DB_TYPE=//p' | head -n 1)"
fi
configured_db_type="${configured_db_type:-docker}"
if [[ "$configured_db_type" != "docker" && "$configured_db_type" != "local" ]]; then
  echo "Invalid DB_TYPE '$configured_db_type'; choose docker or local." >&2
  exit 2
fi

compose() {
  if [[ "$configured_db_type" == "docker" ]]; then
    docker compose --profile docker "$@"
  else
    docker compose --profile local "$@"
  fi
}

usage() {
  cat <<'EOF'
SRMS unified multi-portal stack

Usage: ./start-all.sh [up|down|restart|status|logs|config]

  up       Build and start all services; wait for health checks (default)
  down     Stop containers, keep database volumes
  restart  Rebuild and restart all services
  status   Show service health
  logs     Follow all service logs
  config   Validate the merged Docker Compose configuration
  services Print the active Docker Compose service names
EOF
}

print_portal_urls() {
  local compose_environment root_domain mapped_port
  compose_environment="$(docker compose config --environment)"
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

command="${1:-up}"
case "$command" in
  up)
    compose up --build -d --wait --remove-orphans
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
    compose up --build -d --force-recreate --wait --remove-orphans
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

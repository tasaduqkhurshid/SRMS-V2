#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service_key="${1:?Usage: start-compose-service.sh api|school|admin|student [options] [command]}"
shift
environment="${ENVIRONMENT:-local}"
command="up"

while (($#)); do
  case "$1" in
    -e|--env)
      (($# >= 2)) || { echo "Missing value for $1" >&2; exit 2; }
      environment="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 {api|school|admin|student} [-e|--env docker|local] [up|down|restart|status|logs|rollback]"
      exit 0
      ;;
    up|start|down|stop|restart|status|logs|rollback)
      command="$1"
      shift
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$environment" in docker|local) ;; *) echo "Invalid environment '$environment'; choose docker or local." >&2; exit 2 ;; esac
environment_file="$ROOT_DIR/.env.production"
if [[ "$environment" == local ]]; then environment_file="$ROOT_DIR/.env.local"; fi
[[ -f "$ROOT_DIR/.env" ]] || { echo 'Missing .env. Copy .env.example to .env and configure local credentials.' >&2; exit 2; }
[[ -f "$environment_file" ]] || { echo "Missing environment config: $environment_file" >&2; exit 2; }
case "$service_key" in
  api) production_service=sms-api; local_service=sms-api-local ;;
  school) production_service=sms-school; local_service=sms-school-local ;;
  admin) production_service=sms-admin; local_service=sms-admin-local ;;
  student) production_service=sms-student; local_service=sms-student-local ;;
  *) echo "Unknown service '$service_key'." >&2; exit 2 ;;
esac

command -v docker >/dev/null || { echo 'Docker is required.' >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required.' >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo 'Docker is not running or your user cannot access the Docker daemon.' >&2; exit 1; }

cd "$ROOT_DIR"
compose_base() { docker compose --env-file "$ROOT_DIR/.env" --env-file "$environment_file" "$@"; }
compose_environment="$(compose_base config --environment)"
compose_env_value() {
  local name="$1"
  printf '%s\n' "$compose_environment" | sed -n "s/^${name}=//p" | head -n 1
}

db_type="${DB_TYPE:-$(compose_env_value DB_TYPE)}"
db_type="${db_type:-docker}"
case "$db_type" in docker|local) ;; *) echo "Invalid DB_TYPE '$db_type'; choose docker or local." >&2; exit 2 ;; esac

profiles=()
if [[ "$db_type" == docker ]]; then profiles+=(--profile docker); fi
target="$production_service"
if [[ "$environment" == local ]]; then
  profiles+=(--profile local)
  target="$local_service"
fi
for name in NGINX_SCHOOL_UPSTREAM NGINX_STUDENT_UPSTREAM NGINX_ADMIN_UPSTREAM NGINX_API_UPSTREAM NGINX_SCHOOL_STRIP_PREFIX; do
  if [[ -z "$(compose_env_value "$name")" ]]; then
    echo "Missing $name in $environment_file." >&2
    exit 2
  fi
done

compose() { compose_base "${profiles[@]}" "$@"; }
case "$command" in
  up|start)
    if [[ "$service_key" == api ]]; then
      compose up --build -d --wait "$target"
    else
      api_target=sms-api
      [[ "$environment" != local ]] || api_target=sms-api-local
      # Bring up the API and its database/cache dependencies without forcing
      # an API image rebuild when only a frontend is being started.
      compose up -d --wait "$api_target"
      compose up --build -d --no-deps --wait "$target"
      # Nginx only renders its mounted template when its container starts.
      compose up -d --wait --no-deps --force-recreate sms-nginx
    fi
    ;;
  down|stop) compose stop "$target" ;;
  restart) compose up --build -d --wait --force-recreate "$target" ;;
  status) compose ps "$target" ;;
  logs) compose logs -f --tail=200 "$target" ;;
  rollback)
    [[ "$service_key" == api ]] || { echo 'rollback is available only for the api service.' >&2; exit 2; }
    compose exec "$target" npm run migrate:down
    ;;
esac

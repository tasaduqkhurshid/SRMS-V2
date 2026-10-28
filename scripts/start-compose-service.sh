#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service_key="${1:?Usage: start-compose-service.sh api|school|admin|student [options] [command]}"
shift
environment="${ENVIRONMENT:-docker}"
command="up"

while (($#)); do
  case "$1" in
    -e|--env)
      (($# >= 2)) || { echo "Missing value for $1" >&2; exit 2; }
      environment="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 {api|school|admin|student} [-e|--env docker|local] [up|down|restart|status|logs]"
      exit 0
      ;;
    up|start|down|stop|restart|status|logs)
      command="$1"
      shift
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$environment" in docker|local) ;; *) echo "Invalid environment '$environment'; choose docker or local." >&2; exit 2 ;; esac
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
db_type="${DB_TYPE:-}"
if [[ -z "$db_type" ]]; then
  db_type="$(docker compose config --environment | sed -n 's/^DB_TYPE=//p' | head -n 1)"
fi
db_type="${db_type:-docker}"
case "$db_type" in docker|local) ;; *) echo "Invalid DB_TYPE '$db_type'; choose docker or local." >&2; exit 2 ;; esac

profiles=()
if [[ "$db_type" == docker ]]; then profiles+=(--profile docker); fi
target="$production_service"
school_upstream=sms-school
student_upstream=sms-student
admin_upstream=sms-admin
api_upstream=sms-api
if [[ "$environment" == local ]]; then
  profiles+=(--profile local)
  target="$local_service"
  school_upstream=sms-school-local
  student_upstream=sms-student-local
  admin_upstream=sms-admin-local
  api_upstream=sms-api-local
fi
export SCHOOL_UPSTREAM="$school_upstream" STUDENT_UPSTREAM="$student_upstream"
export ADMIN_UPSTREAM="$admin_upstream" API_UPSTREAM="$api_upstream"

compose() { docker compose "${profiles[@]}" "$@"; }
case "$command" in
  up|start)
    services=("$target")
    if [[ "$service_key" != api && "$environment" == docker ]]; then services=(sms-api "$target"); fi
    compose up --build -d --wait "${services[@]}"
    if [[ "$service_key" != api ]]; then
      # Nginx only renders its mounted template when its container starts.
      compose up -d --wait --no-deps --force-recreate sms-nginx
    fi
    ;;
  down|stop) compose stop "$target" ;;
  restart) compose up --build -d --wait --force-recreate "$target" ;;
  status) compose ps "$target" ;;
  logs) compose logs -f --tail=200 "$target" ;;
esac

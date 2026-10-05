#!/usr/bin/env bash
set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
DEFAULT_API_BASE_URL=""
API_BASE_URL="${API_BASE_URL:-$DEFAULT_API_BASE_URL}"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    echo ""
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is required but not installed or not on PATH."
    exit 1
  fi

  if [[ -z "$(compose_cmd)" ]]; then
    echo "❌ Docker Compose is required but not available."
    exit 1
  fi
}

require_project_files() {
  if [[ ! -d "$PROJECT_DIR" ]]; then
    echo "❌ Student portal project directory is missing: $PROJECT_DIR"
    exit 1
  fi

  if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "❌ Missing docker-compose.yml for the student portal."
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/.env.example" ]]; then
    echo "❌ Missing .env.example in the student portal project."
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/.env" ]]; then
    echo "ℹ️  Creating .env from .env.example"
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  fi
}

print_help() {
  cat <<'EOF'
SRMS Student Portal runner

Usage:
  ./start-student.sh [command]

Commands:
  start       Start the student portal web app
  stop        Stop the student portal container
  restart     Restart the student portal container
  rebuild     Rebuild the student portal image and start it
  logs        Show recent container logs
  status      Show the current service status
  down        Stop and remove containers
  help        Show this message

Default backend target:
  Same-origin /api/student through the unified root Nginx stack

You can override the backend with:
  API_BASE_URL=<reachable-api-url> ./start-student.sh
EOF
}

wait_for_app() {
  echo "⏳ Waiting for Student Portal at http://localhost:8080..."
  local timeout=90
  local waited=0

  while [[ $waited -lt $timeout ]]; do
    if curl -fsS "http://localhost:8080" >/dev/null 2>&1; then
      echo "✅ Student Portal is available at http://localhost:8080"
      return 0
    fi
    sleep 2
    waited=$((waited + 2))
  done

  echo "❌ Student Portal did not become available at http://localhost:8080 within ${timeout}s."
  return 1
}

start_service() {
  echo "🚀 Starting SRMS Student Portal..."
  echo "📌 API_BASE_URL=$API_BASE_URL"
  export API_BASE_URL
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" up --build -d
  else
    docker-compose -f "$COMPOSE_FILE" up --build -d
  fi

  wait_for_app
}

stop_service() {
  echo "🛑 Stopping SRMS Student Portal..."
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" stop
  else
    docker-compose -f "$COMPOSE_FILE" stop
  fi
}

restart_service() {
  echo "🔄 Restarting SRMS Student Portal..."
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" up --build -d --force-recreate
  else
    docker-compose -f "$COMPOSE_FILE" up --build -d --force-recreate
  fi
}

rebuild_service() {
  echo "🏗️ Rebuilding SRMS Student Portal..."
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" up --build -d
  else
    docker-compose -f "$COMPOSE_FILE" up --build -d
  fi
}

logs_service() {
  echo "📜 Showing Student Portal logs..."
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" logs --tail=200
  else
    docker-compose -f "$COMPOSE_FILE" logs --tail=200
  fi
}

status_service() {
  echo "📊 Student Portal status:"
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" ps
  else
    docker-compose -f "$COMPOSE_FILE" ps
  fi
}

down_service() {
  echo "🧹 Stopping and removing Student Portal containers..."
  if [[ "$(compose_cmd)" == "docker compose" ]]; then
    docker compose -f "$COMPOSE_FILE" down
  else
    docker-compose -f "$COMPOSE_FILE" down
  fi
}

main() {
  require_docker
  require_project_files

  case "${1:-start}" in
    start)
      start_service
      ;;
    stop)
      stop_service
      ;;
    restart)
      restart_service
      ;;
    rebuild)
      rebuild_service
      ;;
    logs)
      logs_service
      ;;
    status)
      status_service
      ;;
    down)
      down_service
      ;;
    help|--help|-h)
      print_help
      ;;
    *)
      echo "❌ Unknown command: $1"
      print_help
      exit 1
      ;;
  esac
}

main "$@"

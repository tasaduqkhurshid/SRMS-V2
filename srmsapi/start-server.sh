#!/bin/bash
set -e

echo "Building and starting the SRMS API, MongoDB, and Redis..."
docker compose up -d --build

echo "Waiting for the API health check..."
for _ in {1..30}; do
  if curl --silent --fail http://localhost:5000/api/health >/dev/null; then
    echo "SRMS API started at http://localhost:5000"
    exit 0
  fi
  sleep 2
done

echo "SRMS API failed to become healthy. Container status:"
docker compose ps
docker compose logs --tail=100 server
exit 1

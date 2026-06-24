#!/bin/bash
set -e

echo "Building and starting srmsclient client..."
docker rm -f srmsclient-client 2>/dev/null || true
docker build -t srmsclient-client .
docker run \
  --name srmsclient-client \
  --add-host=host.docker.internal:host-gateway \
  -p 3000:80 \
  -d srmsclient-client

sleep 1
if ! docker ps --filter "name=^/srmsclient-client$" --filter "status=running" --format '{{.Names}}' | grep -qx srmsclient-client; then
  echo "srmsclient client failed to start. Container logs:"
  docker logs srmsclient-client
  exit 1
fi

echo "srmsclient client started at http://localhost:3000"

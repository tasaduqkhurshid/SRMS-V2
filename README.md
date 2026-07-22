# School Result Management System (SRMS)

SRMS is a Dockerized school result management system with a Vue.js frontend and a Node.js/Express API backed by MongoDB and Redis.

The backend workflow is intentionally split into two parts:

- `./srmsapi/start-server.sh` starts the application only.
- `./srmsapi/stop-server.sh` stops the application only.
- `./srmsapi/setup ...` performs explicit database and operational tasks.

The host machine does not need Node.js or npm. Backend commands run inside Docker containers.

## Prerequisites

- Docker
- Docker Compose v2, available as `docker compose`
- Git

## Project Structure

```text
SRMS-DOCKER/
├── srmsapi/
│   ├── Dockerfile
│   ├── docker-compose.yml # MongoDB, Redis, and API services
│   ├── setup              # Docker-first API management CLI
│   ├── start-server.sh    # Starts the API stack only
│   ├── stop-server.sh     # Stops the API stack only
│   └── server/
│       ├── server.js
│       ├── src/
│       └── package.json
└── srmsclient/
    ├── Dockerfile
    ├── docker-compose.yml
    └── client/
```

## Backend Workflow

Start the API stack:

```bash
./srmsapi/start-server.sh
```

This starts MongoDB, Redis, and the API server. It waits for MongoDB and the API health check, then prints the API URL.

Backend source files are mounted into the API container and run with `nodemon`, so saving a backend file automatically restarts the API. Rebuild only when dependencies or Docker config change.

Important: `./srmsapi/start-server.sh` never runs migrations, never runs seeders, and never modifies the database.

Stop the API stack:

```bash
./srmsapi/stop-server.sh
```

This stops the API, MongoDB, and Redis containers without removing database volumes.

Initialize the database manually:

```bash
./srmsapi/setup db
```

This runs migrations first, then seeders, inside the server container.

Run only migrations:

```bash
./srmsapi/setup migrate
```

Run only seeders:

```bash
./srmsapi/setup seed
```

Create a completely fresh database:

```bash
./srmsapi/setup reset
```

This stops containers, removes Docker volumes for this API compose project, starts fresh containers, waits for health checks, then runs migrations and seeders.

Show container status:

```bash
./srmsapi/setup status
```

Show live logs:

```bash
./srmsapi/setup logs
```

Open a shell inside the API container:

```bash
./srmsapi/setup shell
```

Open the MongoDB shell:

```bash
./srmsapi/setup mongo
```

Show all available commands:

```bash
./srmsapi/setup help
```

## API URL

After startup, the API is available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## Docker Compose Direct Usage

The `setup` script wraps common Docker Compose commands, but you can still use Compose directly from the API directory:

```bash
cd srmsapi
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
```

Database commands should still be run inside the server container:

```bash
docker compose exec server npm run migrate
docker compose exec server npm run seed
docker compose exec server npm run db:setup
```

## Frontend

Start the frontend separately:

```bash
cd srmsclient
bash start-client.sh
```

The frontend is available at:

```text
http://localhost
```

## Environment Variables

Backend environment variables are defined in `srmsapi/docker-compose.yml`.

Key API variables:

- `MONGO_URI`: MongoDB connection string used by the API.
- `REDIS_HOST`: Redis hostname.
- `REDIS_PORT`: Redis port.
- `PORT`: API port, default `5000`.
- `NODE_ENV`: Runtime environment.

Frontend API configuration is controlled by:

- `VITE_API_BASE_URL`: API base URL, usually `http://localhost:5000`.

## Stopping Services

Stop the backend stack without deleting volumes:

```bash
cd srmsapi
docker compose down
```

Stop and remove backend database/cache volumes:

```bash
cd srmsapi
docker compose down -v
```

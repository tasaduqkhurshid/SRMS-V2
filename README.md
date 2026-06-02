# School Result Management System (SRMS)

A modern web application for managing school results, built with Vue.js frontend and Node.js/Express backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Development](#development)
- [Docker Compose Alternative](#docker-compose-alternative)
- [License](#license)

## Prerequisites

Before you begin, ensure you have installed:
- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Git](https://git-scm.com/)
- (Optional) Docker Compose (included with Docker Desktop)

## Project Structure

```
school-result-system/
+-- srmsapi/                  # Backend server (Node.js/Express)
¦   +-- Dockerfile            # Multi-stage Docker build for server
¦   +-- docker-compose.yml    # MongoDB, Redis, and server services
¦   +-- start-server.sh       # Script to build and run server container
¦   +-- server/               # Source code
¦       +-- src/
¦       +-- public/
¦       +-- db/
¦       +-- package.json
¦       +-- ...
+-- srmsclient/               # Frontend client (Vue.js)
    +-- Dockerfile            # Multi-stage Docker build (Vite ? nginx)
    +-- docker-compose.yml    # Client service only
    +-- start-client.sh       # Script to build and run client container
    +-- client/               # Source code
        +-- src/
        +-- public/
        +-- package.json
        +-- ...
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/srms.git
   cd srms
   ```

2. No further installation is required if using Docker. The Dockerfiles contain all necessary dependencies.

## Running the Application

### Method 1: Direct Execution Scripts (Recommended for quick start)

#### Start the Server (API)
```bash
cd srmsapi
bash start-server.sh   # In Git Bash/WSL or terminal with bash
# OR (in PowerShell with Git Bash available)
.\start-server.sh
```
The server will be accessible at http://localhost:5000

#### Start the Client (Frontend)
```bash
cd srmsclient
bash start-client.sh   # In Git Bash/WSL or terminal with bash
# OR (in PowerShell with Git Bash available)
.\start-client.sh
```
The client will be accessible at http://localhost

### Method 2: Docker Compose (Full stack with dependencies)

#### Start Server with Dependencies
```bash
cd srmsapi
docker-compose up -d   # Starts MongoDB, Redis, and server
```
Access API at http://localhost:5000

#### Start Client
```bash
cd srmsclient
docker-compose up -d   # Starts client
```
Access frontend at http://localhost

> **Note**: When using docker-compose, the server waits for MongoDB and Redis to be healthy before starting.

## Development

For local development without Docker:

### Backend (srmsapi)
```bash
cd srmsapi/server
npm install
npm run dev   # or whatever dev script is defined in package.json
```

### Frontend (srmsclient)
```bash
cd srmsclient/client
npm install
npm run dev   # Vite dev server
```

## Environment Variables

The application uses the following environment variables (set in docker-compose.yml or .env files):

### Server
- `MONGODB_URI`: Connection string for MongoDB
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Client
- `VITE_API_BASE_URL`: Base URL for API calls (usually http://localhost:5000)

## Stopping and Cleaning Up

### Using Direct Scripts
```bash
# Server
docker stop srmsapi-server
docker rm srmsapi-server

# Client
docker stop srmsclient-client
docker rm srmsclient-client
```

### Using Docker Compose
```bash
cd srmsapi
docker-compose down

cd srmsclient
docker-compose down
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

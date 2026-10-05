# SRMS multi-portal system

This repository evolves the existing SRMS applications into a shared, multi-school deployment. It keeps one Express API, MongoDB, and Redis deployment; the existing school-management Vue app is renamed to `srms-school`, and the student web/PWA is Vue/Vite. Existing Expo/React Native source is retained for native builds. The default stack includes three active frontends: the School Admin Portal, Student PWA, and Super Admin Portal, backed by one shared API, MongoDB, and Redis.

## Audited application entry points

- `srmsapi/server/server.js` starts the Express API; existing API logic remains in `srmsapi/server/src`.
- `srms-school/client` is the existing Vue 3/Vite/Vue Router School Admin Portal, now built with base `/admin/`.
- `srms-student/web` is the Vue 3/Vite/Vue Router Student PWA. Existing Expo source remains under `srms-student/app` and `srms-student/src` for native development.
- `srms-admin` is the active Vue 3/Vite/Vue Router 4 Super Admin Portal, deployed as its own container at `admin.<ROOT_DOMAIN>`.
- Root `docker-compose.yml` starts `sms-nginx`, all three frontend services (`sms-school`, `sms-student`, `sms-admin`), `sms-api`, and Redis. MongoDB runs in Docker mode and is omitted in local mode.

## Local hostnames

Add these entries to the operating system hosts file:

```text
127.0.0.1 hanfia.sms.local schoolb.sms.local admin.sms.local
```

Linux/macOS: `/etc/hosts`. Windows: `C:\Windows\System32\drivers\etc\hosts` (edit as Administrator). For local wildcard development, add each test hostname; production DNS should point `*.srms.com` to the ingress server.

## Start the unified stack

```sh
cp .env.example .env
# Edit .env before production; all example credentials are local-only.
./start-all.sh up
```

Equivalent direct Docker-mode commands:

```sh
docker compose --profile docker up --build -d --wait --remove-orphans
docker compose --profile docker up -d --no-deps --force-recreate --wait sms-nginx
```

The API waits for its selected database and Redis, runs tracked migrations and safe seeders, then starts. Demo data runs only when `SEED_DEMO_DATA=true` and `NODE_ENV` is not `production`. Compose health checks gate Nginx startup. After `up` or `restart`, the script prints the Super Admin URL using the configured domain and published HTTP port. `./start-all.sh status`, `./start-all.sh logs`, `./start-all.sh restart`, `./start-all.sh down`, `./start-all.sh config`, and `./start-all.sh services` are also available. Use `./stop-all.sh` as a shortcut to stop the stack. `start-all.sh` selects the database profile using `DB_TYPE` and removes services left behind when switching modes.

The API logger reads `LOG_LEVEL` at startup. Supported values are `debug`, `info` (default), `warn`, and `error`; set the value in root `.env` and restart `sms-api` to apply it. For example, use `LOG_LEVEL=debug` for intentional application diagnostics. MongoDB query logging is controlled separately by `MONGO_DEBUG` and remains off by default; setting the application log level to `debug` does not enable query logging.

## MongoDB modes

Set `DB_TYPE` in the root `.env` to choose the one MongoDB target for the shared API. The default is `docker`. Mongo settings are centralized in `srmsapi/server/src/config/database.js`; the same models, migrations, seeders, and services are used in either mode.

```dotenv
DB_TYPE=docker
DB_HOST=
DB_PORT=27017
DB_NAME=school-system
DB_USERNAME=admin
DB_PASSWORD=replace-this-password
DB_AUTH_SOURCE=admin
```

With `DB_TYPE=docker`, Compose activates the `docker` profile, starts the MongoDB service, and the API connects to `mongodb:27017`. The database port is not published to the host. Connect GUI tools to the Docker database only if you deliberately publish that port.

With `DB_TYPE=local`, Compose does not start the MongoDB service. The API container connects to the host through `host.docker.internal`; the API running directly on the host uses `127.0.0.1`. On Linux, Compose maps `host.docker.internal` to the host gateway. The host MongoDB must listen on an address reachable from Docker's bridge as well as loopback, require authentication, and permit the Docker bridge through the host firewall. Keep GUI access direct at `127.0.0.1:27017` with the configured username, password, and auth database. The local database is not placed behind Docker or exposed by Compose.

To switch modes, change only `DB_TYPE` and restart with `./start-all.sh up`; the root `.env.example` sets `COMPOSE_PROFILES` from `DB_TYPE` so plain Compose commands also select the MongoDB profile. Set `DB_HOST` only when you need to override the mode's default host. The API reports the selected type, host, port, and database at startup without printing credentials. It does not fall back to the other mode if a connection fails.

Database operations use the root `./setup` command and the selected mode. For local host-side npm commands, the server package is under `srmsapi/server`: the project root `srmsapi/` has no `package.json`. `./setup migrate` and `./setup seed` use the API container and selected target; `./setup mongo`, `db-export`, and `db-import` use host MongoDB tools in local mode.

```sh
./setup migrate      # migrations only
./setup seed         # system seeder; local demo seeder only when enabled
./setup db            # migrate, then seed
./setup status
./setup logs
./setup shell
./setup mongo
./setup db-export
./setup db-import ./sms-db/<timestamp>/school-system.archive.gz
```

Migrations run in numeric filename order and are recorded in the `_migrations` MongoDB collection. Migrations handle schema/index changes; run `./setup seed` to create missing tenant catalog data. `seedSystem()` creates the platform admin only if absent; `seedNewSchool()` provisions the default 14 courses, 9 subjects, 7 exams, academic year, and settings for a new tenant. The normal seed command also checks existing schools for these missing defaults without overwriting existing catalog records. Demo data is separate and disabled in production. `./setup reset` shows the selected database and requires typing `RESET` before dropping that database; it does not silently remove Docker volumes or touch a different DB mode. Exports use `mongodump` and imports use `mongorestore`; they operate on the selected live database rather than copying data files.

Only `sms-nginx` publishes a port (default HTTP port 80). Set `HTTP_PORT` if port 80 is unavailable. MongoDB, Redis, both frontends, and API stay on the internal Compose network.

## URLs

- School Admin: `http://hanfia.sms.local/admin` (redirects to `/admin/`)
- Student PWA: `http://hanfia.sms.local/login`
- Same-tenant API health: `http://hanfia.sms.local/api/health`
- Student API: `http://hanfia.sms.local/api/student/...`
- School B routes use `schoolb.sms.local` with the same apps and containers. `admin.sms.local` serves the Super Admin Portal and its `/api/admin/*` API.

Nginx selects apps by path/hostname. `admin.<ROOT_DOMAIN>` is routed to `sms-admin` and preserves `/api/admin/*` to `sms-api`; `/admin/*` is forwarded to `sms-school` with the `/admin` prefix removed; `/api/student/*` is preserved and sent to `sms-api`; legacy school-admin `/api/*` requests have only `/api` stripped to reach the existing Express route paths; other tenant-host paths go to the student SPA. Unknown hostnames are rejected by the default Nginx server. `/api/*` has no SPA fallback.

The edge proxy preserves `Host` and sets `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Real-IP`, and `X-Forwarded-For`. Express trusts exactly one configured proxy hop (`TRUST_PROXY=1`). `ROOT_DOMAIN` defaults to `sms.local` and is configurable; do not bake `.local` or a school name into application code.

## Tenant and authorization model

`School.slug` is unique, immutable after creation, lowercase, URL-safe, and indexed. The backend resolves the school from the incoming hostname suffix (`ROOT_DOMAIN`), checks that the school exists and is active, and attaches `req.school` / `req.schoolId`. Frontends never choose tenant identity with `?school=` or a body/query school ID.

A shared Mongoose plugin scopes school-owned model queries, updates, deletes, aggregates, saves, and inserts using request-local tenant context. Redis cache keys are tenant-prefixed. Student and School Admin JWTs are accepted only on their matching school hostname. Existing school-admin resource paths remain in place and require an `ADMIN`/`SCHOOL_ADMIN` JWT for the hostname's tenant. Dynamic option endpoints are now authenticated and tenant scoped.

Migration backfills legacy school slugs and associates legacy results with the school of their student before adding indexes. Review migration logs and back up production data before applying migrations. Legacy result rows without a valid student cannot be assigned automatically and need manual repair.

## Local seeded accounts

With the default local `.env.example` and `SEED_DEMO_DATA=true`:

- Hanfia School Admin: `hanfia-admin` / `hanfia-admin-local-only`
- Hanfia demo Student: `STU001` / `student-local-only` (DOB: `14-05-2012`)
- School B School Admin: `schoolb-admin` / `schoolb-admin-local-only`
- School B demo Student: `STU001` / `schoolb-student-local-only` (DOB: `22-09-2011`)

These passwords are deliberately for local testing only. Set strong secrets in `.env`, use `SEED_DEMO_DATA=false` for production, and provision real user credentials. The existing legacy seed also includes a development `HIT` school/admin; do not use its default credentials in production.

Student passwords are bcrypt-hashed in `students.password_hash` (excluded from normal Mongoose reads/responses). School Admins can provide/reset a student's portal password in the existing Student form. Student login resolves Student ID/admission number/roll number inside the hostname-resolved school only.

School slugs cannot be changed through school edit. Reserved names include `admin`, `api`, `www`, `mail`, `smtp`, `cdn`, and `assets`. The platform API is available only on `admin.<ROOT_DOMAIN>` and requires a `SUPER_ADMIN` token. The local seed provisions `platform-admin` using `SUPER_ADMIN_PASSWORD`.

## Super Admin access

With `SEED_DEMO_DATA=true`, sign in at `http://admin.sms.local` using `platform-admin` and `SUPER_ADMIN_PASSWORD` (the local example password is `platform-admin-local-only`). Change this password before deployment. The portal calls only `/api/admin/*`; API authorization requires a Super Admin JWT and the `admin.<ROOT_DOMAIN>` hostname.

## Cloudflare R2 school branding

R2 is optional; the API starts without credentials and the school login uses generic branding until images are uploaded. It uses the S3-compatible Cloudflare R2 API from the shared `sms-api` service. MongoDB stores branding metadata and object keys; the private bucket stores files. The backend derives the school slug from the selected School record and creates keys under `schools/{schoolSlug}/branding/`; browsers cannot choose a tenant prefix. Branding reads are proxied through the hostname-resolved school API, so a tenant only receives its own assets.

To enable it later:

1. Create a Cloudflare account and enable R2.
2. Create one bucket named `sms-storage`.
3. Create an R2 API token with Object Read & Write access limited to that bucket.
4. Copy the Cloudflare Account ID and token access key ID/secret into the ignored root `.env` file. Do not commit these values.
5. Set `R2_ENABLED=true`, `R2_ACCOUNT_ID=`, `R2_ACCESS_KEY_ID=`, `R2_SECRET_ACCESS_KEY=`, and `R2_BUCKET_NAME=sms-storage`. `R2_ENDPOINT` can be left blank to derive `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`; optionally set `R2_PUBLIC_BASE_URL` only if you configure a public asset domain.
6. Restart the API: `docker compose up -d --build sms-api`.

Super Admin school details provide logo and welcome image uploads. Uploads accept JPEG, PNG, or WebP up to 5 MB. With R2 disabled, upload endpoints return JSON `503` and existing/placeholder login branding continues to work. R2 credentials remain server-side.

## Frontend development/build checks

```sh
npm --prefix srms-school/client install
npm --prefix srms-school/client run build

npm --prefix srms-student install --legacy-peer-deps
npm --prefix srms-student run build
npm --prefix srms-admin install
npm --prefix srms-admin run build
npm --prefix srms-student run typecheck
npm --prefix srms-student test

```

The School Admin Vite dev proxy defaults to `http://localhost:5000`; override `VITE_API_PROXY_TARGET` when needed. Web deployments use same-origin API paths; the Vue Student PWA does not require a school query parameter. Expo native commands remain available with `npm --prefix srms-student run native`, `android`, and `ios`; native devices need an explicit reachable API URL and a tenant-aware hostname/API setup.

The Student PWA manifest is dynamically served by the API at the edge's `/manifest.json` route and receives tenant-specific naming. Its service worker caches only same-origin app-shell/static files, never `/api/*`; each school hostname has a separate browser origin/cache.

## Production notes / current limits

- Configure TLS and a wildcard certificate at the Nginx edge for `*.srms.com`; this repository's unified Compose stack is HTTP-only for local development.
- The Super Admin Portal is served on `admin.<ROOT_DOMAIN>` by its own container.
- Password reset delivery, rate limiting, audit logging, and real student credential provisioning remain operational work; do not rely on the local seed credentials.
- Existing standalone Compose files and launchers are retained for compatibility, but multi-portal hostname testing must use the root Compose stack and root Nginx.

## Verification checklist

```sh
docker compose config --services
curl -i http://admin.sms.local
curl -i http://hanfia.sms.local/admin
curl -i http://hanfia.sms.local/login
curl -i http://hanfia.sms.local/api/health
curl -i http://hanfia.sms.local/api/student/school/brand
curl -i http://schoolb.sms.local/api/student/school/brand
curl -i http://doesnotexist.sms.local/api/student/school/brand
```

After startup, inspect `docker compose ps` and logs. Then log into each tenant with its own seeded `STU001` credentials and confirm Hanfia credentials fail on School B (and vice versa); validate `/admin/students` refresh and student nested-route refresh in a browser. A hostname mismatch should return a JSON 401/404, not data from another school.

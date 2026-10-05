# SRMS multi-portal system

This repository evolves the existing SRMS applications into a shared, multi-school deployment. It keeps one Express API, MongoDB, and Redis deployment; the existing school-management Vue app is renamed to `srms-school`, and the student web/PWA is Vue/Vite. Existing Expo/React Native source is retained for native builds. The default stack includes three active frontends: the School Admin Portal, Student PWA, and Super Admin Portal, backed by one shared API, MongoDB, and Redis.

## Audited application entry points

- `srmsapi/server/server.js` starts the Express API; existing API logic remains in `srmsapi/server/src`.
- `srms-school/client` is the existing Vue 3/Vite/Vue Router School Admin Portal, now built with base `/admin/`.
- `srms-student/web` is the Vue 3/Vite/Vue Router Student PWA. Existing Expo source remains under `srms-student/app` and `srms-student/src` for native development.
- `srms-admin` is the active Vue 3/Vite/Vue Router 4 Super Admin Portal, deployed as its own container at `admin.<ROOT_DOMAIN>`.
- Root `docker-compose.yml` starts `sms-nginx`, all three frontend services (`sms-school`, `sms-student`, `sms-admin`), `sms-api`, MongoDB, and Redis.

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
./setup up
```

Equivalent direct command:

```sh
docker compose up --build -d --wait --remove-orphans
```

The API waits for MongoDB and Redis, runs migrations, optionally seeds local data (`SEED_DEMO_DATA=true`), and then starts. Compose health checks gate Nginx startup. `./setup status`, `./setup logs`, `./setup restart`, `./setup down`, `./setup config`, and `./setup services` are also available. Volumes are preserved by `down`; `docker compose down -v` deletes MongoDB/Redis data.

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
- Hanfia demo Student: `STU001` / `student-local-only`
- School B School Admin: `schoolb-admin` / `schoolb-admin-local-only`
- School B demo Student: `STU001` / `schoolb-student-local-only`

These passwords are deliberately for local testing only. Set strong secrets in `.env`, use `SEED_DEMO_DATA=false` for production, and provision real user credentials. The existing legacy seed also includes a development `HIT` school/admin; do not use its default credentials in production.

Student passwords are bcrypt-hashed in `students.password_hash` (excluded from normal Mongoose reads/responses). School Admins can provide/reset a student's portal password in the existing Student form. Student login resolves Student ID/admission number/roll number inside the hostname-resolved school only.

School slugs cannot be changed through school edit. Reserved names include `admin`, `api`, `www`, `mail`, `smtp`, `cdn`, and `assets`. The platform API is available only on `admin.<ROOT_DOMAIN>` and requires a `SUPER_ADMIN` token. The local seed provisions `platform-admin` using `SUPER_ADMIN_PASSWORD`.

## Super Admin access

With `SEED_DEMO_DATA=true`, sign in at `http://admin.sms.local` using `platform-admin` and `SUPER_ADMIN_PASSWORD` (the local example password is `platform-admin-local-only`). Change this password before deployment. The portal calls only `/api/admin/*`; API authorization requires a Super Admin JWT and the `admin.<ROOT_DOMAIN>` hostname.

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

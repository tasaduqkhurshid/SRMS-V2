# SRMS Student Portal

The deployed Student Portal/PWA is Vue 3 + Vite + Vue Router, served by the root Nginx stack. It resolves school branding and authentication from the hostname and calls same-origin `/api/student/*` endpoints. The prior Expo/React Native code remains under `app/` and `src/` for optional native development.

## Integrated local setup

From the repository root, add `127.0.0.1 hanfia.srms.local schoolb.srms.local` to the OS hosts file, then run:

```sh
./start-all.sh up
```

Open `http://hanfia.srms.local/login`. See the root README for local seeded credentials, Docker services, tenant testing, and environment configuration.

## Student web/PWA development

```sh
npm install --legacy-peer-deps
npm run web
```

The Vite dev server runs on port 8080 and proxies `/api` to the configured `VITE_API_PROXY_TARGET` (default `http://localhost:5000`). Production uses relative API URLs through the shared Nginx ingress. Build with `npm run build`; run existing checks with `npm run typecheck` and `npm test`.

The school name and PWA manifest are loaded from the hostname-resolved tenant. The service worker only caches same-origin app shell/static files and does not cache `/api/*` responses.

## Optional native Expo source

Native source and commands remain available:

```sh
npm run native
npm run android
npm run ios
```

Native devices require `EXPO_PUBLIC_API_URL` to point to a reachable API ingress hostname; localhost on the device is not the development host. The local `.env.example` leaves this value unset intentionally.

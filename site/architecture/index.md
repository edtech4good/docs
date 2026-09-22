---
title: Architecture
description: How the cloud API, classroom API, admin UI and learner app fit together, and how content and progress move between them.
---

# Architecture

edtech4good is four repositories that together deliver a learning management
system: a central cloud API, a classroom edge API that runs on a Raspberry Pi
or any Linux box on the school network, an Angular admin and teacher web UI,
and a learner app built with Expo for Android, iOS and the web.

## Repository roles

| Repository | Role |
|------------|------|
| [edtech-lms-api](https://github.com/edtech4good/edtech-lms-api) | Central NestJS API. Schools, curriculum, users, object storage for media, `/sync/*` to package curriculum for a classroom server, `/log/import` to ingest a classroom activity log, JWT auth, and `POST /auth/school/login` for teacher and school login. |
| [edtech-lms-ui](https://github.com/edtech4good/edtech-lms-ui) | Angular 21 admin, teacher and student web UI. Talks to the central API via `environment.API_URL`. |
| [edtech-lms-rpi-api](https://github.com/edtech4good/edtech-lms-rpi-api) | Classroom NestJS API. Local MySQL, lessons, progress and quizzes, `GET /export/log`, `PUT /import/master` to receive a curriculum package, and student and teacher auth. |
| [edtech-expo](https://github.com/edtech4good/edtech-expo) | Expo app (React Native and web). Two HTTP bases: `EXPO_PUBLIC_BASE_URL`, usually the classroom server, and `EXPO_PUBLIC_SYNC_URL`, usually the central API. |

A legacy native Android app and a duplicate reporting UI were retired and are
not part of the current stack.

## End-to-end diagram

<svg class="arch-diagram" viewBox="0 0 900 420" width="100%" style="max-width:900px;height:auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="edtech-lms-ui and edtech-lms-api and object storage sit in an online central group on the left, connected by sync and login calls to edtech-lms-rpi-api and tablets or web clients in a classroom LAN group on the right.">
  <title>End-to-end architecture: online central services and classroom LAN services, linked by sync and login calls</title>
  <defs>
    <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" />
    </marker>
  </defs>

  <!-- Groups -->
  <rect class="grp" x="20" y="20" width="280" height="380" rx="12" />
  <text class="grplabel" x="40" y="44">Online / central</text>
  <rect class="grp" x="600" y="20" width="280" height="380" rx="12" />
  <text class="grplabel" x="620" y="44">Classroom LAN</text>

  <!-- Nodes: online / central -->
  <rect class="node" x="80" y="60" width="160" height="50" rx="8" />
  <text class="nodelabel" x="160" y="90">edtech-lms-ui</text>

  <rect class="node" x="80" y="180" width="160" height="50" rx="8" />
  <text class="nodelabel" x="160" y="210">edtech-lms-api</text>

  <rect class="node" x="80" y="300" width="160" height="70" rx="8" />
  <text class="nodelabel" x="160" y="330">
    <tspan x="160" dy="0">Object storage</tspan>
    <tspan x="160" dy="18">(S3-compatible)</tspan>
  </text>

  <!-- Nodes: classroom LAN -->
  <rect class="node" x="660" y="60" width="160" height="50" rx="8" />
  <text class="nodelabel" x="740" y="90">edtech-lms-rpi-api</text>

  <rect class="node" x="660" y="300" width="160" height="70" rx="8" />
  <text class="nodelabel" x="740" y="330">
    <tspan x="740" dy="0">Tablets / web</tspan>
    <tspan x="740" dy="18">clients</tspan>
  </text>

  <!-- Edges -->
  <path class="edge" d="M160,110 L160,178" marker-end="url(#arrowhead)" />

  <path class="edge" d="M160,230 L160,298" marker-end="url(#arrowhead)" />

  <path class="edge" d="M240,195 L420,195 L420,70 L658,70" marker-end="url(#arrowhead)" />
  <rect class="edgebg" x="385" y="44" width="170" height="36" />
  <text class="edgelabel" x="470" y="58">
    <tspan x="470" dy="0">POST /sync/cloud</tspan>
    <tspan x="470" dy="15">pushes zip</tspan>
  </text>

  <path class="edge" d="M740,298 L740,112" marker-end="url(#arrowhead)" />
  <rect class="edgebg" x="650" y="172" width="180" height="52" />
  <text class="edgelabel" x="740" y="188">
    <tspan x="740" dy="0">BASE_URL: auth,</tspan>
    <tspan x="740" dy="15">lessons, import,</tspan>
    <tspan x="740" dy="15">export</tspan>
  </text>

  <path class="edge" d="M660,335 L480,335 L480,215 L242,215" marker-end="url(#arrowhead)" />
  <text class="edgelabel" x="470" y="365">
    <tspan x="470" dy="0">SYNC_URL: /sync/content,</tspan>
    <tspan x="470" dy="15">auth/school/login</tspan>
  </text>
</svg>

## Runtime dependencies

| Component | Depends on |
|-----------|------------|
| Central API | MySQL, an S3-compatible object store for media, SMTP (optional), configured via `FORTYKAPICONFIG` or plain env vars in [src/config.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/config.ts) |
| Admin/teacher/student UI | The central API reachable from the browser; `API_URL` and `SCHEMA` in `environment.*.ts` point at it |
| Classroom API | MySQL, configured via `FORTYKAPIRPICONFIG` or `RPI_*` env vars in [src/config.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/config.ts) |
| Learner app | Network reachability to the configured classroom and central hosts |

## Ports and API docs

| Service | Default HTTP port | Swagger / OpenAPI UI |
|---------|-------------------|----------------------|
| Central API | `3000` (`PORT`) | `/docs`, see [src/server.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/server.ts) |
| Classroom API | `3000` (`RPI_PORT`) | `/docs`, see [src/server.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/server.ts) |
| Admin/teacher/student UI (dev) | `4200` | none |

Both APIs default to port 3000 because they normally run on separate
machines: the central API in the cloud, the classroom API on the Pi.

Both APIs mount Swagger only when `NODE_ENV` is `development` or `test`. In
any other environment `/docs` is not served.

## Expo environment matrix

| Variable | Typical classroom use | Typical online / sync use |
|----------|-----------------------|----------------------------|
| `EXPO_PUBLIC_BASE_URL` | Classroom server URL | Same classroom URL, or the central API if the deployment is unified |
| `EXPO_PUBLIC_SYNC_URL` | Central API base URL | Central API base URL |
| `EXPO_PUBLIC_RESOURCE_URL` / `EXPO_PUBLIC_RESOURCE_PATH` | Local or remote media location used by `useResource` | Same |
| `EXPO_PUBLIC_ACCESS_TYPE` | `offline` or `online`, read by `useResource` and `isOnlineOnly()` to switch resource loading | Same |

HTTP clients live in
[src/services/api/Api.ts](https://github.com/edtech4good/edtech-expo/blob/main/src/services/api/Api.ts):
one instance is built against `EXPO_PUBLIC_BASE_URL`, the other against
`EXPO_PUBLIC_SYNC_URL`.

## Sync and data flow

### A. Cloud to classroom: curriculum and master content

1. An admin on the central UI prepares content.
2. Server-side push: the central API's `POST /sync/cloud` builds a zip and
   `PUT`s it to the classroom server's `/import/master`, authenticated with
   `SERVER_SYNC_KEY`. See
   [sync.controller.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/modules/sync/sync.controller.ts).
3. Client-side path: the learner app downloads a zip from the central API's
   `GET /sync/content`, then `PUT`s it to the classroom server's
   `PUT /import/master`. The classroom API guards that route with AccessGuard
   for an ADMIN, SUPERADMIN or TEACHER token, or an `Authorization` header
   equal to the sync key. See
   [import.controller.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/modules/import/import.controller.ts).

### B. Classroom to cloud: student and activity logs

1. On the classroom server, `GET /export/log` returns a zip of activity
   logs. See
   [export.controller.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/modules/export/export.controller.ts).
2. The learner app downloads that zip from the classroom server.
3. The learner app uploads it to the central API's `PUT /log/import`. See
   [log.controller.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/modules/log/log.controller.ts).

### C. Teacher and student login

- Students on the classroom server typically sign in with `POST /auth/login`
  against `EXPO_PUBLIC_BASE_URL`.
- Teacher and school accounts typically sign in with
  `POST /auth/school/login` against the central API, `EXPO_PUBLIC_SYNC_URL`.

## Central API configuration for classroom integration

From the central API's
[src/config.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/config.ts),
these values control how the central API reaches a classroom server:

- `RPI_CLOUD` is the base URL of the classroom API used when
  `POST /sync/cloud` pushes content, and for the other server-to-server
  calls the central API makes to a classroom server (student and teacher
  import, reports).
- `SERVER_SYNC_KEY` authenticates that server-to-server `import/master`
  call.
- `RPI_SECRET` is the JWT secret for the `RPIACCESS` token type. No route
  currently uses it, but outside `development` and `test` the API refuses
  to start while it holds the placeholder value.

`SERVER_SYNC_KEY` and `RPI_SECRET` are secrets. `RPI_CLOUD` is deployment
configuration.

## See also

- [Classroom to cloud sync](/architecture/sync)
- [Authorization model](/architecture/authorization)
- [Object storage](/architecture/storage)
- [Self-hosting](/get-started/self-hosting)

---
title: Self-hosting
description: Run the full edtech4good stack on your own host with Docker Compose and Caddy.
---

# Self-hosting

This guide stands up a production instance of edtech4good on a single host:
the central API, the classroom API, the admin web UI and the learner web app,
behind one reverse proxy with automatic HTTPS. The kit it describes lives in
this repo under `deploy/` and `docker/`.

## What you get

Four application services behind Caddy, which terminates TLS and proxies each
hostname to the right container, getting certificates from Let's Encrypt
automatically. The only manual TLS work is pointing DNS at the host.

| Service | Image source | Port |
|---|---|---|
| `caddy` | official `caddy:2-alpine` | 80, 443 (published) |
| `central-api` | `deploy/edtech-lms-api.Dockerfile` | 3000 (internal) |
| `student-api` | `deploy/edtech-lms-rpi-api.Dockerfile` | 3001 (internal) |
| `admin-ui` | `edtech-lms-ui`'s own Dockerfile | 80 (internal) |
| `expo-web` | `deploy/edtech-expo-web.Dockerfile` | 80 (internal) |
| `mysql` (optional) | official `mysql:8.0`, `--profile with-db` | 3306 (internal) |

Only Caddy publishes ports. Every app container is reached through it, so
nothing else is exposed to the internet. MySQL can be a managed database you
point the stack at, or it can run on the same host under the `with-db` Compose
profile. See Backups below for why managed is the easier default.

The student API is a plain NestJS service despite the "Pi" in its repo name
(`edtech-lms-rpi-api`), and nothing here needs Raspberry Pi hardware. It's the
API the learner app talks to, and the one the central API proxies report
requests to.

## Sizing

2 vCPU / 4 GB is comfortable. The four services idle in well under 1 GB
combined. The headroom is for building the images, which is the
memory-hungry step, especially the Angular admin-UI build and the Expo web
export. A 2 GB host can run the stack but may run out of memory while
building it. On a small host, build one image at a time rather than letting
Compose build all four in parallel (see Bring the stack up below).

## Prerequisites

- A Linux host with Docker and Compose v2 installed.
- Four DNS A records pointing at the host: one each for the admin UI, the
  central API, the student API and the learner web app (for example
  `admin.`, `api.`, `student-api.` and `app.` under a domain you control).
- Ports 80 and 443 open. Port 80 stays open for Let's Encrypt's HTTP-01
  challenge and the HTTP→HTTPS redirect.
- Optional: an S3-compatible bucket for curriculum media, and SMTP
  credentials for staff self-service password reset email. Neither is
  required to bring the stack up.

## Get the code

Clone this docs repo, then clone the four application repos as siblings of it,
inside the same directory, not inside `deploy/`:

```bash
git clone https://github.com/edtech4good/docs.git
cd docs
git clone https://github.com/edtech4good/edtech-lms-api.git
git clone https://github.com/edtech4good/edtech-lms-rpi-api.git
git clone https://github.com/edtech4good/edtech-lms-ui.git
git clone https://github.com/edtech4good/edtech-expo.git
```

The layout matters because of how the build contexts are wired.
`docker-compose.prod.yml` lives in `deploy/`, and its API services build with
`context: ..`, this repo's root, so their Dockerfiles can `COPY
edtech-lms-api/` and `COPY edtech-lms-rpi-api/` from the sibling checkouts. If
a sibling repo is missing, the build fails on the first `COPY`.

## Build-time configuration

Two of the four services bake their API URL into the image at build time.
Changing either one means rebuilding that image. A runtime environment
variable won't do it.

**Admin UI.** Edit `edtech-lms-ui/src/environments/environment.prod.ts`
before building `admin-ui`:

```ts
export const environment = {
  production: true,
  API_URL: 'api.example.org',              // no scheme here
  SCHEMA: 'https',
  s3Link: 'https://your-s3-bucket.s3.amazonaws.com', // base URL for document/feedback uploads
  PAYLOAD_KEY: 'lms_access_payload',
  ALG_KEY: 'lms_access_alg',
  HASH_KEY: 'lms_access_hash',
  REFRESH_PAYLOAD_KEY: 'lms_refresh_payload',
  REFRESH_ALG_KEY: 'lms_refresh_alg',
  REFRESH_HASH_KEY: 'lms_refresh_hash',
  GRAMMARLY_CLIENT_ID: '',
};
```

Set `API_URL` to your central API's hostname (no `https://` prefix) and
`SCHEMA` to `https`. The `*_KEY` fields are `sessionStorage` key names for JWT
segments, not secrets. Any distinct strings work, and the values above are
fine as-is. Leave `GRAMMARLY_CLIENT_ID` blank unless you use it. `s3Link` is
the base URL the admin UI builds document and feedback-image links from, and
it always needs an S3-compatible bucket; see Media below for why this is
separate from the learner app's curriculum media.

**Expo web.** `expo export` inlines every `EXPO_PUBLIC_*` variable into the
static bundle at build time. These come from `.env.production` as Compose
build args: `EXPO_PUBLIC_BASE_URL` (the student API origin), and
`EXPO_PUBLIC_RESOURCE_URL` and `EXPO_PUBLIC_RESOURCE_PATH` (together they
locate curriculum media; see Media below). No file to edit, just rebuild
`expo-web` after changing them.

This kit does not set `EXPO_PUBLIC_SYNC_URL` for the learner web app, so its
school and teacher login and its content-sync paths are not configured;
learner login against the student API is. If you need them, add
`EXPO_PUBLIC_SYNC_URL` as a build arg in `docker-compose.prod.yml` and
`deploy/edtech-expo-web.Dockerfile` and set it to the central API URL.

## Media

Curriculum media (the images the learner app and admin UI show for
curriculums and levels) can be served two ways, chosen with the Expo web
build args from the previous section:

- **An S3-compatible bucket.** Set `EXPO_PUBLIC_RESOURCE_URL` to the bucket's
  base URL and `EXPO_PUBLIC_RESOURCE_PATH` to the folder inside it, then
  upload media there yourself.
- **This kit's local `/media` route.** Set `EXPO_PUBLIC_RESOURCE_URL` to your
  own Expo web origin (`https://app.example.org`) and
  `EXPO_PUBLIC_RESOURCE_PATH=media`, then drop files into `deploy/media/` on
  the host, following the naming convention in `deploy/media/README.md`.
  `deploy/Caddyfile` serves that directory at `/media/*`.

Either way, rebuild `expo-web` after changing these two values, since Expo
bakes them into the static bundle at build time.

This is separate from the admin UI's document and feedback-image uploads,
which always go through an S3-compatible bucket: the admin UI's `s3Link`
(baked into `environment.prod.ts`) and the central API's `AWS_*` settings.
The local `/media` route does not replace that bucket for those uploads.

## Secrets

```bash
cd deploy
cp .env.production.example .env.production
```

Fill every value marked `REQUIRED`. Generate each secret with:

```bash
openssl rand -hex 32
```

A few values need care:

- `SERVER_SYNC_KEY` must be the **identical** string for both APIs. It
  authenticates the central-to-student proxy. Set it once; both services read
  the same `.env.production`.
- `RPI_CLOUD` must be the student API's public URL (`https://` + its DNS
  name). The central API's Online reports proxy through this; get it wrong
  and reports 500 instead of loading.
- Leave `RPI_OFFLINE` unset. With it unset, the student API's bulk imports
  (`PUT /import/master`, `/import/students`, `/import/teachers`) accept only
  `SERVER_SYNC_KEY`, so no user login can replace content or rosters. Only a
  classroom Pi sets it (see below).
- `TRUST_PROXY=1` only makes sense behind Caddy, which this stack is. Don't
  set it if you ever run either API with nothing in front of it: a client
  could spoof `X-Forwarded-For` to dodge the rate limiter.
- Leave `LOG_IMPORT_ENABLED` unset. It is off by default, which turns off
  the central API's `PUT /log/import` (the classroom activity-log upload)
  entirely. Set it to `true` only for a deployment with classroom Pis that
  still uses that upload path.

Both APIs run with `NODE_ENV=production` in this stack, and both **fail
closed** on the placeholder secrets committed to their public repos: a
`REQUIRED` value left blank stops the container at boot instead of running
with a forgeable secret. Never commit `.env.production`.

## Migrate before serving traffic

Run each API's migrations in a one-off container before the stack serves any
traffic. Neither API runs migrations at boot, so this is the only thing that
applies them.

If MySQL runs on this host, before the first start replace `edtech_dev_pass` in
`docker/mysql-init/01-databases.sql` with a generated password (the file runs
once, on an empty data volume), then set `DB_HOST=mysql`, `RPI_DB_HOST=mysql`,
`DB_USER=edtech_local`, `RPI_DB_USER=edtech_local` and both `*_PASSWORD`
values to it. Then start MySQL and wait for it to report healthy:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production --profile with-db up -d --wait mysql
```

Then run the migrations. `central-api` and `student-api` have no
`depends_on` on `mysql`, so this step (and starting MySQL first when it's
on this host) is what keeps a migration from racing an empty database:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm central-api npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm student-api npm run db:migrate
```

Both APIs define `db:migrate` as `sequelize-cli db:migrate`. The central
API's migrations create its RBAC and seed data; the student API's create its
own separate schema.

## Bring the stack up

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Add `--profile with-db` if MySQL is running on this host rather than managed
elsewhere:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production \
  --profile with-db up -d --build
```

On the `with-db` profile, the `mysql-init` password swap already happened
before migrations (see Migrate before serving traffic above); nothing extra
is needed here.

On a small host, build one image at a time instead. `caddy` depends on all
four app services, so `up -d --build caddy <service>` still builds every
image; build each service on its own with `build`, then bring the stack up
without rebuilding:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build central-api
docker compose -f docker-compose.prod.yml --env-file .env.production build student-api
docker compose -f docker-compose.prod.yml --env-file .env.production build admin-ui
docker compose -f docker-compose.prod.yml --env-file .env.production build expo-web
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Add `--profile with-db` to that last command when MySQL is on this host.

## First login

The central API's migrations create a `superadmin@superadmin.com` account,
but its seeded password hash is a legacy value nobody holds. There's also a
`seed:local` script in `edtech-lms-api` that sets a known password on that
account, but it's not a supported path here. It exists for local development
databases: it prints the plaintext to stdout, defaults to a value hard-coded
in that script, and refuses to run without `ALLOW_LOCAL_DEV_SEED=true`.

Set the password directly instead, using the API's own hashing function so
the row is stored correctly (bcrypt wrapping an md5 digest, not raw MD5):

```bash
cd deploy
# type the new password, then Enter (nothing is echoed)
read -rs NEWPASS
HASH=$(docker compose -f docker-compose.prod.yml --env-file .env.production exec -T \
  -e NP="$NEWPASS" central-api \
  node -e 'console.log(require("./build/services/password.service").hashPassword(process.env.NP))')
```

Then write `$HASH` into `lmsusers` for
`lmsuserid='5ec8814c-4390-40e3-8d93-828adca9aa08'` (the fixed ID the
migration seeds `superadmin@superadmin.com` with).

On the `with-db` profile, the `mysql` container only has
`MYSQL_ROOT_PASSWORD` in its environment, not the API's `DB_NAME`, so this
passes `HASH` in explicitly and writes the database name literally (your
`DB_NAME`, `edtech_lms` by default):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T \
  -e HASH="$HASH" mysql sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" edtech_lms -e "UPDATE lmsusers SET lmsuserpasswordhash=\"$HASH\" WHERE lmsuserid=\"5ec8814c-4390-40e3-8d93-828adca9aa08\";"'
unset NEWPASS HASH
```

Against a managed MySQL instead, run the `mysql` client from the host with
its connection details. This loads `$DB_HOST`, `$DB_USER` and `$DB_NAME` from
`.env.production` into the shell first, since they're not set there otherwise:

```bash
set -a; . .env.production; set +a
mysql -h "$DB_HOST" -u "$DB_USER" -p -D "$DB_NAME" -e \
  "UPDATE lmsusers SET lmsuserpasswordhash='$HASH' WHERE lmsuserid='5ec8814c-4390-40e3-8d93-828adca9aa08';"
unset NEWPASS HASH
```

Record the password in a password manager immediately. This account only
exists once, and there's no recovery path other than repeating this step.

## Verify

Check each hostname resolves and Caddy has a cert:

```bash
curl -I https://admin.example.org
curl -I https://api.example.org
curl -I https://student-api.example.org
curl -I https://app.example.org
```

The first request per hostname can take a few seconds while Caddy obtains its
certificate. Swagger (`/docs`) is intentionally **not** available on either
API in this stack. Both mount it only when `NODE_ENV` is `development` or
`test`, as a deliberate anti-recon measure, and this compose file sets
`NODE_ENV=production`. A 404 there is expected.

Then the real smoke test:

1. Log in to the admin UI as `superadmin@superadmin.com` with the password
   from the previous step.
2. Load an Online report in the admin UI. This exercises the central-to-student
   proxy. Success proves `RPI_CLOUD` and `SERVER_SYNC_KEY` are set correctly
   on both APIs. A 500 here is almost always that pair being wrong.
3. Open the learner web app and confirm it loads.

## Backups

A managed MySQL provider backs up automatically. That's the main reason it's
the easier default. If MySQL runs on the host instead (`with-db`), back it up
yourself with `deploy/scripts/backup-databases.sh` from cron:

```bash
# crontab -e
0 3 * * * /path/to/docs/deploy/scripts/backup-databases.sh
```

The script dumps both databases with `mysqldump`, gzips them into a dated
file, checks the dump isn't suspiciously small, and prunes anything older
than `KEEP_DAYS` (default 14). A backup that has never been restored is a
hope, not a backup. Test the restore path before you need it for real.

## Updating a running stack

```bash
for r in edtech-lms-api edtech-lms-rpi-api edtech-lms-ui edtech-expo; do
  git -C "$r" pull --ff-only origin main
done
cd deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build central-api
# repeat per service that changed, then:
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm central-api npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm student-api npm run db:migrate
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

Rebuild one service at a time on a small host, as with first bring-up.
Migrate again after every update even if nothing schema-related changed. A
migration run is a no-op when there's nothing new, and skipping it is how a
stack quietly drifts from what its code expects.

## Not covered here

- A secret manager. This kit uses a plain `.env.production` file on the host.
- Raspberry Pi classroom images. The student API runs fine as a regular
  container; building an image for actual Pi hardware is a separate exercise.
  One setting is already decided: a classroom Pi must run the student API
  with `RPI_OFFLINE=true` (or `"offline": true` in `FORTYKAPIRPICONFIG`, which
  replaces the `RPI_*` variables when set). That lets a teacher or admin token
  load content with `PUT /import/master`, since a Pi with no internet can't
  receive central's push. Roster imports stay sync-key only, even on a Pi.
- Uptime monitoring and alerting.

For how the pieces fit together, see [Architecture](/architecture/) and
[Object storage](/architecture/storage).

---
title: Local development
description: Set up the four edtech4good repos and MySQL on your own machine and run the whole stack locally.
---

# Local development

edtech4good is four repositories that work together: a central cloud API, a
classroom API that runs on a Raspberry Pi or any Linux box on a school
network, an Angular admin and teacher web app, and an Expo learner app for
phones, tablets and web. This guide gets all four running on one machine
against a local MySQL, so you can sign in and exercise the product end to
end.

It covers the web build of the learner app only. Running it as a native
Android or iOS app needs different API hostnames and its own setup, which
this guide does not cover.

## Prerequisites

- Git
- MySQL 8, or Docker to run the MySQL image this guide uses
- Node 22 for the admin UI (its `package.json` requires 22.12 or newer). Node
  20 or 22 for the two APIs.
- Node 18.19.1 and Yarn 1 for the learner app. It pins this version in its
  EAS build profiles, and a `package-lock.json` next to its `yarn.lock` will
  cause problems, so install dependencies with `yarn`, not `npm`.

If you don't already have the right Node version available, a version
manager such as `nvm` makes it easy to switch between the API/UI repos and
the learner app.

## Layout

Clone this docs repository first, then clone the four application repos as
siblings inside it. This repo's `.gitignore` already ignores those four
folder names, so cloning them here keeps your checkout clean.

```bash
git clone https://github.com/edtech4good/docs.git
```

```bash
cd docs
```

```bash
git clone https://github.com/edtech4good/edtech-lms-api.git
```

```bash
git clone https://github.com/edtech4good/edtech-lms-rpi-api.git
```

```bash
git clone https://github.com/edtech4good/edtech-lms-ui.git
```

```bash
git clone https://github.com/edtech4good/edtech-expo.git
```

You should now have `edtech-lms-api`, `edtech-lms-rpi-api`, `edtech-lms-ui`
and `edtech-expo` folders alongside `docker-compose.yml`.

## MySQL

Both APIs need MySQL 8. They expect two databases: `edtech_lms` for the
central API and `edtech_lms_rpi` for the classroom API.

### Option A: Docker

From the root of this repo, start MySQL:

```bash
docker compose up -d
```

The first start takes thirty to sixty seconds while MySQL initializes its
data directory and the init script creates both databases and an app user.
Check on it with:

```bash
docker compose ps
```

Wait until the `mysql` service reports healthy before continuing.

The init script (`docker/mysql-init/01-databases.sql`) creates:

| Role | User | Password | Notes |
|------|------|----------|-------|
| App (use in both APIs) | `edtech_local` | `edtech_dev_pass` | Full access to `edtech_lms` and `edtech_lms_rpi` |
| Root (admin, debugging) | `root` | `edtech_root_dev` | For manual SQL, not required to run either API |

These are development-only defaults, committed to a public repository.
Change them in `docker-compose.yml` and `docker/mysql-init/01-databases.sql`
if this container will ever be reachable from anything other than your own
machine.

To wipe the database and start over, the init script only runs against an
empty data volume:

```bash
docker compose down -v
```

```bash
docker compose up -d
```

Then run migrations again in both API projects.

### Option B: your own MySQL

Install MySQL 8 however you prefer, then create the two databases and a user
yourself:

```sql
CREATE DATABASE edtech_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE edtech_lms_rpi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'edtech_local'@'%' IDENTIFIED BY 'choose-your-own-password';
GRANT ALL PRIVILEGES ON edtech_lms.* TO 'edtech_local'@'%';
GRANT ALL PRIVILEGES ON edtech_lms_rpi.* TO 'edtech_local'@'%';
FLUSH PRIVILEGES;
```

Use `utf8mb4` and `utf8mb4_unicode_ci` for both databases. The product is
taught in Khmer, and anything less than `utf8mb4` will eventually corrupt or
reject Khmer text. See [Khmer text](/reference/khmer-text).

## Secrets

Both APIs sign JSON Web Tokens for auth, and each one refuses to start with
the placeholder secrets it ships with (in `env.example` for the central API,
as compiled-in defaults for the classroom API) unless `NODE_ENV` is
explicitly `development` or `test`. An unset `NODE_ENV` is treated as
production on purpose: the failure mode this guards against is a real
deployment quietly running on secrets anyone can read in the public repo.

For real local work, generate your own secrets rather than relying on the
`NODE_ENV=development` escape hatch:

```bash
openssl rand -hex 32
```

Run that twice and use a different value for the central API's
`APPLICATION_SECRET` and the classroom API's equivalent secret. There is no
need for the two APIs to share a signing key, and normally they should not.

Setting `NODE_ENV=development` in both `.env` files still matters even once
you have real secrets: it is also what puts both APIs into their permissive
local CORS mode, so the admin UI (port 4200) and the learner app's web build
(port 8081) can call them without extra configuration.

## Central API

The central API is the source of truth: schools, users, curriculum, quiz
content and the logs classrooms sync back. It's a NestJS app on MySQL, using
Sequelize.

```bash
cd edtech-lms-api
```

```bash
npm install
```

```bash
cp env.example .env
```

`env.example` ships with a one-line `FORTYKAPICONFIG` JSON value already
set. Comment out or delete that line: with it present, the app uses the JSON
blob instead of the plain variables below, and the JSON blob still carries
placeholder secrets and a placeholder database password. Once it's gone, set
in `.env`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=edtech_lms
DB_USER=edtech_local
DB_PASSWORD=edtech_dev_pass
APPLICATION_SECRET=paste-one-openssl-output-here
```

AWS S3 and SMTP variables are also in `env.example`. Neither is required to
start the app or to sign in. Without S3 configured, some media upload and
media URL features won't work; without SMTP, the app just won't send email.

Run migrations, then start the app:

```bash
npm run db:migrate
```

```bash
npm run start:dev
```

The API listens on port 3000. Swagger is at
`http://localhost:3000/docs` (mounted only when `NODE_ENV` is `development`
or `test`), and it's a reasonable way to exercise the API before the admin UI
is running.

Seed a database you can actually log in to and look at (see
[Users and data](#users-and-data) below):

```bash
ALLOW_LOCAL_DEV_SEED=true npm run seed:local
```

```bash
ALLOW_DEMO_SEED=true npm run seed:demo
```

::: warning
On the current main branch, the local superadmin seed writes a password hash
that the login check no longer accepts, so from a fresh seed no account can
sign in to the admin UI. Until the seed is fixed, set the superadmin
password directly with the API's own hashing function instead. Run these in
the same terminal, still inside `edtech-lms-api`, because the `HASH`
variable only exists in the shell that sets it:
:::

```bash
npm run build
```

```bash
HASH=$(node -e 'console.log(require("./build/services/password.service").hashPassword(process.argv[1]))' 'ChooseAPassword1')
```

```bash
docker exec -i edtech-mysql mysql -uroot -pedtech_root_dev edtech_lms -e "UPDATE lmsusers SET lmsuserpasswordhash='$HASH' WHERE lmsuserid='5ec8814c-4390-40e3-8d93-828adca9aa08';"
```

This builds the API, computes a bcrypt hash the same way the API itself
does, and writes it straight into the local Docker MySQL container onto the
fixed superadmin row the migrations create. If you run your own MySQL
instead of the Docker container, run the same `UPDATE` with your own
`mysql` client as any user with write access to `edtech_lms`. Sign in to the admin UI at
`http://localhost:4200` with `superadmin@superadmin.com` and the password
you chose above.

## Classroom API

The classroom API is the offline-capable half of the system. It runs on a
Raspberry Pi, or any Linux box, on a school's own network in a real
deployment; for local development it just runs on your machine as a second
NestJS process against the second database. Content arrives here as a zip
from the central API, and student logs go back the same way.

Run it on a different port than the central API so both can run together.
This guide uses 3001.

```bash
cd edtech-lms-rpi-api
```

```bash
npm install
```

```bash
cp env.example .env
```

As with the central API, `env.example` ships with a one-line
`FORTYKAPIRPICONFIG` JSON value. Comment it out or delete it so the app
builds its configuration from plain variables instead:

```env
NODE_ENV=development
RPI_PORT=3001
RPI_DB_HOST=127.0.0.1
RPI_DB_PORT=3306
RPI_DB_NAME=edtech_lms_rpi
RPI_DB_USER=edtech_local
RPI_DB_PASSWORD=edtech_dev_pass
```

If you want a real secret rather than relying on `NODE_ENV=development`, add
one from the `openssl` command above:

```env
RPI_APPLICATION_SECRET=paste-a-different-openssl-output-here
```

Run migrations, then start:

```bash
npm run db:migrate
```

```bash
npm run start:dev
```

Swagger is at `http://localhost:3001/docs` (mounted only when `NODE_ENV` is
`development` or `test`).

Seed the student and teacher accounts the learner app logs in with (see
[Users and data](#users-and-data)):

```bash
ALLOW_DEMO_SEED=true npm run seed:demo
```

The learner app reads lessons from the classroom API, not the central one,
so the demo content has to be seeded into this database too. It uses the
same fixture IDs as the central `seed:demo`, so the two databases end up
looking the way they would after a sync:

```bash
ALLOW_DEMO_SEED=true npm run seed:content
```

## Admin UI

The admin UI is where you create schools, curriculum and users against the
central API. It's an Angular app.

```bash
cd edtech-lms-ui
```

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag works around one dev-only tooling package
whose peer range doesn't cover the current Angular CLI; it doesn't affect
the build. `src/environments/environment.ts` is checked into the repo and
already points at `http://localhost:3000`, so there's nothing to configure
for a default local setup. If you need to point it elsewhere, copy
`environment.example.ts` over it and edit `API_URL` and `SCHEMA`.

```bash
npm start
```

Open `http://localhost:4200` and sign in as the superadmin, using the
password you set with the workaround under [Central API](#central-api)
above.

## Learner app for web

The learner app is built with Expo and React Native, and runs the same
codebase on Android, iOS and web. This guide covers the web build, which
needs no mobile toolchain.

```bash
cd edtech-expo
```

```bash
yarn install
```

```bash
cp env.example .env
```

`env.example` already points `EXPO_PUBLIC_BASE_URL` and `EXPO_PUBLIC_SYNC_URL`
at the local stack (classroom API on 3001, central API on 3000). Change the
two `EXPO_PUBLIC_RESOURCE_*` lines so `.env` reads:

```env
EXPO_PUBLIC_ENV=Development
EXPO_PUBLIC_ACCESS_TYPE=online
EXPO_PUBLIC_BASE_URL=http://127.0.0.1:3001
EXPO_PUBLIC_SYNC_URL=http://127.0.0.1:3000
EXPO_PUBLIC_RESOURCE_URL=http://127.0.0.1:8081
EXPO_PUBLIC_RESOURCE_PATH=media
```

`EXPO_PUBLIC_BASE_URL` is the classroom API: student login, lessons and
quizzes. `EXPO_PUBLIC_SYNC_URL` is the central API: content sync and school
login. `EXPO_PUBLIC_RESOURCE_URL` and `EXPO_PUBLIC_RESOURCE_PATH` are where
lesson media is served from. The demo seeds reference question images that
are checked into `edtech-expo/public/media`, which Metro serves, so pointing
`EXPO_PUBLIC_RESOURCE_URL` at the Metro origin with
`EXPO_PUBLIC_RESOURCE_PATH=media` (the values above) makes question images
load. Lesson video still won't load, because no video is seeded.

Expo bakes `EXPO_PUBLIC_*` values into the bundle at build time, so any
change to `.env` needs a fresh start:

```bash
yarn start
```

The `start` script already clears the bundler cache. Press `w` when the CLI
prompts you, or run `npx expo start --web` directly, to open the app in your
browser.

## Run order

A typical first run, in order:

1. MySQL: `docker compose up -d` from this repo's root, and wait for it to
   report healthy.
2. Central API: install, migrate, seed, start (port 3000).
3. Admin UI: install, start (port 4200). Optional, but the fastest way to
   create schools and curriculum once you've applied the superadmin
   password workaround above.
4. Classroom API: install, migrate, seed (both `seed:demo` and
   `seed:content`), start (port 3001).
5. Learner app: install, start, press `w` for web.

You can skip the admin UI and use Swagger on
`http://localhost:3000/docs` instead for admin
actions without needing the password workaround, but the UI is usually
faster once you're doing more than a couple of API calls.

## Users and data

**Central API superadmin.** Migrations create a superadmin account with a
password nobody knows. `ALLOW_LOCAL_DEV_SEED=true npm run seed:local` (from
`edtech-lms-api`) is the intended way to set it to a known value:

- Username: `superadmin@superadmin.com`
- Password: `LocalDev_Superadmin1`

Override the password with `SUPERADMIN_PASSWORD='something-else'` on the
same command. This seed only ever touches that one account, and it refuses
to run at all unless `ALLOW_LOCAL_DEV_SEED=true` is set explicitly, so it
can't be run against a real deployment by accident.

::: warning
See the workaround under [Central API](#central-api) above: this seed alone
does not currently produce a password the admin UI will accept.
:::

**Central API demo content.** `ALLOW_DEMO_SEED=true npm run seed:demo` (from
`edtech-lms-api`) creates one small vertical slice of content: a country, a
school, a curriculum, lessons and quiz questions, plus a teacher and a few
students, so the admin UI's reporting screens have something to show. It's a
development fixture, not real curriculum content. The teacher account it
creates signs in through the learner app's school login, not the admin UI,
which only accepts the superadmin and staff accounts described above.

**Classroom API demo accounts.** `ALLOW_DEMO_SEED=true npm run seed:demo`
(from `edtech-lms-rpi-api`) is what actually creates the accounts the
learner app logs in with: a student account and a teacher account, both
with the password `demo`. The script prints the exact usernames it created
when it finishes.

**Classroom API demo content.** `ALLOW_DEMO_SEED=true npm run seed:content`
(from `edtech-lms-rpi-api`, after `seed:demo`) seeds the same demo lessons
and quiz questions into the classroom database, using the same fixture IDs
as the central `seed:demo`. The learner app reads lessons from the
classroom API, not the central one, so without this step the accounts above
can sign in but see no lessons.

**One token per user.** Both APIs issue a single access token per account at
a time. Signing in again from anywhere else, including a `curl` command
against `/auth/login`, ends the previous session. If a browser tab
mysteriously goes blank right after you test an endpoint from the terminal,
this is almost always why.

**Production-like data.** There's no full curriculum seed in these repos.
For anything closer to a real deployment, use the admin UI or Swagger to
build schools and curriculum by hand, or import or sync data the way your
own deployment does.

## Troubleshooting

**A server won't start, or you're testing an old build.** Nest's watch mode
can leave a previous process holding a port after a crash or a restart; the
new one then fails with `EADDRINUSE`, or worse, you're actually still
talking to the old build. Check what's listening before you trust a
surprising result:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Swap in 3001, 4200 or 8081 for the other services.

**A browser session goes blank right after an API check.** As above: one
access token per user. Testing a login endpoint with `curl` while you're
signed in to the same account in a browser ends the browser's session.

**An API exits immediately complaining about placeholder secrets.** That's
the guard described under [Secrets](#secrets). Either set `NODE_ENV` to
`development` (or `test`) for local work, or set real values for every
secret the error lists (the central API checks `APPLICATION_SECRET`,
`SERVER_SYNC_KEY`, `APPLICATION_API_KEY` and `RPI_SECRET`; the classroom API
checks `RPI_APPLICATION_SECRET` and `RPI_SERVER_SYNC_KEY`) and a non-default
database password.

**MySQL authentication fails from the host.** If you're using the Docker
option, the init script creates `edtech_local` with host `%`, so host
connections should just work; double check `DB_PORT` / `RPI_DB_PORT` in your
`.env` files match the port you exposed. If you installed your own MySQL,
make sure the app user's host allows connections from wherever your Node
process actually runs, since `localhost` and `127.0.0.1` are not always
interchangeable in MySQL's own user matching.

**Something with Khmer text is broken but the same code path works in
English.** The product is taught in Khmer, and Khmer needs `utf8mb4` end to
end: database character set, collation and connection charset. An
ASCII-only test can pass while a Khmer-specific bug ships. See
[Khmer text](/reference/khmer-text) for more on this.

## Next steps

- [Self-hosting](/get-started/self-hosting) for running this outside your
  own machine.
- [Testing and verification](/contributing/testing) for the checks to run
  before you trust a change.
- [Architecture](/architecture/) for how the four apps and the sync flow fit
  together.

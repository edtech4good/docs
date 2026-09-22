# Central LMS API (edtech-lms-api): production image.
#
# Build context is this repo's root (see docker-compose.prod.yml), because the
# host checks out all four app repos as siblings of it and this Dockerfile
# lives in this repo, not in the API repo. That is also why every COPY is
# prefixed with `edtech-lms-api/`.
#
# The API repo has no Dockerfile of its own yet; when one is added there, point
# the compose `build` back at it and delete this file.

FROM node:22-alpine AS build
WORKDIR /app
COPY edtech-lms-api/package*.json ./
# ci (not install) for a reproducible build from the lockfile. Dev deps are kept
# on purpose: sequelize migrations run through ts-node against the .ts files in
# src/db/migrations (see .sequelizerc), so ts-node must survive into runtime.
RUN npm ci
COPY edtech-lms-api/ ./
RUN npm run build   # nest build -> outDir "build", entry build/server.js

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Whole tree incl. node_modules (with ts-node) and src/ (migrations live there).
COPY --from=build /app ./
# PORT is read from the environment (config.ts). Compose sets it; default 3000.
EXPOSE 3000
# nest-cli entryFile is "server"; the package "start:prod" script (dist/main) is
# stale: the real entry is build/server.js.
CMD ["node", "build/server.js"]

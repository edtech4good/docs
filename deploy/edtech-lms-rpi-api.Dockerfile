# Student ("Pi") API (edtech-lms-rpi-api): production image.
#
# Despite the name this is a plain NestJS app and runs fine on any VPS; the
# "Pi" is hardware, not a requirement. It is the API the Expo app authenticates
# and syncs against.
#
# Build context is this repo's root (see docker-compose.prod.yml); COPYs are
# prefixed with `edtech-lms-rpi-api/`. Move this into the API repo when it gets
# its own Dockerfile.

FROM node:22-alpine AS build
WORKDIR /app
COPY edtech-lms-rpi-api/package*.json ./
RUN npm ci
COPY edtech-lms-rpi-api/ ./
RUN npm run build   # nest build -> outDir "build", entry build/server.js

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
# Distinct from the central API's 3000 so both can share one host. RPI_PORT
# is read from config.ts; compose sets it to 3001.
EXPOSE 3001
CMD ["node", "build/server.js"]

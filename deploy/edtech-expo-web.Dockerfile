# Expo web build (edtech-expo): static export served by nginx.
#
# The learner/teacher web client. `expo export -p web` produces a static bundle;
# there is no Node server at runtime. Build context is this repo's root (see
# docker-compose.prod.yml).
#
# IMPORTANT: the API base URL is BAKED IN AT BUILD TIME. Expo inlines every
# EXPO_PUBLIC_* variable into the bundle during `expo export`, so these are build
# args, not runtime env. Rebuild the image to change them.

FROM node:22-alpine AS build
WORKDIR /app
# EXPO_PUBLIC_BASE_URL    -> the STUDENT API origin (this is what the app calls)
# EXPO_PUBLIC_RESOURCE_URL -> the base URL for curriculum media (e.g., S3/CDN or /media)
# EXPO_PUBLIC_RESOURCE_PATH -> the path segment joined between URL and filename
ARG EXPO_PUBLIC_BASE_URL
ARG EXPO_PUBLIC_RESOURCE_URL
ARG EXPO_PUBLIC_RESOURCE_PATH
ENV EXPO_PUBLIC_BASE_URL=${EXPO_PUBLIC_BASE_URL}
ENV EXPO_PUBLIC_RESOURCE_URL=${EXPO_PUBLIC_RESOURCE_URL}
ENV EXPO_PUBLIC_RESOURCE_PATH=${EXPO_PUBLIC_RESOURCE_PATH}
# yarn, not npm: edtech-expo standardized on yarn and gitignores
# package-lock.json, so `npm ci` has no lockfile and fails. yarn's
# frozen lockfile also keeps this image's dependency tree identical to dev
# machines (the repo's npm-only "overrides" block is ignored by yarn v1 on
# both sides).
COPY edtech-expo/package.json edtech-expo/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY edtech-expo/ ./
RUN npx expo export -p web   # -> ./dist

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback so client-side routes resolve to index.html.
# index.html must never be cached: it references the hashed bundle, and a cached
# copy keeps serving the previous bundle after a deploy.
# The hashed bundles under /_expo/static/ are immutable, so cache those forever.
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n  location = /index.html {\n    add_header Cache-Control "no-cache";\n  }\n  location /_expo/static/ {\n    add_header Cache-Control "public, max-age=31536000, immutable";\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

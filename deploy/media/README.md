# Media files

Optional local route for curriculum media, used instead of an S3-compatible
bucket. The route is provided by `deploy/Caddyfile`, which serves this
directory at `https://<app-domain>/media/*`, and `docker-compose.prod.yml`
mounts it read-only into the `caddy` container.

To use it, set `EXPO_PUBLIC_RESOURCE_URL` to your Expo web app's own origin
and `EXPO_PUBLIC_RESOURCE_PATH=media` (see the guide, "Media"), then drop
curriculum and level media here with naming: `curriculum-<id>.jpg` and
`level-<id>.jpg`.

**Do NOT commit media binaries to this repo.**

This is unrelated to the admin UI's document and feedback-image uploads,
which always go through an S3-compatible bucket (`s3Link` and the `AWS_*`
settings). This local route does not replace that bucket.

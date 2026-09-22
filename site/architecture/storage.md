---
title: Object storage
description: Making object storage optional, not AWS-by-default, and unlocking S3-compatible stores for self-hosted deployments.
---

# Object storage

The goal: don't require setting up Amazon S3 for every deployment. Good news, the platform is closer to that than it looks, and the first 90% is a config change, not a rewrite.

Media (curriculum images, audio, video, uploaded documents) is stored via `AWSService` in `edtech-lms-api/src/services/aws.service.ts` and fetched by the Expo app over HTTP from a resource base (`EXPO_PUBLIC_RESOURCE_URL`), cached for offline.

## What's already true

- **The S3 client already takes a configurable endpoint.** Every call reads `endpoint: Config.fortyk.api.aws.endpoint` (`AWS_ENDPOINT`, defaulting to `s3.amazonaws.com`). So "S3" here really means **any S3-compatible object store**, the AWS default is just a default, not a lock-in.
- **The surface is tiny and contained:** four methods (`uploadS3`, `uploadS3InFolder`, `checkExistS3Object`, `preSignURL`) used across three files. That's a clean seam to abstract.
- **One thing is hardcoded and blocks the self-hosted option:** `s3ForcePathStyle: false` appears in all five client constructions. AWS and most managed S3-compatible stores are happy with virtual-hosted style (`false`), but **MinIO and some S3-compatible stores require path-style (`true`)**. So the single code change that unlocks "no external provider at all" is making that value config-driven.
- **The client config is duplicated**, `new S3({...})` is rebuilt inline in all five methods. Centralizing it is the natural place to hang any of this.

## Two layers, in order of effort

### Layer 1, "not Amazon" is essentially config (do this first)

Point the existing client at an S3-compatible store. No new storage code beyond one small fix:

- **A managed S3-compatible service** (DigitalOcean Spaces, Cloudflare R2, Backblaze B2, Wasabi), a natural choice, since each offers an S3 API, often a built-in CDN, and **no AWS account**. These work with the current `s3ForcePathStyle: false`. Set `AWS_ENDPOINT` + keys to the provider's values and point `EXPO_PUBLIC_RESOURCE_URL` at its CDN URL.
- **Self-hosted MinIO**. S3-compatible, runs in a container on the same host: a fully self-contained deployment with no external object store. **Needs `s3ForcePathStyle: true`**, so this is the one that requires the config-driven fix above (`AWS_S3_FORCE_PATH_STYLE`, centralizing the client).

For most deployments this is the whole answer: **use a managed S3-compatible service or MinIO, never an AWS account.** The work is: centralize the client, make `s3ForcePathStyle` config, and document the per-store settings. Small, low-risk.

### Layer 2, truly optional (no object store at all)

If a deployment must run with **only the app server's disk**, no S3-compatible service anywhere, that needs a real abstraction:

- A `StorageProvider` interface (`put`, `getPublicUrl`, `exists`, `presignUpload?`, `delete`) with two implementations: `S3StorageProvider` (the current behaviour, any endpoint) and `LocalStorageProvider` (files on a mounted volume, served over HTTP by Caddy at the resource base).
- Selected by a `STORAGE_DRIVER` config. The four-method surface makes this a contained refactor, not a sprawl.

Recommend this only for the smallest single-box deployments, with local disk you own backups, there's no CDN, and storage shares the app server's fate.

## The one coupling to respect: the app fetches media by URL

The Expo app resolves every asset as `EXPO_PUBLIC_RESOURCE_URL` + name and caches it for offline. So whatever the backend, it must expose files at a **stable public URL base**:

- S3-compatible → the bucket/CDN URL is that base.
- Local → Caddy (or the API) serves the media directory at a resource path, and `EXPO_PUBLIC_RESOURCE_URL` points there.

The abstraction is really "where do the bytes live, and what is their public URL base", the app only ever cares about the base. Two backend-specific bits sit under it: **presigned direct-upload** (the admin UI's `preSignURL` path) is an S3-compatible feature; a local driver uploads **through the API** instead (`POST /document/upload` already streams through the API, so that path exists).

## Naming

The config is `AWS_*` and the service is `AWSService`, which implies a lock-in that isn't real. Renaming to `STORAGE_*` / a storage service (keeping `AWS_*` as accepted aliases for a release) would stop the naming from steering every deployment toward an AWS account. Cosmetic, do it whenever the abstraction lands.

## Recommendation

1. **Default the product to S3-compatible, not AWS.** For self-hosted deployments that's a **managed S3-compatible service** (managed + CDN) or **MinIO** (self-hosted on the host). This alone satisfies "no Amazon per deployment."
2. **Quick win:** centralize the duplicated `new S3({...})` and make `s3ForcePathStyle` config-driven, unlocks MinIO and any path-style store, with no behaviour change for existing AWS/managed-service setups.
3. **Add the `StorageProvider` + local driver** only if a genuine no-object-store deployment is required; otherwise a managed S3-compatible service or MinIO covers it.

Storage backend is **configuration, not a fork**, a deployment picks a driver + endpoint, not a code branch.

## Note: the student API also touches storage

The student API (`edtech-lms-rpi-api`) has an S3 touchpoint too, so the same config (and, if built, the same abstraction) applies there, mirror it rather than let the two repos diverge.

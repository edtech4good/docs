---
title: Get started
description: What edtech4good is and where to start depending on what you want to do.
---

# Get started

edtech4good is an open-source, offline-first learning management system for
classrooms with unreliable or no internet. A cloud LMS holds curriculum,
accounts and reporting. A classroom server, usually a Raspberry Pi on the
school network, serves lessons to tablets with no internet required. A
learner app runs on the tablets in Khmer and English. Content syncs down from
the cloud to the classroom server, and student progress syncs back up when a
connection is available.

## Three doors

- **Run it on your laptop.** Get the API, UI and learner app running locally
  to explore the code or develop a change. See
  [Local development](/get-started/local-development).
- **Host it for a school or programme.** Stand up the cloud API, the
  classroom server and the web UI for real use. See
  [Self-hosting](/get-started/self-hosting).
- **Understand how the pieces fit.** Read the system overview, the sync
  flows and the ports and repos involved. See [Architecture](/architecture/).

## What you need

- Node 22
- MySQL 8
- Docker, for the hosted path
- An S3-compatible object store for media. This is optional for a first
  local run; see [Object storage](/architecture/storage).

## Where the code is

- [edtech-lms-api](https://github.com/edtech4good/edtech-lms-api) is the
  central cloud API: schools, users, curriculum, quiz content and student
  logs.
- [edtech-lms-rpi-api](https://github.com/edtech4good/edtech-lms-rpi-api) is
  the classroom API that runs on a Raspberry Pi or any Linux box on the
  school network. It serves lessons and records progress locally.
- [edtech-lms-ui](https://github.com/edtech4good/edtech-lms-ui) is the
  Angular admin, teacher and student web UI that talks to the central API.
- [edtech-expo](https://github.com/edtech4good/edtech-expo) is the Expo
  learner app, in Khmer and English, for Android, iOS and the web from one
  codebase.

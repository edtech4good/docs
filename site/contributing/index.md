---
title: How to contribute
description: Contributing to edtech4good repositories
---

# How to contribute

Thank you for your interest in contributing. We welcome bug reports, code, translations, documentation fixes and accessibility testing.

## Where to start

edtech4good has four main repositories. Each has its own CONTRIBUTING.md, CODE_OF_CONDUCT.md and SECURITY.md.

- **edtech-lms-api** - Central NestJS API serving the admin UI and classroom devices
  - [CONTRIBUTING.md](https://github.com/edtech4good/edtech-lms-api/blob/main/CONTRIBUTING.md)
  - [CODE_OF_CONDUCT.md](https://github.com/edtech4good/edtech-lms-api/blob/main/CODE_OF_CONDUCT.md)
  - [SECURITY.md](https://github.com/edtech4good/edtech-lms-api/blob/main/SECURITY.md)

- **edtech-lms-rpi-api** - Classroom NestJS API for offline sync and learner data collection
  - [CONTRIBUTING.md](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/CONTRIBUTING.md)
  - [CODE_OF_CONDUCT.md](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/CODE_OF_CONDUCT.md)
  - [SECURITY.md](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/SECURITY.md)

- **edtech-lms-ui** - Angular admin UI and Playwright end-to-end test suites
  - [CONTRIBUTING.md](https://github.com/edtech4good/edtech-lms-ui/blob/main/CONTRIBUTING.md)
  - [CODE_OF_CONDUCT.md](https://github.com/edtech4good/edtech-lms-ui/blob/main/CODE_OF_CONDUCT.md)
  - [SECURITY.md](https://github.com/edtech4good/edtech-lms-ui/blob/main/SECURITY.md)

- **edtech-expo** - Expo React Native learner app for Android tablets
  - [CONTRIBUTING.md](https://github.com/edtech4good/edtech-expo/blob/main/CONTRIBUTING.md)
  - [CODE_OF_CONDUCT.md](https://github.com/edtech4good/edtech-expo/blob/main/CODE_OF_CONDUCT.md)
  - [SECURITY.md](https://github.com/edtech4good/edtech-expo/blob/main/SECURITY.md)

## Ways to help

- **Bug reports** - Describe what you saw, what you expected and the steps to reproduce. Test on a real Android device or against a local stack.
- **Khmer translation review** - The product is taught in Khmer. If you are fluent, please review test data and learner-facing text.
- **Accessibility testing** - Test on real Android devices with TalkBack enabled. Tablet and large-screen devices are priority.
- **Documentation fixes** - Improvements to this site (submit PRs to [edtech4good/docs](https://github.com/edtech4good/docs)).
- **Code** - See below for the workflow.

## Before you open a pull request

1. **Branch from main** with a descriptive name.

2. **Lint and format your code**: run the following in each repository before opening a PR:

   | Repository | Command |
   |---|---|
   | edtech-lms-api | `npm run lint && npm run format` |
   | edtech-lms-rpi-api | `npm run lint && npm run format` |
   | edtech-lms-ui | `npm run lint` |
   | edtech-expo | `yarn test:themes` |

3. **Run the relevant test suite**. Each repository has end-to-end tests covering both UI and API behavior. See [Testing and verification](/contributing/testing).

4. **Include Khmer text in test data.** The product is taught in Khmer. See [Khmer text](/reference/khmer-text).

5. **One PR per repository.** If your change spans multiple repositories, use the same branch name across all of them and state the merge order in each PR description.

6. **Read the git and PR workflow.** There are a few gotchas with squash merges and stacked PRs. See [Git and pull requests](/contributing/git-and-pull-requests).

## Reporting security issues

Use GitHub's private vulnerability reporting (Security tab on the repository). Do not open a public issue for a security problem. We aim to acknowledge reports within a week.

## Licence

Contributions are accepted under AGPL-3.0-only for code and CC BY 4.0 for documentation. By submitting a contribution you agree it is licensed under these terms.

For code: sign your commits with `git commit -s` (Developer Certificate of Origin, https://developercertificate.org/).

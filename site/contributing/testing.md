---
title: Testing and verification
description: Testing practices and verification techniques
---

# Testing and verification

This codebase fails silently. A blank screen, a "No Data" table that is really a 401, an empty option box, a form that will not submit and says nothing. Almost nothing announces itself, so verification has to be deliberate.

The edtech-lms-ui repository includes end-to-end tests in the `e2e/` directory that exercise the admin UI and Expo learner app. The `src/` directory has 64 scaffolding test files created by `ng generate`, which are decorative and do not assert behavior.

## Prove the test can fail

A green test you have not tried to break is not evidence. Mutate the thing it watches and confirm it goes red.

Three examples:

- **Lazy route specs passed for a module that did not exist.** The app has a catch-all route that renders in place without changing the URL. Tests asserting "not redirected to /auth" and "something rendered" were both satisfied by the fallback. All specs were decorative until a test broke it, returning "Expected to fail, but passed".

- **A substring match that never failed.** A test using substring matching still matched a search for old data after it was renamed.

- **An assertion pinned the wrong layer.** When a guard changed, only one test noticed. Assert the outcome (denied with 401 or 403), not which guard threw it.

`test.fail()` is the right tool for a known bug. The suite stays green while it exists and goes red when fixed, which is the prompt to remove the marker. Verify that mechanism too.

## The environment lies to you

- **A stale server means you are reading old code.** `npm start` or `nest start --watch` leaves a process holding the port. The replacement dies with `EADDRINUSE` and you keep querying the old build. Before believing any surprising result, check what is listening:
  ```bash
  lsof -nP -iTCP:3000 -sTCP:LISTEN
  ```

- **An untested pipeline hides failures.** The worst bugs are at seams between systems. When a flow spans repositories, run it end to end before calling it done. Read the actual error from log files, not just the HTTP response. A 200 response and an empty table may hide a cascade of failures.

- **Old databases drift from models.** Database migration tooling may not alter existing columns, so aged databases miss columns added after first creation. Fresh-boot databases hide the problem. If you add a model column, test against an old database and verify the column exists.

- **Curl-ing `/auth/login` logs the browser out.** The API stores one token per user. A fresh API login invalidates the browser session. A UI that goes blank right after an API check is almost always this, not a bug.

- **Raw `COUNT(*)` includes tombstones.** Most deletes are soft (marked with `deleted_at` or `isdeleted`). Rows appearing to accumulate after test cleanup is usually the app's model, not a leak. Filter on `deleted_at IS NULL` to see what the app sees.

- **Terminal encoding can lie about Khmer text.** The `mysql` CLI prints `????` for Khmer depending on terminal charset. That is the client, not the data. Check `HEX(column)` before concluding anything about encoding.

## Count from compiled code or the database

A regex over source code can undercount enums and put wrong numbers into reports and commit messages. Get the count from the compiled artifact or from `INFORMATION_SCHEMA` if a number will be stated to a human.

## Khmer, not ASCII

ASCII test data cannot fail an ASCII-only check. That is precisely how a validator rejecting every Khmer character shipped in a Khmer literacy platform. Every test student was called by an ASCII name.

Use Khmer wherever a human name, a title or free text is under test. The suite has [e2e/localization/khmer.spec.ts](https://github.com/edtech4good/edtech-lms-ui/blob/main/e2e/localization/khmer.spec.ts) and a Khmer subject in the [CRUD round-trip](https://github.com/edtech4good/edtech-lms-ui/blob/main/e2e/smoke/crud.spec.ts). Assert the text comes back byte-exact, not merely that the request returned 200.

Tag names are alphanumeric max 8 by design, short codes not prose. A Khmer test there would assert a rule the product does not have.

## Clean up, and verify the cleanup worked

The end-to-end suite writes real rows. A failing test never reaches its own cleanup step. Order matters: delete children before parents or foreign key constraints abort the whole batch.

Know which deletes are real:
- `DELETE /user/:id` disables the user.
- `DELETE /student/:schooluserid` does nothing at all and returns success. Read the actual endpoint implementation before assuming cleanup worked.

If you cannot clean up, say so in the test and document the SQL. Do not write cleanup code that cannot work.

## Verify against the real thing

Typechecking passing says nothing about whether a form submits, a chart renders, or a guard denies. Drive the actual flow:

- **API changes** - Run the endpoint against the database and check the row that lands. Use `HEX()` for text, not just a 200.
- **UI changes** - Render it. Run the end-to-end suite or open it in a browser. Read the console.
- **Charts and layout** - Look at them. A legend title may report "not truncated" via `scrollWidth` while overflowing the parent by 9px and losing a character. Compare edges.
- **Cross-repo changes** - Exercise the seam, not each side. A client validator can block a request the server would accept, and both look correct in isolation.

## Reporting

State what was observed and name what was not checked. "Typechecks" is not "works". "Merged" is not "on main". A 200 response is not "the right bytes came back". If a number came from a shortcut, a test was skipped, or a result surprised you and you moved on, say so. A report is only worth anything if it does not have to be redone.

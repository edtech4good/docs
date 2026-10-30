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

## Dependency changes

**Prove a dependency change from a copy outside the repository.** A git worktree under the repo resolves `node_modules` by walking up to the root checkout. A removal of two unused packages from the student API passed `tsc`, Jest and a boot in such a worktree, and an `import axios` added on purpose still compiled, because Node found the package in the root checkout. The proof was hollow. Re-run it from a `git archive` copy of the commit placed in an empty directory outside the repository: `npm ci`, `tsc`, Jest, build and boot. There the added import failed with TS2307. The converse bites too: a worktree has no `node_modules` of its own, so Jest there can fail with "Cannot find name 'expect'".

**Install dependencies in the copy; do not link them.** A reviewer ran copies of the central API with the root checkout's `node_modules` linked in, to save an install. The root held `axios` 0.24 while the code under test was on 1.20, and what was being tested (how an upstream 401 maps through the exception filter) depends on that library's version. Whenever the answer can depend on which versions are installed, run `npm ci` in the copy.

**Verify a dependency-update pull request merged onto current `main`, not on its own base.** An `@types/node` bump from 22 to 25 looked harmless on its own base, which predated four merged pull requests. Merged onto `main` it turned the Playwright typecheck from 3 errors into 7: version 22 had shipped a shim typing `Array.prototype.at`, version 25 dropped it, and four `.at(-1)` calls in a newer spec stopped compiling. Merge the pull request into a checkout of current `main`, run the build, the typecheck and the tests there, and compare with `main` as it stands.

**A secure-context API is not a drop-in for a polyfilled package when the app may be served over plain HTTP.** A change replaced `uuid` in the admin with `crypto.randomUUID()`, because the package's `v4()` already calls it, and the build and typecheck were clean. `crypto.randomUUID` is only defined in secure contexts (HTTPS or `localhost`). Served from a plain-HTTP address, the question form threw while adding an option. The package falls back to `getRandomValues` there, so the plain bump was safe and the removal was not. Before replacing a library with a platform API, check where the app is served from and run the flow on a plain-HTTP address as well as on `localhost`.

## Never export a `.env` before a migrate

**Run migrations from a clean shell and print the database name first.** The migration tooling reads `DB_NAME` from the process environment *before* it reads the project's own `.env`. A migration tested from a `git archive` copy on a scratch database ran against the developer's local database instead, because the shell had the root checkout's `.env` exported. Never `set -a; . .env`, or export the real file any other way, in a shell that runs `sequelize-cli`. Set the scratch variables on the command line, and print `DB_NAME` before every migrate.

## Concurrency needs a live parallel run

**A green suite after a fix says nothing about concurrency, and a fix can itself be the defect.** Two examples from one publishing change:

- A review said a publish read its content before it took the row lock, so a concurrent publish could be recorded on stale data. The fix moved the reads inside the transaction. Six publishes in parallel then waited behind the lock the transaction held, exhausted Sequelize's default pool of five connections, and four of the six failed with a lock-wait timeout. The final fix kept the reads before the transaction and added a guard after the lock.
- The next fix checked the row's owner with a read before an upsert. In MySQL's default `REPEATABLE READ` isolation, the first plain `SELECT` in a transaction fixes the snapshot every later plain read sees. When a concurrent identical save won, the read-back saw nothing and answered 500 in most rounds (it never had before the "fix"). The shape that held under repeated parallel runs: no pre-read, write with `ON DUPLICATE KEY UPDATE`, read back with `SELECT ... FOR UPDATE` (which reads the latest committed row), and refuse and roll back if the stored row belongs to someone else.

So: re-run the parallel and the identical-request cases after every fix that touches transactions, locks or pools; make a mutation that fails on the old shape; and remember that an in-memory fake database cannot express lock order or isolation. Prove these with a live parallel run, and say so when a spec cannot.

## Evidence

**A screenshot's label is a claim, not proof.** A report cited a screenshot named as the final state of a run to show that a web player had loaded a two-and-a-half-minute video. The image was the practice screen with an "incorrect" banner: the file name described what was meant to be shown. Open every screenshot that carries a claim, ask for a script assertion beside any image (the element's duration, `readyState` and dimensions, not only a picture), and name evidence by what it shows.

**To prove "does nothing while off", attach the listener before navigation.** A page declared that a switch, while off, fetches nothing. A mutation that made it fetch while off left the whole live suite green, because nothing in the suite could see a request. A test that nothing was requested is worth something only if the request listener is attached before the page navigates, if it asserts a count of zero rather than the absence of a failure, and if a mutation that makes the request turns it red. Even then a short settle time is a residual gap: say what it is. The same holds for an API: "this route does nothing when the setting is off" is proved by a counter on the thing it would call, not by the absence of an error.

**A serial Playwright file with a stale test hides what it did not run.** A run was reported as "115 pass, 1 fail". One file was a serial `describe`: after its first test failed, every later test in it was skipped, 12 did not run, including the five that exercised the change under review. The failing test was stale and failed identically on `main`. Take a known-stale test out of the run (for example with `--grep-invert`) instead of running past it, so the others execute, and quote passed, failed and did-not-run from the summary line.

**A guard that covers one of several sibling acts is not a guard.** A change made publish, retire and delete each push to a second server after they commit. The first build pinned "no database query runs outside the transaction while it is open" with a helper, but only for publish. A review mutated retire and delete to read from the pool inside their transactions and both mutations stayed green. When you add a guard for one act, grep for its siblings (the other verbs on the same table, the other routes that call the same helper) and either cover them or say in the pull request that they are uncovered.

## Twin changes across the two APIs

**A twin is the same intent, not the same diff.** A ticket to drop a deprecated types package from the student API was written as the twin of the same change in the central API, "the drop alone". It was false there: the student API had a real types package, the library it types shipped none at that version, and dropping the package turned the compiler red in three files. The central API had a newer library version that ships its own types. The real fix was to bump the library and drop the package in one change. The premise was found by trying the drop in a throwaway `git archive` copy with its own `npm ci`. Read the other side's `package.json` and lockfile before copying a fix.

## Scratch databases, ports and disk

**Use a separate scratch database and port for each concurrent test run.**

**Proof copies fill the disk.** Strip `node_modules` and build output from proof copies; check `df -h /`.

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

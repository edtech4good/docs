---
title: Khmer text through the stack
description: Storage, validation, display and testing of Khmer text across the learner platform.
---

# Khmer text through the stack

What works, what broke, and what is still untested for a platform whose learners read Khmer.

## Storage and transport are fine

This was checked, not assumed. A learner named `សុខា ចាន់` in `ភ្នំពេញ`:

- MySQL stores `E19E9F E19EBB E19E81`, byte-exact UTF-8: 4 characters in 12 bytes, `utf8mb4` throughout.
- The CSV export returns `សុខា` with every codepoint in the Khmer block (U+1780–U+17FF).
- The create → store → export round-trip is lossless.

If Khmer looks wrong somewhere, suspect a **validator or a display layer**, not the database. (`mysql` on the command line prints `????` for Khmer depending on the terminal's charset. That is the client, not the data. Check with `HEX(column)` before believing it.)

## The bug: `studentfirstname` rejected Khmer on enrolment

`POST /student/create` validated `studentfirstname` with `joi.alphanum()`, which is `/^[a-zA-Z0-9]+$/`. Every Khmer character failed:

```
400  "studentfirstname" must only contain alpha-numeric characters
```

Three things made it clearly an accident rather than a rule:

- It was the **only** name field with the restriction. `studentlastname`, `familyname`, `mothername`, `fathername`, `city`, `country` and `state` all accepted Khmer already.
- The **edit** path's `studentfirstname` had no such restriction.
- So the workflow it enforced was: enrol a child as `Sokha`, then rename them to `សុខា` through the CSV round-trip. This sequence worked and returned 200.

Fixed by dropping `.alphanum()` so create matches edit, in the API validator and in the Angular client's mirror of it (`validator.service.ts`. joi rejects unknown keys and unmatched rules client-side, so a roster of Khmer names failed in the browser before it ever reached the API).

`min(2)` and `max(100)` still apply: a one-character name is still rejected.

### `alphanum` that stays

Not every `alphanum()` is a bug:

| Field | Why it stays |
|---|---|
| `schoolusername`, `schooluserpasswordhash` | Login credentials, max 16. A handle, not a name |
| `documenttagname`, `questiontagname` | Short codes, alphanum max 8 by design |

## Why nothing caught it

The smoke suite was written entirely in ASCII (`Sokha`, `e2e subjA …`), and **ASCII test data cannot fail an ASCII-only check**. The disability work landed at the same time with the same blind spot: every student in it was named `Sokha` or `Dara`. Coverage was extended:

- [khmer.spec.ts](https://github.com/edtech4good/edtech-lms-ui/blob/main/e2e/localization/khmer.spec.ts): enrol a learner under a Khmer name, assert the CSV export returns it byte-exact, and assert `min(2)` still bites. Reinstating `.alphanum()` turns the first one red; verified by doing exactly that.
- A **Khmer subject** in the CRUD round-trip ([crud.spec.ts](https://github.com/edtech4good/edtech-lms-ui/blob/main/e2e/smoke/crud.spec.ts)) drives Khmer through a real Angular reactive form → API → MySQL → back into the table, which is what would catch a charset regression on the upgrade ladder.

## The Khmer spec leaves a learner behind, and cannot help it

`e2e/localization/khmer.spec.ts` enrols one learner per run and does not clean up, because **there is no working way to delete a student**: `DELETE /student/:schooluserid` opens a transaction, has both of its business calls commented out, commits, and returns `{ error: false, data: true }`. Verified against a live database: HTTP 200, row count unchanged.

So the residue is the app's. The learners are named `khm*` and land in the disability report's "not collected" bucket. Clear them with:

```sql
DELETE s FROM students s JOIN schoolusers su ON su.schooluserid = s.schooluserid
  WHERE su.schoolusername LIKE 'khm%';
DELETE FROM schoolusers WHERE schoolusername LIKE 'khm%';
```

A cleanup routine calling the endpoint would read as if it swept up and would sweep nothing, which is why the spec has none. When delete works, it should clean up after itself the way `crud.spec.ts` does.

## Still untested

- **The Expo learner app.** Nothing in this suite touches it. Two things are known about it, one closed and one open:
  - **Closed.** Lesson activities once rendered nothing at all in Khmer. The section list carried translated titles and the renderer compared them against the English literal `'Learning'`, so in Khmer the comparison never held and learnings, practices and quizzes all silently drew nothing. Fixed with a stable `type` key. The pattern is gone. No comparisons against English literals remain, and every `t()` is an output rather than a condition.
  - **Open.** `LoginScreen.tsx:175` hardcodes `fontFamily="PoppinsSemiBold"` on a button labelled `ភាសាខ្មែរ`, and Poppins has no Khmer glyphs. Confirmed by rendering: `ចូលគណនី` resolves to `NotoSansKhmerSemiBold` on the same screen, `ភាសាខ្មែរ` to `PoppinsSemiBold`. Web hides it via per-glyph fallback; native platforms will not necessarily. This needs a device to verify.

  Both are the same lesson: the learner app's Khmer behaviour diverges from its English behaviour in ways no English-language test run can see.

- **Khmer in the admin UI's own chrome**: the app ships an i18n bundle. Only content is exercised here, not the interface language.
- **Sorting and search.** Khmer collation in `ORDER BY` and `LIKE` filters is unexamined. Khmer does not sort meaningfully under `utf8mb4_unicode_ci`, so learner lists ordered by name may be in an order no Khmer reader would call alphabetical.
- **Character counting.** `min`/`max` count UTF-16 code units, not what a reader would call a letter. `ខ្មែរ` is one written cluster and 5 codepoints, so a field capped at 8 holds fewer Khmer "letters" than the number suggests.

---
title: Authorization model
description: "How access control works in the central LMS API: role-based permissions, the gap that was fixed, and what is still outstanding."
---

# Authorization model

How access control actually works in the central LMS API, what is load-bearing and what only looks it, and the open gap.

For which endpoint each client talks to, see the [architecture documentation](/architecture/).

## Two kinds of account, and only one has an email

This split matters for anything touching signup, verification or recovery, so it comes first.

| | `lmsusers` | `schoolusers` |
|---|---|---|
| Who | Staff: admins, programme users | Learners, and teachers inside the app |
| Login | `POST /auth/login` | `POST /auth/school/login` (staff only: teacher and above; a student account is refused) |
| Identity | An email, the validator enforces `.email()` | `schoolusername`, a ≤16-char alphanumeric handle |
| Email on record | `lmsusername` **is** the email | **No email column exists on the table** |
| Authorization | RBAC roles + permissions (below) | `schooluserrole` (student / teacher); a token carrying a non-staff role is refused on every request |

**Learners have no email, by design and by schema.** In the deployment contexts this platform is built for, a learner has a mobile phone; an email address is not a safe assumption. Staff and admins do have email. Any design that assumes otherwise (verification links, password-reset emails, "confirm your address") works for staff and is simply unavailable for learners.

## Two systems, one of which is real

**RBAC permissions.** A user is assigned roles (`lmsusers_roles` → `roles` → `roles_permissions`). Their permissions are baked into the JWT at login and checked by `CheckPermissionsGuard` against `@RequirePermissions(...)` on an endpoint. This protects most of the API.

**RBAC roles.** The same assignment, carried in the JWT as `lmsuserroles`, a list of roleids. `AccessGuard` compares these against the roles an endpoint lists. `Role` enum values *are* roleids, so they compare directly.

**`lmsusers.lmsuserrole`, legacy, and authorizes nothing.** It is stamped `Role.superadmin` for **every** account, unconditionally, in two places: `UserBusiness.createUser` and `UserController.create`. It stays in the token because clients read it, but nothing authorizes on it. It wants dropping in its own migration. **Do not reintroduce a check on it**, that was the bug below.

## The gap (fixed)

`AccessGuard` used to authorize off `lmsuserrole`:

```ts
if (!role.find((x) => x == user.lmsuserrole)) {   // every account: superadmin
```

Since every account carries `lmsuserrole = superadmin`, that check passed for anyone who could log in. It read like enforcement and was a no-op. Harmless where an endpoint also declared `@RequirePermissions(...)`; not harmless on the 15 guarded by roles alone, which were open to any account.

It was verified, not theorised. An account created with RBAC role **User** and `permissions: []` called `POST /student/create` successfully. Zero permissions, full student creation.

It now checks `lmsuserroles`, so the same account gets 403. Verified across `/student/create`, `/teacher/create` and `/curriculum/all`.

### What the role lists actually mean

Worth knowing before changing a guard, the role list does two unrelated jobs:

| Shape | Count | Effect |
|---|---|---|
| `[apikey, superadmin, admin]` | 12 | apikey **or** an admin/superadmin user |
| `[admin, superadmin]` | 2 (sync) | admin/superadmin user only; no API key |
| `[apikey]` | 1 (sync) | **API key only**, no user holds the apikey role |

`Role.apikey` in the list does *not* check a user's role. It enables a separate branch that accepts the static `APPLICATION_API_KEY` as a bearer token when there is no valid JWT. So `[apikey]` alone means "only the application key", and deleting the role check (the obvious "it's vestigial" cleanup) would have opened that sync endpoint to every logged-in user.

The API-key branch returns `{ user: "API KEY" }` with **no permissions**, so adding `@RequirePermissions` to any endpoint that allows the API key would break server-to-server calls (`CheckPermissionsGuard` reads `user.permissions ?? []`). That is the trap waiting for anyone who tightens these endpoints further.

## What each role holds (granted)

| Role | Permissions | Shape |
|---|---|---|
| Super Admin | 190 | Every row; earns the `superadmin` wildcard |
| Admin | 159 | Everything except user and role administration |
| Teacher | 60 | Read-only (`view_*`, `download_*`), minus learner identity |
| User / API Key | **0** | Unchanged, no consumer |

The seed used to grant everything to Super Admin and nothing to anything else, which was survivable only while `lmsuserrole` lied: an Admin-role account reached every roles-guarded endpoint regardless of its zero permissions. Once the guard started reading real roles, Admin was correctly refused, and, holding nothing, could do nothing at all. A migration grants the two roles real permissions.

### Admin excludes user/role administration because those ARE Super Admin

Not a judgement about seniority. The eight excluded permissions are escalation:

- **`POST /roles/user-bind-role` requires only `update_user`** and binds any role to any user. A holder grants themselves Super Admin.
- **`POST /user/create` requires only `create_user`** and passes `lmsuserroles` from the request body straight into `setRoles`. A holder mints a Super Admin and logs in as it.

So a role holding `create_user` or `update_user` **is** Super Admin, whatever it is called. `view_*`/`delete_*` on user and role are excluded alongside them to keep staff administration whole rather than half-delegated. Verified: an Admin-role token gets 403 from both endpoints.

### Grants come from the enum, not the permissions table

The table holds 190 rows; the enum defines 167. The extra 23 are `list_*` rows from the seed's grid that no `Permission` member, no endpoint and no UI template ever names, dead three ways over. Granting them would be noise, and it would move the counts the wildcard test depends on.

### The `superadmin` wildcard was awarded by raw count (fixed)

`convertRolesPermsToArrayOfString` awards the synthetic `superadmin` wildcard, a **full server-side bypass** in `CheckPermissionsGuard`, to any bearer whose permission count equals `COUNT(*)` of permissions. It pushed one entry per grant per role **without deduplicating**, then compared a raw array length. So:

- Two roles whose grant counts **sum** to 190 earned the wildcard even when their permissions overlapped entirely and the bearer held far fewer distinct ones.
- Conversely, granting Admin and Teacher real permissions would have **stripped the wildcard from every multi-role Super Admin**: 190 + 159 + 60 = 409 ≠ 190. The seeded `superadmin@superadmin.com` holds all five roles and would have been silently de-privileged, masked only by the `SUPERADMIN_USERNAME` backdoor, which skips this branch entirely.

Both directions were demonstrated against a running API before the fix. The count is now taken over a `Set`, so it measures what is held rather than how many times it was mentioned. **Do not restore the raw-length compare**, and do not treat "no role pair sums to 190" as a safety property, it was luck, not design.

## Teacher is read-only, and reaches its reports (six guards widened)

Granting Teacher permissions was not enough on its own, because **`Role.teacher` appeared nowhere in the source**. Every role list named `[admin, apikey, superadmin]`, so a Teacher was refused by `AccessGuard` before its permissions were ever consulted, including on the feeds behind every report filter.

`Role.teacher` is now in the role list of six read-only GETs:

| Endpoint | Feeds |
|---|---|
| `GET /curriculum/all` | curriculum filter, injected by all 7 report components |
| `GET /standard/all` | standard filter |
| `GET /country/` | country filter |
| `GET /school/` | school filter |
| `GET /grade/curriculum/:curriculumid` | grade filter |
| `GET /curriculum/country/:countryid` | curriculum-by-country |

Widening a role list is the safe half of this. Adding `@RequirePermissions` to any of them would have broken the API-key branch, which returns `{ user: "API KEY" }` with no permissions, see the trap above. Adding a role does not touch that branch.

### Why nobody noticed it was broken

The report components pipe every filter feed through `catchError(() => of({ results: [] }))`. A 401 became an empty option list, so a Teacher would have seen a report screen with empty dropdowns and **no error at all**, the menu right, the data missing, nothing thrown. The same shape as every other bug in this file.

### Teacher does not see learner identities, and does not hold the permissions

Two separate mechanisms, and both are wanted.

**The guard.** The whole `StudentController` is behind a class-level role guard (below), so no Teacher request reaches any student endpoint.

**The grant.** Teacher is not given `view_student` or `view_download_student` either, 60, not 62. Belt and braces on purpose: the guard is what enforces it, but holding the permissions produced a Students menu entry leading to an empty screen, and gave Teacher the "download students" button, which is exactly the CSV the decision is about.

Why the line sits at identity rather than at "student data", measured, because the distinction is not obvious:

| Teacher calls | Result | Returns |
|---|---|---|
| `POST /report/studentstatus` | 200 | learner **username** (`demo.sophea`), school, class, progress |
| `GET /report/disability` | 200 | **aggregated counts only** (`not collected: 5`), no per-learner rows |
| `GET /student/all` | **403** | `studentfirstname`/`studentlastname`, `mothername`, `fathername`, `dateofbirth`, `contact`, and all six `wg_*` disability answers |

So Teacher can already see *who is falling behind* by username; it cannot see a child's name, parents, date of birth or disability status. That is the line, and it is a real one, the reports were never the exposure.

The exclusion is anchored (`^(view_student|view_download_student)$`). An unanchored prefix silently strips `view_student_level_quiz` and `view_download_student_quiz_score`, dropping Teacher to 58 and blanking two reports, proven by mutation, and asserted in [e2e tests](https://github.com/edtech4good/edtech-lms-ui/tree/main/e2e/authorization).

**The accepted cost:** every report screen fills its student filter from `GET /student/all` (via `studentService.getAllUsers`), all seven of them, not just the per-student ones. So the student filter never populates for a Teacher. The reports still render; the filter just cannot narrow to one learner.

Widening that class guard is not a one-line equivalent of the six above, because two of its routes had their **method-level guards commented out** and relied on the class guard alone. Measured, not assumed, with `Role.teacher` added to the class guard, a Teacher token got:

| Route | Result | |
|---|---|---|
| `GET /student/all` | 200 | what is actually wanted |
| `GET /student/download-students` | **200** | a bulk PII CSV of learners |
| `POST /student/migrate-standardid/:key` | **400** | reached the handler, a data migration |
| `POST /student/create` | 403 | method-level guards **do** compose and still refuse |

So it is doable, widen the class guard, and give `download-students` the explicit admin-only method guard it currently borrows from the class guard, but it opens learner PII to a role, which is a decision rather than a cleanup. Parked for future consideration.

(`migrate-standardid` no longer relies on the class guard; it was given its own `Role.superadmin` method guard when the public-key gate was removed. So `download-students` is now the only student route leaning on the class guard alone.)

## `StudentController` has a class-level guard

`student.controller.ts` carries `@UseGuards(AccessGuard(TokenType.ACCESS, Role.apikey, Role.superadmin, Role.admin))` **on the class**, so it applies to every route in it. NestJS composes controller- and method-level guards; it does not replace one with the other.

This is worth knowing because it is invisible when reading a single handler, and it inverts what the method-level decorators appear to say:

- Several student handlers have their method-level `@UseGuards` **commented out**, including `GET /student/download-students`. Read alone, they look public. They are not: **an unauthenticated `GET /student/download-students` returns 401**, verified with no token. The class-level guard is what stops it.
- Handlers with `@RequirePermissions(Permission.VIEW_STUDENT)` still require the admin role first, so the permission is not the operative check.

`report.controller.ts` and `common.controller.ts` also have class-level `@UseGuards` lines, but **both are commented out**, there the method-level decorators are the whole story. Do not pattern-match from one controller to another; check the class.

### Endpoint gating, counted with class-level guards included

| Shape | Count |
|---|---|
| Permission-gated, no role list | 210 |
| Role-gated (incl. inherited from `StudentController`) | 25 |
| Any logged-in user (guard, no roles, no permissions) | 32 |
| **Truly unguarded** | **11** |

All eleven remaining unguarded endpoints are legitimately public, and are listed here in full so the next person can diff against them rather than re-derive:
`GET /`, `GET /version`, `GET /assets/user-upload.csv`,
`GET /assets/teacher-upload.csv`, `POST /auth/login`, `POST /auth/school/login`,
`POST /auth/logout`, `PUT /auth/sendverificationemail`,
`POST /auth/forgotpassword`, `POST /auth/token/validate/changepassword`, and
`GET /common/templatetype`.

### The twelfth was a CSV of children's names (guarded)

`GET /curriculumbaseline/:curriculumbaselineid/download` had both its guard lines commented out. It streams `studentfirstname`, `schoolusername`, `schoolname` and each learner's assessment result. An anonymous `GET` returned **200** and a row reading `សុខា,khmz3y6dh,Demo Primary School,…`, demonstrated against a running stack, not inferred.

**It is the clearest example in this codebase of an accident mistaken for a control.** The handler proxies to the student API, whose `AccessGuard` accepts a matching `SERVER_SYNC_KEY` as a bearer. The two apps fall back to *different* defaults, so locally the proxy 401s, the handler throws, and the endpoint 500s. It looks broken and therefore harmless. Setting that key correctly is a **required go-live step**, so the act of configuring the system properly is what arms the leak. Exactly the shape of `POST /auth/register`, which was safe only because it always 500'd.

Now gated on `view_download_student` rather than a commented-out line. Anonymous 401, Teacher 403, Admin 200. Teacher holds `view_baseline-endline` but not `view_download_student`; the payload is learner identity data Teacher is deliberately denied. Verified live and locked in by [e2e authorization tests](https://github.com/edtech4good/edtech-lms-ui/tree/main/e2e/authorization).

Two things worth carrying forward from it:

- **`@RequirePermissions(A, B)` is OR, not AND.** `CheckPermissionsGuard` uses `.some()`. Listing more permissions widens access; it cannot narrow it. To restrict, name the single permission the excluded role lacks.
- **A commented-out guard is not documentation of intent you can trust.** The line here named the permission that would have handed Teacher the very data the project had just decided it must not see.

### 55 permissions the seed could never create (fixed)

Super Admin's 135 did not cover the code either. The seed generates permissions from a `{list,create,update,view,delete}` grid over `PERMISSIONS_KEY_WORD`, 27 entities × 5 = 135, while the `Permission` enum defines **167**. The 55 that do not fit the grid were never created in any environment, so nothing ever called them. No role could be granted them, because they did not exist. These methods and endpoints were removed, so these rows now come solely from the migrations.

They gate real code, and the failure was invisible from the API side:

- `view_plus_reach` did not exist, so `login.component.ts`'s `getPermission('view_plus_reach')` could never be truthy and **every** user landed on the blank `dashboard/default` page rather than the Reach dashboard.
- The Reach and Reach-School sidebar entries are gated on `view_plus_reach` / `view_reach_school` via `*ngxPermissionsOnly`, so both dashboards were unreachable from the menu.
- Impact, Map, Tech Downtime, Fees Collection and every report download permission were in the same position.

Superadmin still reached the report *APIs*, because `CheckPermissionsGuard` honours the synthetic `superadmin` wildcard, **which the client knows nothing about**. ngx-permissions matches literal names. So the API worked while the UI hid the menu, and anyone testing by URL saw a working dashboard. That divergence between server wildcard and client literal-matching is the thing to remember; it is the same shape as the `lmsuserrole` bug above, and it will hide the next one too.

Fixed by creating the 55 and granting them to Super Admin (190 rows; it still holds all of them, so it still earns the wildcard). The report permissions had no `permissionstitle` to live under (there was no Report title), which is a good sign they were never intended to be managed by hand.

**`superadmin` must never become a permission row.** It is not a `Permission` enum member. `convertRolesPermsToArrayOfString` derives it by comparing a role's grant count against `COUNT(*)` of permissions, so inserting it would raise the total it is measured against and no role could ever earn it again.

Note also `SUPERADMIN_USERNAME = "superadmin@superadmin.com"` in `permissions.enum.ts`: an account with that exact address is granted every permission by username, bypassing RBAC entirely. Gated to local/dev/test. In production the shortcut is off; the seeded superadmin instead earns full access through RBAC, because a migration binds that account to the Super Admin role, and migrations together grant that role all 190 permissions, both run in *every* environment. So it reaches 190 distinct and earns the wildcard by count. The shortcut was therefore redundant in a seeded production DB and a liability: any production account renamed to this address would otherwise have been handed everything with no role.

## Why `POST /auth/register` was removed rather than gated

It was public and unauthenticated, no `@UseGuards` at all, and its joi validator explicitly accepted `Role.superadmin` from the request body.

It had never worked. `register` called `createUser(temp)` with no roles argument, so `roles.findAll({ where: { roleid: undefined } })` threw, the transaction rolled back, and no row was created; every call 500'd. Confirmed: an unauthenticated request asking for superadmin returned 500 and wrote nothing.

That accident was the only thing protecting it, and it was one line deep. The obvious fix (pass a roles array, or guard the `undefined`) would have turned a public endpoint into a superadmin faucet, because `createUser` stamps superadmin regardless of what is requested. A gate would have left that trap in place for whoever wired self-registration later. No client ever called it, so removing it broke nothing.

## Learner self-registration

**There is no plan for it.** It is wanted, learners filling in their own disability information on their own profile is the motivating case, but nothing is designed.

When it is designed, it must not be built on the path above. Prerequisites:

1. **Fix `lmsuserrole` first.** Self-registration on today's `createUser` means self-service superadmin. This is not negotiable ordering.
2. **A learner signup creates a `schooluser`, not an `lmsuser`.** The removed `/auth/register` created `lmsusers`, staff accounts, keyed by email, with RBAC permissions attached. Pointing a learner signup at it would be the wrong table before it was anything else: it would demand an email a learner does not have, and hang programme permissions off a child's account.
3. **Verification cannot be an email link.** `schoolusers` have no email address, so the usual anti-abuse mechanism is simply unavailable. The plausible options are a phone/SMS code, a teacher- or school-issued enrolment code, or staff approval of a pending signup, each with real cost and none of them free. This is a design decision for the customer, not an implementation detail to be settled late.
4. **Decide what a self-registered account may do** before it can be created, a self-assigned role is the whole vulnerability restated.

Note that the motivating case does not actually need signup. Letting a learner fill in their own disability information needs an authenticated learner to edit their own profile, learners already have accounts and already log in. Self-service *profile editing* is a much smaller and safer piece of work than self-service *account creation*, and it delivers the thing that was wanted. Worth separating the two before either is scheduled.

## How it was fixed, and what is left

The token now carries the roles the bearer actually holds, and `AccessGuard` checks those. No migration and no denormalized column: `generateAuthToken` already had `user.roles` in hand for building permissions.

It needed one unrelated fix first. `getuserbyid`, the loader the **refresh** path uses, loaded no roles at all, so `generateAuthToken` called `roles.forEach` on `undefined`, threw, and `refreshAuth` swallowed it into "Please authenticate". Every non-superadmin was therefore silently logged out the first time their token refreshed; superadmin never noticed because the `isSuperAdmin` username check skips that branch. Both loaders now include roles, which fixes the logout as a side effect. Without it, moving auth onto token roles would have turned an hourly logout into a total lockout.

Still outstanding:

- **The 25 endpoints guarded by roles with no `@RequirePermissions`.** They are no longer open to any account, but "admin or superadmin" is coarse, and it is what makes the Teacher role half-usable (above). Tightening them means giving the API-key branch permissions first, see the trap above. Widening them to Teacher does not hit that trap, because adding a role to a list does not touch the API-key branch.
- **Drop the `lmsuserrole` column**, once clients stop reading it from the JWT.
- **The `ADD_PERMISSIONS_KEY` / `CheckKey` public-key pattern, removed.** After the `create-perm` endpoints went, four data-migration endpoints on `standard.controller.ts` and `student.controller.ts` still used the same `:key`. All four now require the Super Admin role; the `:key` param, the `CheckKey` validator and the constant are gone. The endpoints were kept, they are ops migrations worth running by a real Super Admin, unlike `create-perm`, which was fully replaced by the seed migrations.
- **The `create-perm/:key` permission-bootstrap backdoor, removed.** These endpoints created permission rows guarded only by `AccessGuard` with no role plus the public key. No client called them; removed rather than gated. The now-dead business methods and DTOs went with them.
- **The `SUPERADMIN_USERNAME` backdoor, gated to local/dev/test.** In production the username shortcut is off and the seeded superadmin authorizes purely through RBAC. Two things follow that were already true and still are: locally it still skips the wildcard-count branch, so test that branch with a real Super Admin account, never with `superadmin@superadmin.com`; and the whole gate is invisible to the lms-ui e2e suite, which runs the API in dev mode where the shortcut stays on.
- **`sync_student` vs `sync_students`.** A UI button gates on `sync_student`; the enum defines `sync_students`. The name has no row and never matches, so that button is superadmin-only forever. The API never checks either name. One-character fix, but confirm what the button should do before wiring it.
- **Dead role-id checks in the UI.** Templates gate on role ids inside `*ngxPermissionsOnly`, but the line that loaded role ids into ngx-permissions is commented out, so only permission names load and those entries match nothing. They are leftovers from when `lmsuserrole` was the auth mechanism, which is exactly why they made those buttons visible to everyone. Harmless now; worth deleting so they stop reading like access control. No control is gated on them alone.

The safety net is [e2e tests](https://github.com/edtech4good/edtech-lms-ui/tree/main/e2e/authorization), which is why this change could be made at all, it was written before the fix with the escalation marked, so the suite reported the moment the behaviour changed.

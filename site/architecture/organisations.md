---
title: Organisations
description: How several organisations share one central deployment and one student deployment, who owns content, and how the platform view differs from acting as an organisation.
---

# Organisations

One deployment serves several organisations. A school network, a company
training team and a second school network can all use the same central
database, the same student database and the same two APIs, and none of them can
see another's schools, learners or content. This page describes how that is
built. For how roles and permissions work inside one organisation, see the
[authorization model](/architecture/authorization).

Nothing is read from configuration to decide which organisation a request is
for. A classroom Pi runs exactly the same code as the cloud servers; it simply
holds the data of one school.

## What an organisation is

An organisation is a row in the `organisations` table, on both the central and
the student side. It carries:

- a name, a short code (lowercase letters and digits, fixed once learners
  exist) and a short name used for the tile in the admin;
- a status: a suspended or deleted organisation's staff are refused, and the
  check runs on every request, so access ends at once;
- the look it starts with (`uitheme`, kids or corporate), branding, and a
  settings blob for the words it uses and the learner-app features it turns on;
- its content language, which is covered in
  [two languages in content](/architecture/translations);
- the countries it works in.

The kind of customer is never structure. An organisation started from a
"company" or a "school network" preset behaves the same way in the APIs; the
difference is settings (words, theme, features), resolved from the organisation
down to the school. The learner app reads those settings. Nothing on the server
branches on the preset.

## Who owns what

Every row that belongs to an organisation resolves to exactly one, either
through its own `organisationid` column or through a parent that has one.

| Owns an `organisationid` column | Inherits through a parent |
|---|---|
| Schools, curricula, questions, documents, subjects, document and question tags, staff accounts, content translations and curriculum publications | Grades, levels, lessons and everything under a lesson, through their curriculum; learners and teachers, through their school |

Staff accounts are the one nullable case. A staff account with no organisation
belongs to the platform, and only a Super Admin can be a platform account.
`countries`, `roles` and `permissions` are global.

The student database mirrors this. It has the same `organisations` table, the
same owner columns on schools, curricula, questions, documents and subjects, and
a `schoolid` on every learner and teacher. Learners and logins are tied to a
school by its id, not its name.

The organisation always comes from a trusted source: the staff or student
token, the header of an authenticated server-to-server call, or a scope object
that central builds itself. It never comes from a query filter or a request
body, and a row with no owner, a token with no organisation claim or a server
call with no scope is refused rather than served unfiltered.

## The platform view and acting as an organisation

A staff token carries two claims: `organisationid` and `isplatform`.

- **An organisation's staff** have their organisation's id and are filtered to
  it on every route.
- **Platform users** have no organisation of their own. They are the accounts
  that run the deployment, and they see every organisation. In the admin this is
  the *platform view*, where each list shows which organisation owns a row.
- **A platform user can act as an organisation.** The admin's organisation
  switcher calls `POST /auth/organisation` on the central API, which is
  restricted to platform users and replaces their tokens with ones that carry the
  chosen organisation. While acting, a platform user is filtered exactly as that
  organisation's own staff are. Switching back to none returns to the platform
  view. The route is rate limited, and every switch is recorded.

Some acts only make sense inside one organisation, so the platform view refuses
them with a message asking you to choose an organisation first. Creating content
is one: a new curriculum or question must have an owner. Publishing a
curriculum is another, and so is a content sync, both described under
[publishing](/architecture/publishing).

## The Organisation Admin role

Alongside Super Admin, Admin and Teacher, the central API has an
**Organisation Admin** role. It is the account that runs one organisation. It
holds most of what Admin holds, minus permissions whose action is platform-wide
by design, plus the user permissions that Admin is deliberately denied. That is
safe only because the API
confines staff administration to the caller's own organisation and bounds which
roles and accounts the caller may touch, so an Organisation Admin cannot create
a Super Admin or reach another organisation's accounts. Its permission list is
frozen in a migration, not derived from the current permission enum, so adding a
permission later cannot change what a fresh database grants it.

## Organisations on the student side

The student API checks the token's organisation on every learner, teacher and
server-to-server route. Central's calls to it, such as the report proxies and
the content push, carry the server key and an `X-Organisation-Id` header naming
the organisation the call is for, or `platform` for the platform not acting.

Content reaches the student database as a *scoped replace of one organisation's
content*, never a global wipe: the organisation's questions, documents and
subjects and everything under the curricula in the payload are deleted and
recreated under the same ids, a school or curriculum the payload no longer has
is marked deleted, and learner progress tables are never touched. The payload is
refused whole if any table repeats an id. The route that does this is described
under [publishing](/architecture/publishing).

A classroom server can be set up without the online system. The student API
ships a `provision` script that creates the organisation, school and logins from
a bundled or exported content payload, so a Pi holding one school needs no
connection to central to start.

## How leaks are kept out

Scoping is explicit in every query rather than implicit in a database view. Each
API declares a policy on every route (`@OrgPolicy`), and a route-inventory spec
in each API fails on any route without one. Leak specs in each API drive the
routes as one organisation and check that another organisation's rows never
appear. A `routes:policy` script prints the inventory. If you add a route, give
it a policy and a case in the leak specs.

## See also

- [Publishing](/architecture/publishing)
- [Two languages in content](/architecture/translations)
- [Learning items](/architecture/learning-items)
- [Authorization model](/architecture/authorization)

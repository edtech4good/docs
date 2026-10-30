---
title: Publishing
description: How an edit on the central API stays hidden from learners until a curriculum is published, and how published content reaches the student API.
---

# Publishing

Editing content and showing it to learners are two separate acts. An author can
change a curriculum, a lesson or a question on the central API as often as they
like. Learners see none of it until someone **publishes** the curriculum, and
what they see afterwards is the snapshot taken at that moment, not the live
rows.

This page describes the mechanism. It applies per
[organisation](/architecture/organisations): a curriculum is published for the
organisation that owns it.

## Draft, published, withdrawn

A curriculum is always in one of three states:

- **Never published.** It exists only as live rows on the central API. It is not
  in any sync payload, so learners never see it.
- **Published.** The latest publication is a stored snapshot of the curriculum
  and everything it needs. Learners see that snapshot. The live rows keep
  changing underneath it: the curriculum is also *changed since publish* when
  the live rows no longer match the snapshot.
- **Withdrawn** (retired). Its publication is marked withdrawn, the next payload
  leaves it out, and learners' progress rows stay.

The live tables themselves are unchanged by any of this: there are no draft
copies of rows. A draft is the live rows, and a publication is a copy of them.

## What a publication is

Publishing a curriculum builds a payload for that curriculum alone and stores it
as one row in `curriculumpublications`: the curriculum, its baselines, grades,
levels, lessons, learning items, plans, practices, quizzes and question links,
plus the question-bank rows and documents those rows name, and the translations
of that text (see [two languages in content](/architecture/translations)). The
row also stores a summary of what changed since the publication before it,
computed from a hash of every row. The hash leaves out only the audit columns,
so a change to points or to a deleted flag counts as a change.

The endpoints are `PUT /curriculum/publish/:curriculumid`,
`PUT /curriculum/retire/:curriculumid` and
`GET /curriculum/publication/:curriculumid` (the current state, whether the live
rows have changed, and what a publish now would record). They require the
`publish_curriculum` permission, which Super Admin, Admin and Organisation
Admin hold. Publishing is always for the organisation the caller is acting in,
so a platform user who has not chosen one gets a 400 asking them to; see
[the platform view](/architecture/organisations#the-platform-view-and-acting-as-an-organisation).

Two publishes of one curriculum at once take turns. The payload is built before
the transaction opens, and if a newer publication appears once the lock is held
the call answers 409 and writes nothing.

### The change summary

Each publication's summary lists the rows added, removed and changed per table.
It also names two cases that reach beyond the curriculum being published:

- **Shared rows.** A question or document can be used by several curricula. It
  is in each of their snapshots, and when the payloads are merged the newest
  publication's copy wins. Publishing curriculum B therefore ships B's copy of a
  shared question to curriculum A's learners too, and A then shows as changed
  since publish until it is republished. The summary for B names those rows and
  the curricula they reach.
- **Content moved away.** A grade, level or lesson moved to another curriculum
  of the same organisation disappears from the old curriculum's next
  publication, and learners lose it until the *other* curriculum is next
  published. The summary lists the root of each moved subtree with a message
  saying so. It appears on the first publish after the move only.

Retention keeps the latest two payloads of each curriculum whole. An older
publication loses its stored payload and the row-level detail of its summary,
and keeps its counts and the list of what changed.

## How published content reaches learners

The student API is fed from central by one builder, reached two ways:

- **Sync Content** (`POST /sync/cloud`) pushes to the cloud student server with
  the server key. It is restricted to the Super Admin and Admin roles.
- `GET /sync/content` returns the same payload as a zip, to carry to an offline
  classroom server that accepts it as an upload.

Both serve, for one organisation, the **merged latest publication of each live
curriculum**, plus the live tables the organisation owns outright: the
organisation row, schools, standards, subjects and countries. A curriculum is
served only while its live row exists, belongs to the organisation and is not
deleted. A draft edit is never in the payload.

The merge keeps one copy of each table row. When a bank row appears in several
publications, the copy in the newest one wins, whole; a tie goes to the larger
publication id so the result never depends on read order. A translation travels
with its parent row, taken from the same publication.

An organisation with no published curriculum is served as **empty content**,
and the student side marks every curriculum of that organisation deleted. When
you move an existing deployment onto publishing, run the one-shot command that
publishes every existing curriculum first:

```bash
npm run publish:initial -- --all --dry-run
npm run publish:initial -- --all
```

It works per organisation, all or nothing, skips curricula that already have a
publication, reports any organisation it refuses, and accepts `--organisation
<id>` to do one organisation and `--as <lmsuserid>` to name the publishing user.
Without it, the first sync after upgrade would empty the learner side.

### The student side

The student API does not know about publications. It receives one organisation
payload and applies it as a scoped replace of that organisation's content, as
[the organisations page](/architecture/organisations#organisations-on-the-student-side)
describes. What changes is which rows arrive. A consequence worth knowing: when
a curriculum is retired or unpublished, its grades, levels and lessons stay in
the student database, marked deleted and inert, but the questions and documents
that no other published curriculum uses are removed. A late offline submission
for such a lesson is stored with a null server grade (there was no active
question to grade against), and the learner's earlier progress rows are kept.

### Publishing pushes by itself

A publish, a retire, or the delete of a published curriculum pushes the
organisation's published set to the cloud student server as soon as it commits.
Central performs the push with the server key, so an organisation's admin never
holds the key and a publish reaches online learners without a platform
administrator.

- The push runs after the act commits, never inside its transaction, and it is
  synchronous: the answer carries a `push` outcome of `pushed`, `skipped` (no
  student server is configured, or nothing a learner can see changed) or
  `failed`, with the reason. It gives up after 30 seconds.
- A failed push never undoes the publish. A Super Admin or Admin can push the
  same set again from Sync Content.
- An organisation has one push in flight at a time. Acts that arrive meanwhile
  share one later push built when the first finishes, so the newest state wins.
- Sync Content is **per organisation**. An organisation's own staff sync their
  organisation. A platform user must name one, which the admin does by acting as
  that organisation; otherwise central answers 400 "Choose an organisation."

Pushes are taken in turn on the central side only. The student API's content
import takes no organisation-level lock, so a push that gave up at the timeout
can still be running when the next arrives.

## A level that is switched off

A level has an on/off switch. A level that is **switched off** is absent on the
learner server for every token, including staff: its lessons, learning items,
plans, practices, quizzes and questions answer 404 with the same body as a row
that does not exist, lists leave it out, a submission to it writes nothing, and
it is not counted in the level totals. This is what lets a module be imported or
authored switched off and turned on later without learners seeing it halfway.
Preview a switched-off level in the admin, not on the learner server.

Level and grade points follow the same rule: only levels and lessons that are
switched on count. See [how a level and a grade are worth
points](/reference/lessons-and-question-types#how-a-level-and-a-grade-are-worth-points).

## What a publication does not freeze

- **Media files.** A document row is in the snapshot, but the file it names
  lives in storage, not in the payload. A new file uploaded under the same
  document id changes what learners get without a republish.
- **The stored payload is not byte-stable.** It is MySQL JSON, so tools that
  compare publications compare rows by id and hash, never bytes.

## See also

- [Organisations](/architecture/organisations)
- [Two languages in content](/architecture/translations)
- [Learning items](/architecture/learning-items)
- [Classroom to cloud sync](/architecture/sync)

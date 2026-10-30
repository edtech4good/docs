---
title: Learning items
description: How the learning part of a lesson is an ordered list of typed items, what exists today, and how new item types are meant to be added.
---

# Learning items

A lesson has three parts: learning, practice and quiz (see [lessons and question
types](/reference/lessons-and-question-types)). The learning part is an
**ordered list of items**. Each item has a type, and today the only type is
`video`. This page describes the shape of the list, so that a new kind of item
(a document, an audio clip with a transcript, an image gallery, a card lesson)
can be added without changing how progress, sync and ownership work.

## An item is a row

Each row of `lessonlearnings`, on both the central and the student database, is
one item. An item already had an order, a status, points and a progress record
per learner before it had a type, and it still has them. Adding the type changed
nothing above the row.

| Column | Meaning |
|---|---|
| `lessonlearningname`, `lessonlearningdescription` | the step title and text the app shows |
| `lessonlearningorder`, `lessonlearningstatus`, `points` | position in the list, on or off, and its share of the lesson's points |
| `lessonlearningtype` | a string, default `'video'`; one of the types the API knows |
| `lessonlearningbody` | nullable JSON, the type's own settings; must be null for `video` |
| `documentid` | the item's primary document; nullable, required by the types that need a file |

The type is a plain string, not a database `ENUM`. Adding a type is a code
change in the list of types and its rules, never a schema change.

A second table, `lessonlearningdocuments`, links an item to further documents:
one row per document with a role (`rendition` or `asset`) and an order within the
item. It exists on both sides and travels in the content payload, but nothing
writes to it yet, because `video` takes no extra documents. It was added ahead
of the first type that needs it so that the schema and the sync payload settle
once.

Existing lessons became one-item lists with no data change. The migration adds
the type column with a default of `video`, so every existing row is a video
item with the same id it always had, and progress, sync and the app's routes did
not move.

## What is built

One type ships: `video`. The central API's rules for it are in code: it must name
a document, the document must be of video type, its body must be null, and it
takes no extra documents. Central refuses a write that names a type it
does not know, and the student API refuses a content payload that does. It
refuses the whole payload before it writes anything, so an older classroom server rejects a newer zip loudly instead
of serving a deck as a video.

Authors reach the list through the existing `lesson/learning` routes, which gained
the new fields, plus one route that reorders a lesson's items in a single call,
`PUT /lesson/learning/reorder/:lessonid`. It takes exactly the lesson's item ids,
once each, and writes the order `1..n`. The student API gained no route.

Progress is unchanged. There is still one `studentlearningprogress` row per
learner per item, with the same request and response shapes, and an item counts
as done when it has been seen (`viewed > 0`). Grading does not touch learning
items.

## What the app does with a type it does not know

The app declares which types it can render, in the
`X-Learning-Item-Types` request header it sends to the student API (a
comma-separated list; `video` today), and uses the same list to decide how to
open an item. An item whose type is not in that list shows a notice that it
needs a newer version of the app, **opens nothing and posts no progress**, so a
learner on an old app does not finish a lesson by opening something they cannot
see. A row from a server or a cache that predates types has no type, and the app
reads that as `video`.

## Rules for every future type

These are the design rules for adding a type. Rules 1 and 4 are enforced in code
today; the others bind the types that are still to come.

1. **A type nobody knows is refused, not guessed.**
2. **Everything an item shows offline is a document in the payload.** No live
   URL, except a type explicitly marked online-only.
3. **Every document an item uses is named in a column or a link row**, never
   only inside the JSON body, so "used in" lookups, ownership checks and the
   offline media list stay indexed queries. A body may name a document only if
   it is the item's primary document or one of its link rows.
4. **A body carries its own version**, `v`, and a reader refuses a version it
   does not know. A body is at most 64 KiB serialised.
5. **Ids never change.** Progress, sync and the app all key on the item's id.
6. **Ownership is inherited** through the lesson, the same as for every other
   row under a curriculum, and a link row's document must have the item's owner.
7. **Both APIs change in the same release.** The content payload is strict
   about its tables, so the student API is deployed before central's export
   begins to send a new key.

## What is not designed yet

The phases beyond `video` (documents and slide decks, audio, galleries, card
lessons, packaged content such as SCORM, and links) are planned but not built.
Each will need its own renderer in the app, its own body shape and a decision
about how it earns learning points. Learning points today are awarded only when
a video has been watched, which is why a lesson whose learning item is a
document tops out below 100; see [how a lesson earns its
points](/reference/lessons-and-question-types#how-a-lesson-earns-its-points).
Download-only attachments are meant to be a separate list outside the learning
slot rather than an item type, so they do not affect points.

## See also

- [Publishing](/architecture/publishing)
- [Two languages in content](/architecture/translations)
- [Lessons and question types](/reference/lessons-and-question-types)

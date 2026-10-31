---
title: Admin guide overview
description: What the admin is for, how an organisation, its schools and its content fit together, and why editing a curriculum is not the same as publishing it.
---

# Admin guide

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

This guide is for the staff of an organisation that runs a learning programme
on edtech4good: the people who set up schools, add learners and teachers, build
and publish content, and read reports. It follows the jobs you do, not the
screens, because the screens are being redesigned and the jobs are not.

If you run the servers, start with [Self-hosting](/get-started/self-hosting)
instead. Teachers and learners use the learning app, not the admin. A guide for
the app is a separate piece of work.

## What the admin is for

The admin is the web page where your organisation's staff manage everything
that learners will use:

- **People.** Schools, classes, learners and teachers.
- **Content.** Curricula and their lessons, the questions that go in them, and
  the media (video and audio) they use.
- **Reports.** How learners are doing, and when schools last synced.
- **Settings.** Staff accounts, roles, subjects, countries and tags.

You sign in with an email and a password. See
[Signing in and finding your way](/admin-guide/signing-in).

## Your organisation and its schools

Everything in the admin belongs to one **organisation**: your schools, your
learners, your curricula and your staff accounts. You only ever see your own
organisation's records. One edtech4good deployment can serve several
organisations, and none of them can see another's. The
[Organisations](/architecture/organisations) page explains how that is kept
true.

Under an organisation you create **schools**. In the admin a school is any
place where learners belong: a school, a campus, or a department of a company.
Each school is attached to one or more curricula, and a school can have
**classes**. Learners and teachers belong to a school.

The people who run the deployment have a **platform** account that belongs to no
organisation. It can look across all organisations and can *act as* one when it
needs to do something for you. Some steps in this guide can only be done that
way, and the page says so where it matters.

## How content is shaped

Content is a tree with four tiers:

```
Curriculum
  └─ Grade
       └─ Level
            └─ Lesson
```

A **lesson** is what a learner opens. It holds a learning part (a video), a
practice activity, a quiz and a plan for the teacher. The questions in practice
and quiz come from your organisation's question library, and the video and audio
come from its media library. The lesson types and question types you can
build today are listed in
[Lessons and question types](/reference/lessons-and-question-types).

This guide uses the **School** words for the four tiers, because that is what
the admin's menus say. An organisation can instead be set up to use the
**Company** words. Only the names differ. Nothing about how the tiers behave
changes.

| Tier | School words (used in the admin) | Company words |
|---|---|---|
| 1 | Curriculum | Programme |
| 2 | Grade | Track |
| 3 | Level | Module |
| 4 | Lesson | Lesson |

If your organisation uses the Company words, read "curriculum" as "programme",
"grade" as "track" and "level" as "module" throughout.

## Editing is not publishing

This is the one idea to keep in your head.

You can edit a curriculum as often as you like: rename a lesson, add a
question, move a level. **Learners see none of that.** They see the curriculum
as it was at the last moment someone **published** it. A curriculum that has
never been published is invisible to learners, however finished it looks in the
admin.

So a change reaches learners in three steps:

1. **Edit** it. The change is a draft.
2. **Publish** the curriculum. This takes a snapshot of it and sends that
   snapshot to the learner server (the server the learning app signs in to).
3. **Sync**, where a school needs it, so that every server and device that
   keeps its own copy picks the snapshot up. See the next section.

The curriculum list tells you where each curriculum stands: *Never published*,
*Published* with a date, *Changed since publish* when you have edited it after
publishing, or *Retired* when you have taken it away from learners.
[Publish and sync](/admin-guide/publish-and-sync) walks through each step.

## Online and offline schools

Schools reach the learning app in one of two ways:

- **Online schools.** Learners sign in over the internet to the cloud learner
  server. Publishing sends content to that server, and learner accounts are
  copied to it with **Sync Students**.
- **Offline schools.** Learners use a small classroom server on the school's
  own network, with no internet needed during the lesson. The classroom server
  holds a copy of the content and the learner accounts, and passes progress back
  up when a connection is available.

**Syncing** is the copying between these places. Content and accounts go down
from the admin's central server to the learner servers. Learners' progress goes
back up. A learner server, and a tablet that has been offline, keeps the copy it
last received until the next time it syncs, so a change you publish reaches an
offline school later than an online one.

How the classroom server is loaded and how progress travels back is a job for
whoever runs the deployment. It is described on the
[Classroom to cloud sync](/architecture/sync) page. This guide covers what you
do in the admin.

## The pages in this guide

1. [Signing in and finding your way](/admin-guide/signing-in): your account,
   the menu, and what your role lets you do.
2. [Set up your organisation](/admin-guide/organisation-setup): schools,
   classes, subjects, countries and tags, and what to create first.
3. [Staff accounts and roles](/admin-guide/staff-and-roles): adding staff, what
   each role can do, and who can sync.
4. [Add learners and teachers](/admin-guide/learners-and-teachers): the upload
   sheets, the rules, and the Sync Students step.
5. [Publish and sync](/admin-guide/publish-and-sync): Publish, Re-publish,
   Retire, and getting content to learners.
6. [Reports](/admin-guide/reports): the Reports hub, what each number means and
   where it comes from.
7. [When something is refused](/admin-guide/when-something-is-refused): the
   messages you will meet, with what to do about each.

More pages (building a curriculum, entering text in two languages, and
assessments) will follow.

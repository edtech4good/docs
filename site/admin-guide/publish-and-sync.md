---
title: Publish and sync
description: How to publish, re-publish and retire a curriculum, read the change summary, push content to learners with Sync Content, and what learners see and when.
---

# Publish and sync

*Written for the admin as of [`edtech-lms-ui` d0ba85c](https://github.com/edtech4good/edtech-lms-ui/commit/d0ba85c) and the central server as of [`edtech-lms-api` 9654979](https://github.com/edtech4good/edtech-lms-api/commit/9654979), checked on 31 Oct 2026. The **Sync Teachers** section was checked against
[`edtech-lms-ui` 0b4bf9e](https://github.com/edtech4good/edtech-lms-ui/commit/0b4bf9e) and
[`edtech-lms-api` 33c357a](https://github.com/edtech4good/edtech-lms-api/commit/33c357a)
on 9 Nov 2026.*

Editing a curriculum does not change what learners see. **Publishing** does.
This page covers the whole job: publishing, reading the change summary,
re-publishing, retiring, deleting, and what to do when content does not reach
learners.

If you have not read it yet, the idea behind this page is on the
[overview](/admin-guide/#editing-is-not-publishing).

## The curriculum list

Go to **Content › Curricula › Curriculum list**. Each curriculum has a row, and
the **State** column says where it stands.

![The Curriculum list with Create and Sync Content buttons at the top, and one curriculum with its State shown as Published with a date and Publish, Retire, Delete and Edit buttons.](/admin-guide/curriculum-list.png)

| State | What it means for learners |
|---|---|
| **Never published** | Learners cannot see it. |
| **Published 30 Oct 2026** | Learners see the version published on that date. |
| **Changed since publish** | Learners still see the version published earlier. You have edited the curriculum since, and the edits are not visible to learners yet. |
| **Retired** | You took it away from learners. Their progress is kept. |
| **Can't be published** | Something in the curriculum stops it from being published. Hover over the pill, or open Publish, to read what. If it was published before, learners keep the earlier version. |
| **—** | The state could not be read. Reload the page. |

The buttons on a row are **Publish**, **Retire**, **Delete** and **Edit**.
**Create**, at the top, starts a new curriculum, and **Sync Content**, next to
it, is described [below](#sync-content). You need to be allowed to
publish to see Publish and Retire: Organisation Admin, Admin and Super Admin
accounts are. A platform account must first
[choose an organisation](/admin-guide/signing-in#the-organisation-switcher).

## Publish a curriculum

1. On the curriculum's row, choose **Publish**. A panel opens from the right.
2. Read what it says. It names the curriculum and its state, then summarises
   what is about to reach learners (see the next section).
3. Choose **Publish** at the bottom of the panel. The button reads
   **Publishing…** for a moment.
4. The panel closes and a message tells you how it went. The row's state
   changes to **Published** with today's date.

### Reading the change summary

![The Publish panel for a curriculum that has changed since it was published: it says "1 lesson changed" and lists the lesson by name.](/admin-guide/publish-changes.png)

The panel is a short summary of what will change for learners compared with the
last time the curriculum was published:

- A **first publish**, or a publish after a retire, says: *This curriculum has not
  been published. All of it reaches learners on this publish.* (or *This
  curriculum is retired. All of it reaches learners again on this publish.*)
  There is nothing to compare against, so there is no list.
- After that, a headline counts the changes, such as *1 lesson changed* or *3
  lessons added, 1 changed, 2 questions removed*, and under it lists the
  **Lessons added / changed / removed** and **Questions added / changed /
  removed** by name. Ten names are shown, then *and N more*. Other changes
  (to grades, levels, media and the like) are counted as *other changes*
  without names.
- If nothing has changed, it says *Nothing has changed since the last publish.*
  and the button reads **Re-publish** (see below).
- **Also reaches other curricula** lists a question or media file that more than
  one of your curricula use. Learners of the *other* curricula get this
  curriculum's copy of it too. Those other curricula will then show **Changed
  since publish**. Publish them as well if you want them to match.
- **Content that moved to another curriculum** appears the first time you
  publish after moving a grade, level or lesson elsewhere. Learners lose that
  content from this curriculum now, and get it again when the curriculum it moved
  to is next published.
- A line starting **Translations:** says how many pieces of text still have no
  translation. See [Two languages in content](/architecture/translations).

### What happens after you choose Publish

A publish does two things. It **records** the new version, and that part is all
or nothing: either the version is saved or it is not. Then it **pushes** your organisation's
published curricula to the learner server, so that online learners can get them.
The message tells you about the push:

| Message | What it means |
|---|---|
| **Published**: *Published. The learner server has the organisation's published curricula.* | Recorded and pushed. Online learners can have it now. |
| **Published**: *Published. No learner server is set up here, so nothing was pushed.* | Recorded, but this deployment has no learner server to push to. |
| **Published “Name”, but the push failed**: *Published. The push to the learner server failed; an Admin or Organisation Admin can send it again with Sync Content.* and a reason | Recorded, **not** pushed. This message stays on screen until you close it. See [Sync Content](#sync-content). |

A failed push never undoes the publish. Your version is saved, and the push can
be repeated. After a Retire or a Delete the same sentence starts *Retired.* or
*Deleted.* instead of *Published.*, and it means the same: the change is saved
and not yet sent.

### Re-publish

When nothing has changed, **Publish** reads **Re-publish**. Re-publishing records
a new copy of the same version and pushes again. Use it after a failed push, or
when learners are missing a curriculum you know is published. If you only want
to send again what is already published, without recording a new copy, use
[Sync Content](#sync-content).

### If two people publish at once

If someone else publishes the same curriculum in the moment between you opening
the panel and choosing **Publish**, your publish is refused and the panel shows

> Someone published this curriculum a moment ago. Reload to see their changes.

Choose **Reload**, check the summary, and publish again if you still need to.

### If it cannot be published

If the curriculum has a problem that stops it, its state reads **Can't be
published** and the panel explains it. For example, *This curriculum can't be
published yet. curriculums: 1 row names a subject that has been deleted.* Fix the
named thing (here, give the curriculum a subject that still exists) and try
again. Nothing was published.

## Retire a curriculum

**Retire** takes a curriculum away from learners without deleting it.

1. On the row, choose **Retire**. A box asks *Retire “Name”?* and says *Learners
   lose this curriculum at their next sync. Their progress is kept.*
2. Choose **Retire**.
3. The state changes to **Retired**, and a message reports the push in the same
   form as for a publish, for example *Retired. The learner server has the
   organisation's published curricula.*

**Retire** is greyed out for a curriculum that was never published: learners
never had it, so there is nothing to take away.

A retired curriculum stays in the list. To give it back to learners, choose
**Publish** on it again.

## Delete a curriculum

**Delete** removes the curriculum from the lists. On the row choose **Delete**
and confirm **Sure to delete?**. A message reports **Curriculum deleted**.

If the curriculum was published, deleting it also takes it away from learners,
with a push in the same way as Retire. The message then reads *Deleted. The
learner server has the organisation's published curricula.*

Treat Delete as final. If you might want the curriculum back, **Retire** it
instead: publishing it again brings it back.

## Sync Content

Publishing pushes by itself. **Sync Content** is the manual push, for when an
automatic one has failed.

It is a button at the top of the Curriculum list. You see it if your account is
an **Admin** or an **Organisation Admin**, or a platform account that has chosen
an organisation. A **Teacher** does not see it. If you are an Admin or an
Organisation Admin and the button is missing, sign out and sign back in: if you
were already signed in when your role gained the button, your sign-in keeps its
old permissions for up to an hour. Otherwise ask an Admin or Organisation Admin
of your organisation.

1. Choose **Sync Content** and confirm **Sure to sync?** with **OK**.
2. You see **Success** and *Content synced to cloud sucessfully* (the word
   "successfully" is misspelled on screen).

Sync Content works **per organisation**: it pushes the published curricula of
your own organisation, and nothing of any other. A platform account has to be
acting as an organisation first, or you see **Choose an organisation.** Use the
switcher at the top of the menu, then try again.

If the learner server cannot be reached you see **The service is temporarily
unavailable. Try again in a few minutes.** with a reference code. Try again
later.

## Sync Teachers

**Sync Teachers** copies a school's teacher logins to the learner server, the one
the learning app signs in to. It is the teachers' counterpart of
[Sync Students](/admin-guide/learners-and-teachers#sync-students), which sends
learners only.

It is a button on the school's row in **People › Schools**, beside **Sync
Students**. The same people see it: an **Admin** or an **Organisation Admin** for
their own organisation's schools, and a platform account once it has chosen an
organisation. A **Teacher** does not see it. If you were already signed in when
your role gained the button, sign out and sign back in.

1. Go to **People › Schools**.
2. On the school's row, choose **Sync Teachers** and confirm **Sure to sync?** with
   **OK**.
3. You see **Success** and *`<school name>` teachers synced successfully*.

**What it sends.** All of that school's teacher logins, including any you have
disabled or deleted, so those changes reach the learner server too. It sends
teachers only, and only the school you chose.

**When to run it.**

- After **Upload Teachers**. A teacher login made from a sheet stays in the admin,
  and the teacher cannot sign in on the learner server, until you run Sync
  Teachers for that school.
- When a message tells you to. After **+ Add teacher**, **Reset password**,
  **Disable** or **Enable** on a teacher, the admin says whether the learner server
  got the change. If it says the learning server did not answer, it also says
  *Run Sync Teachers for this school on the Schools screen.* When the change did
  reach the learner server, you do not need to run it.
- After **Delete** on a teacher. Deleting a teacher is not sent to the learner
  server at once, so run Sync Teachers for that school, or the teacher can still
  sign in to the app until you do.

If the school has no teachers you get **There are no teachers to sync.** If the
learner server cannot be reached you get **The service is temporarily unavailable.
Try again in a few minutes.** with a reference code; nothing is lost, so try again
later. See [When something is refused](/admin-guide/when-something-is-refused#syncing).

## What learners see, and when

| Learner's situation | They see… |
|---|---|
| The curriculum is **Never published** or **Retired** | Nothing of it. |
| The curriculum is **Published**, and the learner uses the cloud learner server | The published version once the push has succeeded. |
| The curriculum is **Changed since publish** | The earlier published version. Your edits are drafts. |
| The learner's school uses a **classroom server**, or the tablet has been offline | The copy it last received, until it syncs. A published change reaches an offline school **later** than an online one. |
| You **Retire** or delete a curriculum | The curriculum disappears at the learner's next sync. Progress already recorded is kept. |

Two cautions:

- **Accounts are separate from content.** Publishing sends curricula, not
  people. A new learner cannot sign in until you have also run
  [Sync Students](/admin-guide/learners-and-teachers#sync-students), and a teacher
  login made from a sheet cannot sign in until you have run
  [Sync Teachers](#sync-teachers). A learner added with the form is sent at once,
  but their school and class must already be on the learner server, so run Sync
  Content first.
- **Media files are not part of the snapshot.** A publish records which media a
  lesson uses, but a file replaced in storage under the same name reaches
  learners without a publish. See
  [Publishing](/architecture/publishing#what-a-publication-does-not-freeze).

For how publishing is built, and what happens on the learner server, see
[Publishing](/architecture/publishing).

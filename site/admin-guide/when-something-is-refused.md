---
title: When something is refused
description: The messages admin staff meet when an upload, sign-in, publish or sync is refused, quoted as they appear on screen, each with its cause and what to do.
---

# When something is refused

*Written for the admin as of [`edtech-lms-ui` d0ba85c](https://github.com/edtech4good/edtech-lms-ui/commit/d0ba85c) and the central server as of [`edtech-lms-api` 9654979](https://github.com/edtech4good/edtech-lms-api/commit/9654979), checked on 31 Oct 2026. The sections **Saved, but the learning server did not answer** and **Add, edit, reset and disable forms** were checked against
[`edtech-lms-ui` 0b4bf9e](https://github.com/edtech4good/edtech-lms-ui/commit/0b4bf9e) and
[`edtech-lms-api` 33c357a](https://github.com/edtech4good/edtech-lms-api/commit/33c357a)
on 9 Nov 2026.*

Most refusals appear as a red **Error** notice in the top right corner of the
page. This page lists the ones you are most likely to meet, quoted as they
appear, with what causes each and what to do. Text in quotation marks is the
screen's own wording, including its odd spacing and punctuation.

![The Learners page with a red Error notice in the top right reading "[0].schoolusername" must only contain alpha-numeric characters.](/admin-guide/upload-refused.png)

## A learner or teacher sheet is refused

An upload is checked **before anything is added**, and a refused file adds
nothing. The notice lists every problem in the file in one line, separated by
commas. Each problem names the row and the column. Row numbers start at **0**,
so `[0]` is the first person below the headings, `[1]` the second.

The rules behind these are on
[Add learners and teachers](/admin-guide/learners-and-teachers#the-learner-sheet).

- `"[0].schoolusername" must only contain alpha-numeric characters`
  - **Cause:** The username has a space, dot, dash, underscore, accent or Khmer letter in it.
  - **What to do:** Use only letters and digits, such as `pp3anna`.
- `"[0].schoolusername" length must be at least 2 characters long`
  - **Cause:** The username is one character, or empty.
  - **What to do:** Give a username of 2 to 16 characters.
- `"[0].schooluserpasswordhash" length must be less than or equal to 16 characters long, "[0].schooluserpasswordhash" must only contain alpha-numeric characters`
  - **Cause:** The password is too long, or has a symbol or space in it.
  - **What to do:** Use up to 16 letters and digits.
- `"[0].genderid" must be one of [1, 2]`
  - **Cause:** The `genderid` is not `1` or `2`, for example `M` or `F`.
  - **What to do:** Write `1` or `2`.
- `0,dateofbirth not valid , 0,dateofjoin not valid`
  - **Cause:** A date is not written day-month-year with dashes, for example `2026-10-30` instead of `30-10-2026`. The `0` is the row.
  - **What to do:** Write `30-10-2026`.
- `"[0].type" must be one of [offline, online], "[0].type" is not allowed to be empty`
  - **Cause:** The `type` column is empty or has another word in it.
  - **What to do:** Write `offline` or `online`.
- `"[0].wg_seeing" must be one of [1, 2, 3, 4, , null]`
  - **Cause:** A disability column has something other than blank, 1, 2, 3 or 4. The same applies to the other five `wg_` columns.
  - **What to do:** Use 1 to 4, or leave it blank.
- `"[0].city" is not allowed to be empty`
  - **Cause:** A required column is there but the cell is empty. The same wording appears for `country`, `state` and the other required columns.
  - **What to do:** Fill in the cell.
- `"[0].studentfirstname" length must be at least 2 characters long`
  - **Cause:** A name is a single character.
  - **What to do:** Use at least 2 characters.
- `"[0].city" is required, "[0].country" is required, "[0].dateofjoin" is required, …`
  - **Cause:** The column heading itself is missing from the file.
  - **What to do:** Start from the sample file so every heading is present.
- `"value" must contain at least 1 items`
  - **Cause:** The file has headings but no rows.
  - **What to do:** Add at least one row.
- `Duplicate school user name not allowed`
  - **Cause:** The same username appears on two rows of a learner sheet.
  - **What to do:** Give each learner a different username.
- `Duplicate teacher name not allowed`
  - **Cause:** The same on a teacher sheet.
  - **What to do:** Same.
- `Some of the information isn't valid.`
  - **Cause:** The file passed the checks above, but the server refused a row. The usual cause is a **username that is already in use** (by anyone, in any school). The screen does not say which row.
  - **What to do:** Look for a username that already exists, in the Learners list or a teacher list, and change it. If a deleted account used the name, it cannot be reused.
- `Choose a class for this student.`
  - **Cause:** You did not choose a **Class** in the dialog, and the sheet has a row that is not a teacher.
  - **What to do:** Choose the class, then upload again.

The **Upload Users** dialog also says **Please select school** or **Please select
curriculum** under a field you did not fill in. Nothing is uploaded until you
do.

When you edit learners, an extra refusal is
`Please select a country or a school or a student before download!` (titled
**Failed**): choose at least one filter before **Download Students For Edit**.
The edit sheet shows the same kind of messages as above.

## Signing in

- `The email or password is incorrect.`
  - **Cause:** The email or the password is wrong.
  - **What to do:** Retype both. Use **Show** to check.
- `Too many sign-in attempts. Wait a minute and try again.`
  - **Cause:** More than 10 attempts in a minute from one network address. Staff in the same office share that limit.
  - **What to do:** Wait a minute.
- `Your session ended. Sign in again.`
  - **Cause:** You were signed in somewhere else with the same account, or your sign-in expired.
  - **What to do:** Sign in again. Do not share one account between people.
- `Can't reach the server. Check your connection and try again.`
  - **Cause:** Your browser could not reach the admin's server.
  - **What to do:** Check your connection.
- `This link is invalid or has expired.`
  - **Cause:** A password-reset link is old or already used.
  - **What to do:** Choose **Forgot password?** and ask for a new one.

## Choosing an organisation (platform accounts)

You only see these if you are signed in with a platform account that has not
chosen an organisation.

- `Choose an organisation.`
  - **Where:** An error after **Sync Content**.
  - **What to do:** Use the switcher at the top of the menu to choose the organisation, then try again.
- `Choose an organisation to act in before you publish a curriculum. Use the organisation switcher, then try again.`
  - **Where:** In the **Publish** panel, after you choose Publish.
  - **What to do:** The same.
- `Choose an organisation to act in before you create content. Use the organisation switcher, then try again.`
  - **Where:** A tooltip on **+ Add learner**, **Upload Users**, **+ Add teacher** and **Upload Teachers**, which are greyed out.
  - **What to do:** The same.

## Publishing

- `Someone published this curriculum a moment ago. Reload to see their changes.`
  - **Cause:** Someone else published the same curriculum while you had the panel open. Nothing was lost.
  - **What to do:** Choose **Reload**, read the summary, publish again if still needed.
- `Published “Name”, but the push failed` and `Published. The push to the learner server failed; an Admin or Organisation Admin can send it again with Sync Content.` followed by a reason
  - **Cause:** The version is saved, but sending it to the learner server failed. This notice stays on screen until you close it. After a Retire or a Delete the sentence starts *Retired.* or *Deleted.*
  - **What to do:** Choose **Sync Content** at the top of the Curriculum list, or open **Publish** on the row and choose **Re-publish**. If you do not see **Sync Content**, ask an Admin or Organisation Admin of your organisation.
- `Can't be published` (the state), with `This curriculum can't be published yet. curriculums: 1 row names a subject that has been deleted.`
  - **Cause:** The curriculum refers to something that is gone, here a deleted subject.
  - **What to do:** Fix the thing named. The message ends *Nothing was published.*
- `The service couldn't be reached. Check the connection and try again.`
  - **Cause:** The publish call could not be sent.
  - **What to do:** Check your connection and try again.

## Saved, but the learning server did not answer

These notices come after **Add learner**, **+ Add teacher**, **Edit details**,
**Reset password**, **Disable** and **Enable**. In every case **the change is saved
in the admin and is not lost**. What failed is the copy to the learner server, so
until you run the sync the notice names, that server still has the old state. The
person may still be able to sign in with the old password, or after a disable.

- `[Name] can't sign in yet: the learning server did not answer. Run Sync Students for this school on the Schools screen.` (a learner added with the form)
  - **Cause:** The learner is saved, but the learner server did not answer or refused the learner.
  - **What to do:** Run **Sync Students** for the school. If that does not fix it, run **Sync Content** first, then Sync Students again.
- `[Name] can't sign in yet: the learning server did not answer. Run Sync Teachers for this school on the Schools screen.` (a teacher added with the form)
  - **Cause:** The teacher is saved, but the learner server did not answer.
  - **What to do:** Run **Sync Teachers** for the school. See [Sync Teachers](/admin-guide/publish-and-sync#sync-teachers).
- `Saved, but the learning server doesn't have this class or curriculum yet. Run Sync Content, then Sync Students for this school.`
  - **Cause:** The learner is saved, but the learner server does not yet have the learner's class or curriculum, so it refused the learner. You can see it after **Add learner** and **Edit details**.
  - **What to do:** Run **Sync Content**, then **Sync Students** for the school, in that order.
- `The details were saved, but the learning server did not answer. Run Sync Students for this school on the Schools screen.` (**Saved**, after Edit details)
  - **Cause:** The edit is in the admin; the learner server has the old details.
  - **What to do:** Run **Sync Students** for the school.
- `[Username] is disabled on central. The change was saved, but the learning server did not answer. Run Sync Students for this school on the Schools screen.` (**Saved**, after Disable or Enable on a learner; the first sentence says *enabled* after Enable)
  - **Cause:** The admin has the change; the learner server does not yet. "Central" here means the admin's own records. The learner can still sign in until the sync runs.
  - **What to do:** Run **Sync Students** for the school.
- `[Username] is disabled on central, but the learning server did not answer. Run Sync Teachers for this school on the Schools screen.` (**Saved**, after Disable or Enable on a teacher)
  - **Cause and what to do:** The same, with **Sync Teachers**.
- `The old password still works on the learning server. The password was saved, but the learning server did not answer. Run Sync Students for this school on the Schools screen.` (after Reset password on a learner)
  - **Cause:** The new password is in the admin; the learner server still accepts the old one.
  - **What to do:** Run **Sync Students** for the school, and do not hand over the new password as working until you have.
- `The learning server did not answer, so the old password still works there. Run Sync Teachers for this school on the Schools screen.` (after Reset password on a teacher)
  - **Cause and what to do:** The same, with **Sync Teachers**.
- `[Name] can sign in once the learning server next syncs.`, `Saved. The learning server gets the change at its next sync.` and `The learning server gets the new password at its next sync.`
  - **Cause:** No learner server is connected to this admin, so nothing was sent.
  - **What to do:** Nothing. A classroom server gets accounts by file; see **Download Students** in [Sync Students](/admin-guide/learners-and-teachers#sync-students).

## Add, edit, reset and disable forms

Most field messages appear under the field they belong to. The others appear at the top of the form. These are the ones you may meet:

- `Some of the information isn't valid. Check the form and try again.`
  - **Cause:** The server refused one or more fields.
  - **What to do:** Read the message under each field and fix it.
- `That username is taken.`
  - **Cause:** The username is used, in any capital letters, by any learner or teacher of any organisation, even a deleted one.
  - **What to do:** Choose another. A short code for your school at the front avoids clashes.
- `The teacher couldn't be added. Try again.`, `The learner couldn't be added. Try again.`, `The details couldn't be saved. Try again.` and `The password couldn't be changed. Try again.`
  - **Cause:** The save did not go through, with no more specific reason.
  - **What to do:** Try again. If it repeats, send the wording to whoever runs your deployment.
- `You don't have permission to add teachers.`, `You don't have permission to edit learners.` and `You don't have permission to reset passwords.`
  - **Cause:** Your role is not allowed that action.
  - **What to do:** Ask an account with the right role.
- `That school no longer exists. Close this and try again.`, `That school or class no longer exists. Close this and try again.`, `That learner no longer exists. Close this and try again.` and `That account no longer exists. Close this and try again.`
  - **Cause:** The school, class, learner or account was deleted, or belongs to another organisation, since you opened the list.
  - **What to do:** Close the form and reload the list.
- `Some of the information isn't valid. Close this and try again.`
  - **Cause:** **Reset password** was refused for a reason the form cannot show beside a field.
  - **What to do:** Close the form, reload the list and try again.
- `The learner's details couldn't be loaded.`
  - **Cause:** **Edit details** could not read the learner. The form shows only a **Close** button.
  - **What to do:** Close it and try again.
- `The current class is no longer available. Choose another one to save.` and `A curriculum marked (no longer available) must be removed before you save.`
  - **Cause:** The learner's class or a curriculum was deleted after it was assigned.
  - **What to do:** Choose another class, or remove the marked curriculum, then **Save**.

## Syncing

- `There are no students to sync.`
  - **Cause:** **Sync Students** on a school with no learners.
  - **What to do:** Upload learners first.
- `There are no teachers to sync.`
  - **Cause:** **Sync Teachers** on a school with no teacher logins.
  - **What to do:** Add or upload teachers first.
- `The service is temporarily unavailable. Try again in a few minutes. Reference: E-…`
  - **Cause:** **Sync Content**, **Sync Students** or **Sync Teachers** could not reach the learner server.
  - **What to do:** Wait and try again. If it repeats, give the reference code to whoever runs the deployment.
- A sync button you expect is not on the screen (no message)
  - **Cause:** Only an Admin, an Organisation Admin and a platform account that has chosen an organisation see **Sync Content**, **Sync Students** and **Sync Teachers**. If your role is one of those and you were signed in before it gained the buttons, your sign-in still carries the old permissions, for up to an hour.
  - **What to do:** Sign out and sign back in. See [Staff accounts and roles](/admin-guide/staff-and-roles#syncing-who-can-do-it).
- `You don't have permission to do that.`
  - **Cause:** Your role is not allowed the action. Buttons you are not allowed to use are normally hidden, so you meet this only when an action reaches the server some other way.
  - **What to do:** Ask an account with the right role. See [What a role changes](/admin-guide/signing-in#what-a-role-changes).
- `That record was not found. It may have been removed, or it may not be yours to see.`
  - **Cause:** The thing you asked for was deleted or belongs to another organisation.
  - **What to do:** Reload the list.
- `Too many attempts. Wait a minute and try again.`
  - **Cause:** The server limits some actions, such as sign-in and password reset, to a few a minute.
  - **What to do:** Wait a minute.
- `Something went wrong..!!`
  - **Cause:** The browser got no answer at all.
  - **What to do:** Check your connection and try again.

If a refusal is not on this page, copy the notice's wording and any **Reference**
code, and send them to whoever runs your deployment. The reference lets them find
the matching entry in the server's logs.

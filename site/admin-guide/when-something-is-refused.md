---
title: When something is refused
description: The messages admin staff meet when an upload, sign-in, publish or sync is refused, quoted as they appear on screen, each with its cause and what to do.
---

# When something is refused

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

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
  - **Where:** A tooltip on **Upload Users** and **Upload Teachers**, which are greyed out.
  - **What to do:** The same.

## Publishing

- `Someone published this curriculum a moment ago. Reload to see their changes.`
  - **Cause:** Someone else published the same curriculum while you had the panel open. Nothing was lost.
  - **What to do:** Choose **Reload**, read the summary, publish again if still needed.
- `Published “Name”, but the push failed` and `Published. The push to the learner server failed; a platform admin can re-push from Sync Content.` followed by a reason
  - **Cause:** The version is saved, but sending it to the learner server failed. This notice stays on screen until you close it.
  - **What to do:** Open **Publish** on the row and choose **Re-publish**, or ask an Admin or platform account to run **Sync Content**.
- `Can't be published` (the state), with `This curriculum can't be published yet. curriculums: 1 row names a subject that has been deleted.`
  - **Cause:** The curriculum refers to something that is gone, here a deleted subject.
  - **What to do:** Fix the thing named. The message ends *Nothing was published.*
- `The service couldn't be reached. Check the connection and try again.`
  - **Cause:** The publish call could not be sent.
  - **What to do:** Check your connection and try again.

## Syncing

- `There are no students to sync.`
  - **Cause:** **Sync Students** on a school with no learners.
  - **What to do:** Upload learners first.
- `The service is temporarily unavailable. Try again in a few minutes. Reference: E-…`
  - **Cause:** **Sync Content** or **Sync Students** could not reach the learner server.
  - **What to do:** Wait and try again. If it repeats, give the reference code to whoever runs the deployment.
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

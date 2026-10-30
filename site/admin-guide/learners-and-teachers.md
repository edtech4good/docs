---
title: Add learners and teachers
description: How to add learners and teachers from a spreadsheet, every column of the learner sheet, the rules that refuse a row, and the Sync Students step that makes the accounts work in the learning app.
---

# Add learners and teachers

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

You add people to the admin by uploading a **CSV file**, one row per person. A
CSV is a plain spreadsheet export: in Excel or Google Sheets choose *Save as*
or *Download* and pick CSV. There are two uploads, because they make different
things:

- **Upload Users**, on the **Learners** page, creates **learners**.
- **Upload Teachers**, on the **Teachers** page, creates **teacher logins**.

An upload only creates the accounts in the admin. For learners to sign in to the
learning app, a second step, **Sync Students**, copies them to the learner
server. Skipping it is the most common reason a new learner "cannot log in".

## Before you start

You need:

- the **school** the people belong to, already created under
  **People › Schools**, and attached to at least one curriculum;
- for learners, a **class** under **People › Classes** (a class is required for
  every learner row that is not a teacher);
- an account that is allowed to upload: Organisation Admin, Admin or Super
  Admin. If **Upload Users** or **Upload Teachers** is greyed out, you are
  signed in with a platform account that has not chosen an organisation. Use
  the switcher at the top of the menu first. See
  [Signing in and finding your way](/admin-guide/signing-in#the-organisation-switcher).

## Add learners

![The Learners page, listing learners with their curriculum, school, class and country. Sample File and Upload Users buttons are at the top right.](/admin-guide/learners-list.png)

1. Go to **People › Learners**.
2. Choose **Sample File** to download a template with the right column headings.
   Next to it, a small **?** shows a short reminder of the required columns.
3. Fill in one row per learner. The columns are below.
4. Choose **Upload Users**. A dialog opens.

   ![The Upload Users dialog with School, Curriculum and Class chosen and an Upload button.](/admin-guide/upload-dialog.png)

5. Choose the **School**, then the **Curriculum** (or curricula: you can pick
   more than one), then the **Class**. The curriculum list shows the curricula
   that school is attached to.
6. Choose **Upload**, and pick your CSV file.

If everything is accepted you see **Users uploaded successfully** and the
learners appear in the list. If anything is wrong the whole file is refused and
**nothing is added**: fix the file and upload it again. A file holds between 1
and 500 rows.

### The learner sheet

Use the column headings exactly as in the sample file, in any order.

- `studentfirstname`
  - **Required:** Yes
  - **What goes in it:** The learner's first name. Khmer is allowed.
  - **What is refused:** Fewer than 2 or more than 100 characters.
- `studentlastname`
  - **Required:** No
  - **What goes in it:** Last name.
  - **What is refused:** More than 100 characters.
- `familyname`, `mothername`, `fathername`
  - **Required:** No
  - **What goes in it:** Optional name fields.
  - **What is refused:** More than 100 characters.
- `dateofbirth`
  - **Required:** No
  - **What goes in it:** Day-month-year, like `15-03-2014`.
  - **What is refused:** Anything that is not a real date written that way, with 10 characters.
- `dateofjoin`
  - **Required:** Yes
  - **What goes in it:** The day the learner joined, like `30-10-2026`.
  - **What is refused:** Anything that is not a real date written that way, with 10 characters, or a missing date. `2026-10-30` is refused.
- `genderid`
  - **Required:** Yes
  - **What goes in it:** `1` or `2` (the sheet's built-in help says 1 is male and 2 is female).
  - **What is refused:** Anything else, including letters.
- `wg_seeing`, `wg_hearing`, `wg_walking`, `wg_remembering`, `wg_selfcare`, `wg_communicating`
  - **Required:** No
  - **What goes in it:** The six disability questions: `1` no difficulty, `2` some, `3` a lot, `4` cannot do at all. Leave blank if not asked.
  - **What is refused:** Anything but blank, `1`, `2`, `3` or `4`. See [Disability fields](/reference/disability-fields).
- `contact`
  - **Required:** No
  - **What goes in it:** A phone number or other contact.
  - **What is refused:** More than 100 characters.
- `city`, `country`
  - **Required:** Yes
  - **What goes in it:** Where the learner lives.
  - **What is refused:** Missing, or fewer than 2 or more than 100 characters.
- `state`
  - **Required:** Yes
  - **What goes in it:** Province or state.
  - **What is refused:** Missing, or more than 100 characters.
- `schoolusername`
  - **Required:** Yes
  - **What goes in it:** The learner's **username** for the app.
  - **What is refused:** Fewer than 2 or more than 16 characters; anything other than **letters and digits** (no spaces, dots, dashes or underscores, no Khmer); the same username twice in the sheet; a username that is already in use.
- `schooluserpasswordhash`
  - **Required:** Yes
  - **What goes in it:** The learner's **password**, typed in plain.
  - **What is refused:** Missing; more than 16 characters; anything other than letters and digits.
- `type`
  - **Required:** Yes
  - **What goes in it:** `offline` or `online`.
  - **What is refused:** Empty, or anything else. See the note below.
- `is_teacher_acc`
  - **Required:** No
  - **What goes in it:** `1` makes the row a teacher account in the learning app. Blank or `0` for a learner.
  - **What is refused:** Anything but blank, `0` or `1`.

A few things about these rules:

- **Usernames are shared across the whole system.** A username that any
  organisation has ever used cannot be used again, even if that account was
  later deleted. A short code for your school at the front (`pp3anna`) avoids
  clashes.
- **The refusal message names the column and the row.** `"[0].schoolusername"`
  means the first data row's `schoolusername`. Row numbers start at `0`, so
  `[0]` is the first learner below the headings.
- **The sheet lists every problem it finds**, all in one message, so fix them
  all before you upload again. Examples of the exact wording are on
  [When something is refused](/admin-guide/when-something-is-refused).
- **The upload dialog's school, curriculum and class apply to every row.**
  To put learners in different classes, upload one file per class.
- **About `type`.** The sheet insists on `offline` or `online`, but a learner
  added through **Upload Users** is recorded as `offline` whichever you write,
  and a row marked `is_teacher_acc` `1` is recorded as `online`. The
  **Type** column of the Learners list shows what was recorded for learners
  added by upload. It is blank for learners that were not added that way.

### Passwords

The password in `schooluserpasswordhash` is typed **in plain** because that is
the only time you can set it. The server **stores it hashed**, as a one-way
scrambled value, so nobody, including you, can read it back later.

That makes the CSV the only readable copy. **Delete the filled sheet** from your
computer and your downloads folder as soon as the upload has gone through, and
do not email it. Give each learner their password in person or on a printed
card.

To change a password later, use the edit sheet, below.

### Teachers in the learner sheet

A row with `is_teacher_acc` set to `1` becomes a **teacher account in the
learning app**: the learner list shows `True` in its **Is Teacher** column, the
row does not need a class, and it is recorded as an online account. This is how
a teacher is made who signs in to the learner server.

## Add teacher logins

**Upload Teachers** is simpler. It makes a login, nothing else.

1. Go to **People › Teachers**.
2. Choose **Sample File** for the template, or write a CSV with two columns:
   `schoolusername` and `schooluserpasswordhash`.
3. Choose **Upload Teachers**, choose the **School**, then **Upload** and pick
   the file.

Both columns are required. The same rules apply as for learners: a username of
2 to 16 letters and digits that is not already in use, and a password of up to
16 letters and digits typed in plain. A teacher name that appears twice in the
sheet is refused with **Duplicate teacher name not allowed**. A success reads
**Teachers uploaded successfully**. Delete the filled sheet afterwards, as for
learners.

::: warning Teacher logins are not carried by Sync Students
When we checked, **Sync Students sends learners only**. A login made with
**Upload Teachers** stays in the admin and was not on the learner server
afterwards, and the admin has no button that sends it there. If a teacher must
sign in on the learner server, ask the people who run your deployment. The
teacher account made through `is_teacher_acc` in the learner sheet does travel
with Sync Students.
:::

## Sync Students

After you upload learners, they exist in the admin but not yet on the **learner
server**, the one the learning app signs in to. **Sync Students** copies them
across.

1. Go to **People › Schools**.
2. On the school's row, choose **Sync Students** and confirm **Sure to sync?**
   with **OK**.
3. You see **Success** and `<school name> students synced sucessfully` (the
   word "successfully" is misspelled on screen).

![The Schools list with a school's row showing Delete, Download Students, Sync Students, Edit and Fees Collection buttons, and the confirmation Sure to sync? open over Sync Students.](/admin-guide/sync-students.png)

Things to know:

- **The button is not shown to every account.** In the version this guide was
  checked against, **Sync Students appears only for the platform's own
  accounts**. An Organisation Admin account does not see it, and the server
  refuses that account's request if it is sent anyway. An Admin account does not
  see it either. If you do not see it, ask whoever runs your deployment to run
  Sync Students for your school, and tell them which school.
- **A platform account should choose your organisation first** with the
  switcher, so that the Schools list shows only your schools.
- **It is per school.** Sync each school you added learners to.
- **Sync again after every change.** Uploading more learners, or editing
  existing ones, changes the admin only. The learner server keeps the old copy
  until the next Sync Students.
- **If the school has no learners yet,** you get **There are no students to
  sync.**
- **If the learner server cannot be reached,** you get **The service is
  temporarily unavailable. Try again in a few minutes.** with a reference code.
  Nothing is lost. Try again later and quote the reference if you ask for help.

A school that uses a classroom server rather than the cloud one is loaded from a
file instead. **Download Students**, next to Sync Students, produces a file of
the school's learners for that purpose.

## Change learners already added

You edit learners by **downloading** them as a sheet, changing it, and
**uploading** it back.

1. Go to **People › Learners** and open the **Edit Student Tab**.
2. Choose a country, a school or a single student (at least one) and choose
   **Download Students For Edit**. If you choose none, you see **Please select a
   country or a school or a student before download!**
3. Open the CSV and change what you need. Leave the `studentid` and
   `schooluserid` columns alone: they tell the admin which learner each row is.
4. Choose **Upload Edited Students** and pick the file. A success reads
   **Edited Students uploaded successfully**, and the page reloads.

The edit sheet has the same columns as the upload sheet plus `studentid`,
`schooluserid`, `schoolname`, `curriculums`, `standard` and `isactive`. `isactive`
is `1` for an active learner and `0` for one who is not. Two rules differ from
a new upload:

- `schooluserpasswordhash` can be **left blank**, which keeps the learner's
  password as it is. If you type one, it must be 6 to 16 letters and digits,
  and it replaces the old one.
- `dateofjoin` is still required on every row. A row where it is blank, which
  can happen for a teacher account, is refused. Leave such rows out of the file.

Edits reach the admin at once and the learner server at the next **Sync
Students**.

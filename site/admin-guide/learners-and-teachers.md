---
title: Add learners and teachers
description: How to add one learner at a time, or many learners and teachers from a spreadsheet, every column of the learner sheet, the rules that refuse a row, and the Sync Students step that makes the accounts work in the learning app.
---

# Add learners and teachers

*Written for the admin as of [`edtech-lms-ui` d0ba85c](https://github.com/edtech4good/edtech-lms-ui/commit/d0ba85c) and the central server as of [`edtech-lms-api` 9654979](https://github.com/edtech4good/edtech-lms-api/commit/9654979), checked on 31 Oct 2026. The **Add one learner** section was checked against
[`edtech-lms-ui` 206b525](https://github.com/edtech4good/edtech-lms-ui/commit/206b525) and
[`edtech-lms-api` c4f9a8a](https://github.com/edtech4good/edtech-lms-api/commit/c4f9a8a)
on 8 Nov 2026.*

You can add **one learner at a time** with a form, or add **many people at
once** by uploading a **CSV file**, one row per person. Teachers are added by
upload only. A CSV is a plain spreadsheet export: in Excel or Google Sheets
choose *Save as* or *Download* and pick CSV. There are two uploads, because they
make different things:

- **Upload Users**, on the **Learners** page, creates **learners**.
- **Upload Teachers**, on the **Teachers** page, creates **teacher logins**.

An upload only creates the accounts in the admin. For learners to sign in to the
learning app, a second step, **Sync Students**, copies them to the learner
server. Skipping it is the most common reason a new learner "cannot log in".
The form for one learner sends that learner to the learner server as soon as you
save, so it usually needs no second step. See [Add one learner](#add-one-learner).

## Before you start

You need:

- the **school** the people belong to, already created under
  **People › Schools**, and attached to at least one curriculum;
- for learners, a **class** under **People › Classes** (a class is required for
  every learner row that is not a teacher);
- an account that is allowed to upload or add: Organisation Admin, Admin or Super
  Admin. If **Add learner**, **Upload Users** or **Upload Teachers** is greyed out, you are
  signed in with a platform account that has not chosen an organisation. Use
  the switcher at the top of the menu first. See
  [Signing in and finding your way](/admin-guide/signing-in#the-organisation-switcher).

## Add one learner

Use this when you have a learner or two to add. For a whole class, use the sheet
in [Add learners](#add-learners) instead.

1. Go to **People › Learners**.
2. Choose **+ Add learner**, next to **Upload Users**. A form opens at the right
   of the page. The button is greyed out in the same cases as **Upload Users**.
3. Fill in the form (the fields are below) and choose **Add learner**.
4. A panel headed **Learner added** shows the username and the password. Copy or
   write them down, then choose **Done**.

### The fields

A star in the form marks a required field.

**Account**

- **First name** (required). 2 to 45 characters. The message if it is wrong is
  *Enter a name of 2 to 45 characters.*
- **Last name**. Optional; up to 45 characters.
- **Username** (required). 2 to 16 English letters or numbers. The form checks it
  as you type, and a line under the field says *Available. Learners use this to
  sign in.* or *That username is taken.* If the characters or the length are not
  allowed you see *Use 2 to 16 English letters or numbers.* A username counts as
  taken **whatever its capital letters**: if `Sokha2` exists, `sokha2` is taken.
  As with the sheet, a username that any organisation has used cannot be used
  again.
- **Password** (required). 8 to 32 characters with at least one letter and one
  number, and no spaces. If it is wrong you see *Use 8 to 32 characters with at
  least one letter and one number, and no spaces.* Two buttons sit beside the
  field:
  - **Generate** fills in a password of two short English words and two digits,
    which is easy to read out or write on a card.
  - **Show** shows the password you typed or generated, and then reads **Hide**.

**Where**

- **School** (required). If you have only one school it is already chosen. If the
  schools cannot be loaded you see *The schools couldn't be loaded.* and a
  **Try again** link.
- **Class** (required). Choose a school first; the list then shows that school's
  classes. If it has none you see *This school has no classes yet. Add one on the
  Schools screen.*
- **Curriculum** (required). Choose one or more; the list shows the curricula
  that school is attached to. If it has none you see *This school has no
  curricula yet.* Changing the school clears the class and the curriculum.

**About the learner**

- **Gender** (required). **Female** or **Male**.
- **Date of birth**. Optional. A date from 1900 to yesterday. If it is not a real
  date or is outside that range you see *Enter a date of birth between 1900 and
  yesterday.*

If you close the form after typing something, you are asked **Discard this
learner?** with *This learner hasn't been added yet.* Choose **Discard**, or
**Keep editing** to go back.

### After you choose Add learner

If the server refuses something, the message appears under the field it belongs
to, or at the top of the form. If the form says *Some of the information isn't
valid. Check the form and try again.*, read each field's message and fix it.

The **Learner added** panel shows the **Username** and the **Password**, each
with a **Copy** button, and the line *Write it down or copy it now; it is not
shown again.* Take it at its word: once you choose **Done** or close the panel,
the password cannot be shown again. If a **Copy** button does not work you see
*The copy didn't work. Select the username and copy it by hand.* (or *password*),
and you can select the text and copy it yourself.

Above them, one line says whether the learner can sign in yet:

- *<name> can sign in now with these details.* The learner was copied to the
  learner server as soon as you saved. Nothing more is needed.
- *<name> can't sign in yet: the learning server did not answer. Run Sync
  Students for this school on the Schools screen.* The learner is saved in the
  admin, but the learner server could not be reached. Run
  [Sync Students](#sync-students) for the school, and they can sign in
  afterwards.
- *<name> can sign in once the learning server next syncs.* The learner is saved
  and will be picked up at the learner server's next sync. No action is needed
  from you.

A learner added with this form is recorded as **online**. See the note about `type` under
[The learner sheet](#the-learner-sheet).

::: tip Run Sync Content first
The curriculum and the class the learner is placed in must already be on the
learning server. If you have just created or changed a curriculum, publish it
or run [Sync Content](/admin-guide/publish-and-sync#sync-content) first, and
only then add the learner.
:::

Give the username and password to the learner in person or on a printed card, as
described under [Passwords](#passwords).

## Add learners

Use the sheet to add many learners at once. For one learner, use
[Add one learner](#add-one-learner).

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
  and a row marked `is_teacher_acc` `1` is recorded as `online`. A learner
  added with the **Add learner** form is recorded as `online`. The
  **Type** column of the Learners list shows what was recorded for learners
  added by upload. It is blank for learners that were not added that way.

### Passwords

The password in `schooluserpasswordhash` is typed **in plain** because that is
the only time you can set it. The server **stores it hashed**, as a one-way
scrambled value, so nobody, including you, can read it back later.

That makes the CSV the only readable copy. **Delete the filled sheet** from your
computer and your downloads folder as soon as the upload has gone through, and
do not email it. Give each learner their password in person or on a printed
card. The same goes for a password made with the **Add learner** form: write it
on a card and hand it over, rather than sending it in a message.

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

- **Who sees the button.** An **Admin** or an **Organisation Admin** sees
  **Sync Students** on the rows of their own organisation's schools, and
  can run it for those schools only. A **Teacher** does not see it. If you were
  already signed in when your role gained the button, **sign out and sign back
  in**: your sign-in keeps the permissions it started with for up to an hour.
  See [Staff accounts and roles](/admin-guide/staff-and-roles#syncing-who-can-do-it).
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

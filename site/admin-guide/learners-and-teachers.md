---
title: Add learners and teachers
description: How to add one learner or one teacher at a time, or many from a spreadsheet, every column of the learner sheet, the rules that refuse a row, the Sync Students and Sync Teachers steps, and the Manage menu to edit, move, reset, disable, remove or delete an account.
---

# Add learners and teachers

*Written for the admin as of [`edtech-lms-ui` d0ba85c](https://github.com/edtech4good/edtech-lms-ui/commit/d0ba85c) and the central server as of [`edtech-lms-api` 9654979](https://github.com/edtech4good/edtech-lms-api/commit/9654979), checked on 31 Oct 2026. The **Add one learner** section was checked against
[`edtech-lms-ui` 206b525](https://github.com/edtech4good/edtech-lms-ui/commit/206b525) and
[`edtech-lms-api` c4f9a8a](https://github.com/edtech4good/edtech-lms-api/commit/c4f9a8a)
on 8 Nov 2026. The **Add one teacher** and **Manage** sections were checked against
[`edtech-lms-ui` 0b4bf9e](https://github.com/edtech4good/edtech-lms-ui/commit/0b4bf9e) and
[`edtech-lms-api` 33c357a](https://github.com/edtech4good/edtech-lms-api/commit/33c357a)
on 9 Nov 2026. The **Move**, **Remove** and **Delete** sections were checked against
[`edtech-lms-ui` b7e40de](https://github.com/edtech4good/edtech-lms-ui/commit/b7e40de) and
[`edtech-lms-api` 19784dc](https://github.com/edtech4good/edtech-lms-api/commit/19784dc)
on 11 Nov 2026.*

You can add **one learner or one teacher at a time** with a form, or add **many
people at once** by uploading a **CSV file**, one row per person. A CSV is a
plain spreadsheet export: in Excel or Google Sheets choose *Save as* or
*Download* and pick CSV. There are two uploads, because they make different
things:

- **Upload Users**, on the **Learners** page, creates **learners**.
- **Upload Teachers**, on the **Teachers** page, creates **teacher logins**.

An upload only creates the accounts in the admin. For learners to sign in to the
learning app, a second step, **Sync Students**, copies them to the learner
server. Skipping it is the most common reason a new learner "cannot log in".
The form for one learner sends that learner to the learner server as soon as you
save, so it usually needs no second step. See [Add one learner](#add-one-learner).
Teachers have a step of their own, **Sync Teachers**; see
[Add one teacher](#add-one-teacher) and [Sync Teachers](#sync-teachers).

Once an account exists, each row on the Learners and Teachers lists has a
**Manage** menu to change it. See
[Manage a learner or a teacher](#manage-a-learner-or-a-teacher).

## Before you start

You need:

- the **school** the people belong to, already created under
  **People › Schools**, and attached to at least one curriculum;
- for learners, a **class** under **People › Classes** (a class is required for
  every learner row that is not a teacher);
- an account that is allowed to upload or add: Organisation Admin, Admin or Super
  Admin. If **Add learner**, **Upload Users**, **+ Add teacher** or **Upload Teachers** is greyed out, you are
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
  again, unless the learner was taken away with
  [Remove](#remove-learners-who-have-never-signed-in).
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

Above them, one line says whether the learner can sign in yet. It starts with the
learner's name, shown here as [Name]:

- *[Name] can sign in now with these details.* The learner was copied to the
  learner server as soon as you saved. Nothing more is needed.
- *[Name] can't sign in yet. The account was saved, but the learning server did
  not answer. Run Sync Students for this school on the Schools screen.* The
  learner is saved in the admin, but the learning server did not answer. Run
  [Sync Students](#sync-students) for the school.
- *[Name] can't sign in yet. Saved, but the learning server doesn't have this
  class or curriculum yet. Run Sync Content, then Sync Students for this
  school.* The learner is saved, but the learning server refused the learner
  because it does not have the learner's class or curriculum yet. Run
  [Sync Content](/admin-guide/publish-and-sync#sync-content) first, then Sync
  Students.
- *[Name] can sign in once the learning server next syncs.* The learner is saved
  and will be picked up at the learning server's next sync. You see this line
  only when no learning server is connected to the admin. Learners for a
  classroom server reach it by file instead; see **Download Students** in
  [Sync Students](#sync-students).

A learner added with this form is recorded as **online**. See the note about `type` under
[The learner sheet](#the-learner-sheet).

::: tip Run Sync Content first
The learner's school and class must already be on the learning server, or it
refuses the learner and nothing is saved there. The curriculum is not required
on the learning server. If you have just created the school or the class, run
[Sync Content](/admin-guide/publish-and-sync#sync-content) first, and only then
add the learner.
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
  later deleted. The one exception is a learner taken away with
  [Remove](#remove-learners-who-have-never-signed-in), whose username is free
  again. A short code for your school at the front (`pp3anna`) avoids
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

To change a password later, use **Reset password** in the row's
[Manage menu](#manage-a-learner-or-a-teacher), and hand the new one over the same
way.

### Teachers in the learner sheet

A row with `is_teacher_acc` set to `1` becomes a **teacher account in the
learning app**: the learner list shows `True` in its **Is Teacher** column, the
row does not need a class, and it is recorded as an online account. This is how
a teacher is made who signs in to the learner server.

## Add one teacher

Use this when you have a teacher or two to add. For a school's whole staff list,
use the sheet in [Add teacher logins from a sheet](#add-teacher-logins-from-a-sheet).
A teacher added here is a login for the learning app: a username, a password and
a school, and nothing else.

1. Go to **People › Teachers**.
2. Choose **+ Add teacher**, next to **Upload Teachers**. A form opens at the
   right of the page. The button is greyed out in the same cases as **Upload
   Teachers**.
3. Fill in the form (the fields are below) and choose **Add teacher**. The button
   reads **Adding…** while it saves.
4. A panel headed **Teacher added** shows the username and the password. Copy or
   write them down, then choose **Done**.

### The teacher fields

A star in the form marks a required field.

- **Username** (required). 2 to 16 English letters or numbers. The form checks it
  as you type, and a line under the field says *Available. Teachers use this to
  sign in on the app.* or *That username is taken.* If the characters or the
  length are not allowed you see *Use 2 to 16 English letters or numbers.* The
  same rules apply as for a learner: a username counts as taken **whatever its
  capital letters**, and a name that any organisation has used for a learner or a
  teacher, even one since deleted, cannot be used again.
- **Password** (required). 8 to 32 characters with at least one letter and one
  number, and no spaces. If it is wrong you see *Use 8 to 32 characters with at
  least one letter and one number, and no spaces.* **Generate** and **Show**
  (then **Hide**) work as in the learner form.
- **School** (required). Choose from the list. If you have only one school it is
  already chosen. If the schools cannot be loaded you see *The schools couldn't
  be loaded.* and a **Try again** link. If you leave it empty you see *Choose a
  school.*

If you close the form after typing something, you are asked **Discard this
teacher?** with *This teacher hasn't been added yet.* Choose **Discard**, or
**Keep editing** to go back.

### After you choose Add teacher

If the server refuses something, the message appears under the field it belongs
to, or at the top of the form. If the form says *Some of the information isn't
valid. Check the form and try again.*, read each field's message and fix it.
Other messages you may meet at the top of the form are *The teacher couldn't be
added. Try again.*, *You don't have permission to add teachers.* and *That school
no longer exists. Close this and try again.*

The **Teacher added** panel shows the **Username** and the **Password**, each
with a **Copy** button, and the line *Write it down or copy it now; it is not
shown again.* Take it at its word: once you choose **Done** or close the panel,
the password cannot be shown again. If a **Copy** button does not work you see
*The copy didn't work. Select the username and copy it by hand.* (or *password*),
and you can select the text and copy it yourself.

Above them, one line says whether the teacher can sign in yet. It starts with the
teacher's username, shown here as [Username]:

- *[Username] can sign in on the app now with these details.* The teacher was
  copied to the learner server as soon as you saved. Nothing more is needed.
- *[Username] can't sign in yet: the learning server did not answer. Run Sync
  Teachers for this school on the Schools screen.* The teacher is saved in the
  admin, but the learning server did not answer. Run
  [Sync Teachers](#sync-teachers) for the school.
- *[Username] can sign in once the learning server next syncs.* The teacher is
  saved and will be picked up at the learning server's next sync. You see this
  line only when no learning server is connected to the admin.

Give the username and password to the teacher in person or on a printed card, as
described under [Passwords](#passwords).

## Add teacher logins from a sheet

**Upload Teachers** is simpler than the learner sheet. It makes a login, nothing
else.

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

::: warning Teacher logins from a sheet reach the learner server only through Sync Teachers
**Sync Students sends learners only.** A login made with **Upload Teachers** stays
in the admin until you run **Sync Teachers** for the school. Until then the
teacher cannot sign in on the learner server. See
[Sync Teachers](#sync-teachers). The teacher account made through
`is_teacher_acc` in the learner sheet does travel with Sync Students.
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

## Sync Teachers

**Sync Teachers** is the teachers' counterpart of Sync Students. It sits beside
**Sync Students** on the school's row in **People › Schools**, with the same
confirm (**Sure to sync?**). It is described in full in
[Publish and sync](/admin-guide/publish-and-sync#sync-teachers). Run it after
**Upload Teachers**, and whenever a message in this section tells you to.

## Manage a learner or a teacher

Each row on **People › Learners** and **People › Teachers** has a **Manage ▾**
button in its **Actions** column. Choose it to open a short menu. The items you
see depend on your role: an item you are not allowed to use is not shown, and if
none is allowed there is no **Manage** button. An account that is disabled shows a
**Disabled** tag beside its username.

| List | Menu items |
|---|---|
| **Learners** | **Edit details**, **Move to another school**, **Reset password**, **Disable** (or **Enable**), and, for a learner who has never signed in, a divider and **Remove** |
| **Teachers** | **Reset password**, **Disable** (or **Enable**), then a divider and **Delete** |

**Edit details** and **Reset password** open a form at the right of the page.
**Move to another school** opens a form too. **Disable**, **Enable**, **Remove** and **Delete** ask first.

Most of these changes are sent to the learner server as soon as you save. The
message after saving says how that went. When it says the learning server did not
answer, the change is saved in the admin and is not lost: run the sync it names
for the school. **Remove** on a learner is different: it is refused unless the learning server confirms, so a removal is
never half done on one side. The messages are listed on
[When something is refused](/admin-guide/when-something-is-refused#saved-but-the-learning-server-did-not-answer).

### Edit details (learners)

**Edit details** changes one learner's details. It is the first item in a
learner's menu. The username and the school are shown but cannot be changed here.

1. Choose **Manage** on the learner's row, then **Edit details**. The form shows
   a placeholder while it loads. If it cannot load you see *The learner's details
   couldn't be loaded.* (or *That learner no longer exists. Close this and try
   again.*) and a **Close** button.
2. Change what you need. The fields are **First name** (required), **Last name**,
   **Gender** (required, **Female** or **Male**), **Date of birth**, **Class**
   (required, from the school's classes) and **Curriculum** (required, one or
   more of the school's curricula). Each has the rule and message it has in the
   [Add one learner](#the-fields) form. Leaving the curriculum empty gives
   *Choose at least one curriculum.*
3. Choose **Save**. The button reads **Saving…**.

If the learner's class or a curriculum has been deleted since, the form shows
*(no longer available)* and tells you what to do: *The current class is no longer
available. Choose another one to save.* or *A curriculum marked (no longer
available) must be removed before you save.* If the school's classes or
curricula cannot be loaded you see *This school's classes or curricula couldn't be
loaded.* and a **Try again** link.

If you close the form after changing something you are asked **Discard your
changes?** with *The changes to this learner's details haven't been saved.*
Choose **Discard**, or **Keep editing**.

After saving, the form closes, the list reloads and a message says how it went:

- **Success**: *[Name]'s details are saved.* The change is on the learner server.
- **Saved**: *The details were saved, but the learning server did not answer. Run
  Sync Students for this school on the Schools screen.* (or the message about a
  class or curriculum the learning server does not have yet; see
  [When something is refused](/admin-guide/when-something-is-refused#saved-but-the-learning-server-did-not-answer)).
- **Saved**: *Saved. The learning server gets the change at its next sync.* You
  see this only when no learning server is connected to the admin.

Other messages at the top of the form are *The details couldn't be saved. Try
again.* and *You don't have permission to edit learners.*

### Reset password (learners and teachers)

**Reset password** gives an account a new password. It is the second item in a
learner's menu, after **Edit details**, and the first in a teacher's.

1. Choose **Manage** on the row, then **Reset password**. The form shows the
   **Username**, which you cannot change.
2. Type a new **Password** or choose **Generate**. The rule is the one for new
   accounts: 8 to 32 characters with at least one letter and one number, and no
   spaces. **Show** (then **Hide**) lets you read it.
3. Choose **Save**. The button reads **Saving…**.

If the account is disabled, the form says *This account is disabled. It can't
sign in until you enable it.* You can still reset the password; the account stays
disabled.

A panel headed **Password changed** then shows the **Username** and the **New
password**, each with a **Copy** button, and the line *Write it down or copy it
now; it is not shown again.* As with a new account, once you choose **Done** or
close the panel the password cannot be shown again. Hand it over as described
under [Passwords](#passwords).

Above them, one line says what the change means for signing in. Here [Username]
is the account's username:

- *[Username] can sign in with the new password now. Anyone signed in with the old
  one has been signed out.* After a reset, **the old password stops working**,
  and a person who was signed in with it is signed out.
- *[Username] can sign in with the new password once you enable the account.
  Anyone signed in with the old one has been signed out.* The account is
  disabled.
- For a learner: *The old password still works on the learning server.* followed
  by the reason, such as *The password was saved, but the learning server did not
  answer. Run Sync Students for this school on the Schools screen.* For a teacher:
  *The learning server did not answer, so the old password still works there. Run
  Sync Teachers for this school on the Schools screen.* Until you run the sync, the
  person can still sign in with the **old** password.
- *The learning server gets the new password at its next sync.* You see this only
  when no learning server is connected to the admin.

Mistakes in the form appear under the field. Other messages at the top are *The
password couldn't be changed. Try again.*, *You don't have permission to reset
passwords.* and *That account no longer exists. Close this and try again.*

A learner who was signed in on the app when the password changed lands on the
sign-in screen. The app does not say why, so tell the learner their password was
changed.

### Disable and Enable (learners and teachers)

A disabled account cannot sign in. Its progress is kept, and the account stays in
its list with a **Disabled** tag. Use it instead of deleting an account whose
owner has progress.

1. Choose **Manage** on the row, then **Disable**. A box asks *Disable [Username]?
   They won't be able to sign in. Their progress is kept.* with **Disable** and
   **Cancel**.
2. Choose **Disable**. The row gets its **Disabled** tag, and a message says how it
   went.

To undo it, choose **Manage** and then **Enable**. The box asks *Enable
[Username]? They can sign in again.* with **Enable** and **Cancel**.

When the learning server was told, anyone signed in with the account is signed
out, and a learner who was signed in lands on the sign-in screen. The app does
not say why. Results a learner had queued while offline are kept on the device and
are sent when that learner signs in again; if the account stays disabled they
stay on the device.

The message after the change is one of these, with [Username] the account's
username:

- **Success**: *[Username] is disabled.* or *[Username] can sign in again.* The
  learner server has the change.
- **Saved**: *[Username] is disabled on central. …* (or *enabled*) followed by
  *The change was saved, but the learning server did not answer. Run Sync
  Students for this school on the Schools screen.* For a teacher the message is
  *[Username] is disabled on central, but the learning server did not answer. Run
  Sync Teachers for this school on the Schools screen.* The admin has the change
  and the learner server does not yet, so the person may still be able to sign
  in. Run the sync it names. ("Central" here means the admin's own records.)
- **Saved**: *[Username] is disabled. The learning server gets the change at its
  next sync.* You see this only when no learning server is connected to the admin.

### Move to another school (learners)

**Move to another school** puts one learner in another school of the same
organisation, with a class and curricula of that school. It is the second item in a
learner's menu, after **Edit details**, and you see it if you may edit learners.
A learner can be moved only to a school of its own organisation; a school of
another organisation is never offered.

If there is no other school to move to, the item is greyed out and its tooltip
reads *There is no other school to move to.*

1. Choose **Manage** on the learner's row, then **Move to another school**. A form
   opens at the right of the page, titled **Move [Username]**. Under the title it
   says *Past results move with the learner.* A placeholder shows while the form
   loads.
2. Choose the **School** (required). It lists the organisation's other schools, not
   the one the learner is in.
3. Choose the **Class** (required). It stays empty and greyed out until you choose
   a school, and it is emptied again if you change the school. It lists the new
   school's classes.
4. Choose the **Curricula** (required, one or more). It lists the curricula the new
   school has. The learner's current curricula that the new school also has are
   already chosen; add or remove as needed.
5. Choose **Move**. The button reads **Moving…** while it works. **Cancel**, **Close**,
   Escape or a click outside closes the form and changes nothing.

Under a field you may see *Choose a school.*, *Choose a class.* or *Choose at least
one curriculum.* If the school's classes or curricula cannot be read you see *This
school's classes or curricula couldn't be loaded.* with a **Try again** link, and
if the schools cannot be read, *The schools couldn't be loaded.* with a **Try
again** link. If the form cannot read the learner you see *The learner's details
couldn't be loaded.* (or *That learner no longer exists. Close this and try
again.*) and a **Close** button. The refusals that can come back after you choose
**Move** are listed on
[When something is refused](/admin-guide/when-something-is-refused#move-to-another-school).

**What changes.** The learner's school, class and curricula change. Nothing else
does: the name, username, password, and whether the account is disabled stay as
they were, and a disabled learner can be moved and stays disabled. **Past results
move with the learner.** They are not kept with the old school, and the school a
result was earned in is not recorded.

**What the learner sees.** When the learning server was told, the learner is signed
out and lands on the sign-in screen. The app does not say why, so tell the
learner. The learner signs in again to see the new school and class.

After a successful move the form closes, the list shows the new school and class,
and a message says how it went:

- **Success**: *Moved to [School]. The learner signs in again to see it.*
- **Moved**: *Moved, but the learning server did not answer. Run Sync Students for
  [School] on the Schools screen.* The move is saved in the admin and is not lost.
  This message stays on screen until you close it. Run **Sync Students** for the
  new school.
- **Moved**: *Moved, but the learning server doesn't have this class or curriculum
  yet. Run Sync Content, then Sync Students for [School].* Run them in that order.
- **Moved**: *Moved to [School]. No learner server is set up here, so nothing was
  pushed.* You see this only when no learning server is connected to the admin.

### Remove (learners who have never signed in)

**Remove** takes a learner's account away for good, and the username can be used
again. It is for a mistake, such as a wrong username or a learner added twice,
before the learner has ever used the app. It is the last item in a learner's menu,
below a divider and in red.

You see it only if your role may delete learners, and only on a row whose **Last
Login** is empty. For a learner who has signed in or has any progress, use
**Disable** instead; the account and its progress are kept.

1. Choose **Manage** on the row, then **Remove**. A box asks *Remove [Username]? This
   can't be undone. Only a learner who has never signed in can be removed.* with
   **Remove** and **Cancel**.
2. Choose **Remove**. The learner leaves the list and a success message says
   *Removed. The username [Username] can be used again.*

Before it removes anything, the admin checks that the learner has not signed in and
has no progress, here and on the learning server. If the check cannot be made, the
learner is not removed. A refused Remove shows one red message that stays until you
close it, and the learner stays in the list. The messages are on
[When something is refused](/admin-guide/when-something-is-refused#remove-a-learner).

The list's **Last Login** column comes from the learning server. If the admin cannot
reach it, every row can show an empty **Last Login**, so **Remove** appears on
learners who have signed in. The admin still checks, and refuses those.

### Delete (teachers)

**Delete** is the last item in a teacher's menu, below a divider and in red. It
asks **Sure to delete?** with **OK** and **Cancel**; choose **OK** to go on. The
teacher leaves the list. Deleting a teacher is sent to the learner server at once,
so the teacher can no longer sign in, and a message says how it went:

- **Success**: *Deleted. The teacher can no longer sign in.*
- **Success**: *Deleted. No learner server is set up here, so nothing was pushed.*
  You see this only when no learning server is connected to the admin.
- **Deleted**: *Deleted, but the learning server did not answer. Run Sync Teachers
  for this school on the Schools screen.* The teacher is deleted in the admin and
  is not lost, but the learner server was not told, so the teacher may still sign
  in. This message stays on screen until you close it. Run **Sync Teachers** for the
  school.
- **Success**: *Teacher deleted.* You may see this plain line if the admin and the
  server it talks to are not up to date with each other. It does not say whether
  the learner server was told: run **Sync Teachers** for the school to be sure.

To stop a teacher signing in but keep the account, use **Disable** instead. A
teacher's username cannot be used again after a Delete. A learner's menu has no
Delete: use **Disable**, or **Remove** for a learner who never signed in.

## Change learners already added

To change one learner, use **Edit details** in the
[Manage menu](#manage-a-learner-or-a-teacher). To change many at once, **download**
them as a sheet, change it, and **upload** it back.

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

A learner stays in a school of its own organisation. If you change `schoolname`
to a school of another organisation, that row is refused with *Choose a school of
the learner's own organisation.* To move one learner to another school of the same
organisation, use [Move to another school](#move-to-another-school-learners)
instead.

Edits reach the admin at once and the learner server at the next **Sync
Students**.

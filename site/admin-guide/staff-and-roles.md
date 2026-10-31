---
title: Staff accounts and roles
description: How to add a staff account to the admin, which roles you can give, what each role can and cannot do, and who can run Sync Content and Sync Students today.
---

# Staff accounts and roles

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

A **staff account** is a login to the admin: an email address, a password and one
or more **roles**. The role decides what the account can see and change. This
page covers adding staff, the roles and what each allows, and who can sync.

Staff accounts are not learners and not teacher logins. Learners and teachers
sign in to the learning app, and you add them from a sheet. See
[Add learners and teachers](/admin-guide/learners-and-teachers). The word
*Teacher* turns up in both places. A **teacher login** belongs to a person who
uses the learning app. The **Teacher role** below is a way to sign in to the
admin with read-only access.

## Who can add staff accounts

In the version this guide was checked against, **an Organisation Admin** can add,
change and delete the staff accounts of its own organisation. An Admin or a
Teacher account cannot: it has no **Staff accounts** entry in the menu. The
people who run the server can add staff for any organisation.

An account only ever sees the staff of its own organisation.

## Add a staff account

1. Go to **Administration › Staff accounts**. The list shows each account's
   **Email** and **Roles**.

   ![The Staff accounts list with three accounts: an Organisation Admin, an Admin and a Teacher, each with Delete and Edit buttons.](/admin-guide/staff-list.png)

2. Choose **Create**.
3. Type the **User Email**. This is the address the person signs in with.
4. Type a **User Password**. The box shows what you type, so nobody should be
   looking over your shoulder. The password follows the staff rule on
   [Signing in and finding your way](/admin-guide/signing-in#the-staff-password-rule).
   Give the person the password privately.
5. Leave **Country** and **School** empty.
6. Tick one or more **User Roles**.
7. Choose **Submit**. You see **User created sucessfully** (misspelled on
   screen) and the account is in the list. It can sign in straight away.

![The new staff account form: User Email, User Password, Country, School and a User Roles tick box for Organisation Admin.](/admin-guide/staff-form.png)

### What the form refuses

The refusals appear under the field they belong to.

| You see | What it means |
|---|---|
| Enter the email address. / Enter a password. / Choose at least one role. | A required part was left empty. |
| Enter an email address of at most 45 characters. | The email is not a valid address, or it is longer than 45 characters. The same sentence covers both. |
| Use 8 to 50 characters with an uppercase letter, a lowercase letter and a number, and no spaces. | The password breaks the staff rule. |
| That email is already registered. | An account already has this address. A deleted account keeps its address, so a deleted person's email cannot be used again. |
| You can't give a role that has more access than your own. | You ticked a role you are not allowed to give. See [Which roles you can give](#which-roles-you-can-give). |
| You don't have permission to do that. | Your own role is not allowed to add staff. |

## Change or delete an account

- **Edit** opens the same form. Leave **User Password** empty to keep the
  current password. A success reads **User updated successfully**.
- **Delete** asks **Sure to delete?** and then shows **The user is deleted
  successfully**. The person can no longer sign in. You cannot delete your own
  account (*You can't delete your own account.*).
- If you change **your own** roles, the screen first asks **Changing your own
  roles signs you out. Continue?** and you sign in again afterwards.
- On an account that holds a role you could not give yourself, the roles you
  could not give again are marked with an asterisk (`*`) and the page notes
  *Roles marked \* can't be given back by you if you remove them.* On such an
  account the email and password boxes are locked, with the note *Only platform
  staff can change this person's sign-in details.*

## The roles

The role names are as they appear in the list. What each role allows is read
from the permissions the server gives it, grouped here by what you would want to
do.

**Organisation Admin**, **Admin** and **Teacher** can all:

- look at curricula, lessons, questions, media, assessments, schools, classes,
  teachers, subjects, tags, countries and feedback;
- open the Reports hub and download a report.

**Organisation Admin** and **Admin** can also:

- look at the Learners list and download a school's learners;
- add, change and delete content: curricula, grades, levels, lessons, questions,
  media and assessments;
- publish and retire a curriculum;
- add, change and delete schools, classes, subjects, tags and fees records;
- upload and edit learners and teacher logins.

Only **Organisation Admin** can:

- add, change and delete staff accounts;
- see the **Roles** list.

Today, of the three, only **Admin** can run **Sync Content**.

**Teacher** can do nothing beyond the first list.

Today nobody who works inside an organisation can run **Sync Students**, or add
or change a country or an organisation. Notes on those.

- **Organisations** are for **the people who run the server**. They use a
  platform account that belongs to no organisation, can act as any
  organisation, and is not something an organisation's staff can be given.
- Today the admin shows **Sync Students** only to the people who run the
  server; a change is in progress (see [Syncing](#syncing-who-can-do-it-today) below).
- **Countries** can be changed only by that platform account too. An Admin is
  shown the buttons and refused when it uses them. See
  [Set up your organisation](/admin-guide/organisation-setup#countries).

### The three roles in a sentence each

- **Organisation Admin** runs one organisation. It can do everything an Admin
  can except sync content, and in addition manages staff accounts. It is the
  role to give the person in charge of the organisation's setup.
- **Admin** builds and publishes content and manages schools, learners and
  teachers. It cannot manage staff, and it can run **Sync Content**.
- **Teacher** is a read-only login. It can look at content, schools and reports
  and change nothing. A Teacher account cannot list learners, so on report pages
  that have a learner picker it sees *You don't have permission to do that.* and
  the learner list stays empty. The report tables still load.

A fourth role, **Super Admin**, belongs to the platform account described above.
It is never offered to an organisation's staff.

### Which roles you can give

You can only give a role that has **no more access than you have yourself**, and
only a role the admin lists for your account. In the version this guide was
checked against, an Organisation Admin is offered **one** role on the form,
**Organisation Admin**. The Admin and Teacher roles cannot be given by an
Organisation Admin. If you need an Admin or a Teacher staff account for your
organisation, ask the people who run the server to add it.

The **Roles** page (**Administration › Roles**) lists the roles your account can
give. Roles are shared by every organisation and are changed only by the
platform account, so you cannot create, edit or delete a role.

## Syncing: who can do it today

Two jobs copy your work to the learner server. They are described in
[Publish and sync](/admin-guide/publish-and-sync) and
[Add learners and teachers](/admin-guide/learners-and-teachers#sync-students).
Who can start them today:

| Job | Where | Who sees the button |
|---|---|---|
| **Sync Content** | A button at the top of the **Curriculum list** | An **Admin**, and the platform account once it has chosen your organisation |
| **Sync Students** | On a school's row in **People › Schools** | The people who run the server only |

An **Organisation Admin** sees neither button. Publishing a curriculum still
pushes it to the learner server by itself, so you rarely need **Sync Content**.
**Sync Students** is needed after every learner upload, so an Organisation Admin
asks the people who run the server to run it, naming the school.

A change that lets an Admin and an Organisation Admin sync their own
organisation is in progress. When it arrives, the buttons will appear for those
roles and this page and the two pages above will change with it.

## If you cannot see something

- **A menu entry is missing.** Your role is not allowed it. A role never shows
  what it cannot use. See [What a role changes](/admin-guide/signing-in#what-a-role-changes).
- **A platform account sees buttons greyed out.** Choose the organisation in
  the switcher first. See [The organisation switcher](/admin-guide/signing-in#the-organisation-switcher).
- **You were signed out right after someone used your account.** One account
  works in one place at a time. See
  [One session per account](/admin-guide/signing-in#one-session-per-account).

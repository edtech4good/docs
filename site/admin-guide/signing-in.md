---
title: Signing in and finding your way
description: Signing in to the admin with your email, the staff password rule, why signing in somewhere else signs you out, and how the menu, breadcrumbs and your role fit together.
---

# Signing in and finding your way

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

## Sign in

Open the admin's address in your browser. If you are not signed in you land on
the **Sign in** page.

![The Sign in page: a card headed Sign in, with Email and Password fields, a Forgot password link and a Sign in button.](/admin-guide/sign-in.png)

1. Type your **staff email address** in *Email*.
2. Type your password in *Password*. **Show** lets you check what you typed.
3. Choose **Sign in**.

You land on **Home**. Learners and teachers do not sign in here: the page says
"Learners and teachers use the learning app, not this console."

If you have forgotten your password, choose **Forgot password?**, type your
email, and choose **Send reset link**. The email contains a link to a *Change
password* page. After you choose a new password you sign in with it.

### If sign-in does not work

| What you see | What it means |
|---|---|
| Enter your email. / Enter your password. | A field was left empty. |
| The email or password is incorrect. | One of them is wrong. The page does not say which. |
| Too many sign-in attempts. Wait a minute and try again. | Sign-in allows 10 attempts a minute from one network address, so staff in the same office share the limit. Wait, then try once more. |
| Can't reach the server. Check your connection and try again. | Your browser could not reach the admin's server. |
| Sign-in isn't available right now. Try again in a moment. | The server answered with a fault. |
| This link is invalid or has expired. | The emailed link has been used or is too old. Ask for a new one. |

More detail on each message is on
[When something is refused](/admin-guide/when-something-is-refused).

## The staff password rule

A password for a staff account must:

- be **8 to 50 characters** long;
- contain at least **one capital letter**, **one small letter** and **one
  digit**;
- contain **no spaces**;
- not be one of the two commonly guessed passwords the server blocks by name.

The rule is checked by the server when an account is created or a password is
changed. If a password fails, the server answers with one long sentence that
lists the whole rule. That sentence says "Maximum length 100". The server in
fact refuses anything over 50.

This rule is for **staff** passwords only. Learner and teacher passwords follow
a different, simpler rule: see
[Add learners and teachers](/admin-guide/learners-and-teachers#the-learner-sheet).

## One session per account

An account can be signed in in **one place at a time**. When you sign in on a
second browser, a second computer or a phone, the first one is signed out.

The next time the first browser asks the server for anything, it shows

> Your session ended. Sign in again.

and returns to the Sign in page.

![The Sign in page with the notice "Your session ended. Sign in again." in the top right corner.](/admin-guide/session-ended.png)

Anything you had not yet saved when it happened is not saved.

Two things follow from this:

- **Do not share one staff account** between two people. Each person signs the
  other out.
- **A blank or signed-out screen straight after someone else used the same
  account is normal.** Sign in again.

A sign-in is kept alive quietly in the background and ends on its own after a
while, one day by default. The people who run your deployment can change that.

## Finding your way

After you sign in, the admin looks like this.

![The admin's menu, down the left of the Home page. It lists Home, Content, People and Reports and settings, with the organisation's name at the top and the signed-in account at the bottom.](/admin-guide/home-menu.png)

### The menu

The menu on the left is grouped by what you are doing. You only see the entries
your role allows, so your menu may be shorter than the one below.

- **Home**, above the groups: the page you land on.
- **Platform**, only for the platform's own accounts: **Organisations**.
- **Content**, for building what learners study: **Curricula** (which opens into
  Curriculum list, Grades, Levels, Lessons and Map), **Questions**, **Media**
  and **Assessments**. Publishing is on the Curriculum list.
- **People**, for who the learners and teachers are and where they belong:
  **Schools**, **Classes**, **Learners** and **Teachers**.
- **Reports and settings**: **Reports**, the reports hub.
- **Administration**, at the bottom, opens into Staff accounts, Roles,
  Subjects, Countries, Question tags, Media tags and Feedback.

The five entries under **Curricula** are temporary. A single curriculum
workspace is planned to replace them, and this guide will change when it does.

### The top and bottom of the menu

- **The organisation tile** at the top shows which organisation you are working
  in, with its short name in the square. For an organisation's own staff it only
  tells you where you are.
- **Your account** at the bottom shows your name and email. Choose it to open a
  small menu with **Sign out**.
- The button next to the logo collapses the menu to icons and brings it back.

### Home and breadcrumbs

**Home** is where you start. For an account allowed to see the reach figures it
opens on a summary chart; other accounts get a default page.

Above each page, **breadcrumbs** show where you are, for example
*People › Learners*. The first part is the menu group, the last part is the page
you are on. Earlier parts that are links take you back up one level.

### The organisation switcher

Your organisation's staff accounts belong to **one** organisation, so there is
nothing to switch. The tile just names it.

The platform's own accounts are different. Their tile at the top is a **switcher**:
it opens a list with **All organisations** (the *platform view*, which reads
across everything) and each organisation by name. Choosing one makes the
account act as that organisation. Several steps in this guide, such as publishing
and Sync Content, only work for a platform account once it has chosen an
organisation. If you are doing this for an organisation, choose it
first.

![The organisation switcher open, listing All organisations, Example Company and Example Network.](/admin-guide/org-switcher.png)

## What a role changes

Your **role** decides which entries appear in the menu and which buttons appear
on a page. A button you are not allowed to use is simply not shown, and if
something reaches the server that your role does not allow, the answer is
"You don't have permission to do that."

- **Organisation Admin** is the person who runs one organisation. It sees
  everything in the menu for that organisation, including **Staff accounts** and
  **Roles**, and can publish and retire curricula and upload learners and
  teachers. It does not see **Sync Content** or the **Sync Students** button,
  and can only view Countries.
- **Admin** is a trusted member of an organisation's staff. It has the same
  content and people menus, but no **Staff accounts** or **Roles**. It sees
  **Sync Content** and can manage Countries.
- **Teacher** is a read-only staff login: it can look at curricula, schools and
  reports and change none of them. Teachers themselves use the learning app, not
  this admin.
- **Super Admin** is for the people who run the deployment. It is a platform
  account with no organisation of its own. It sees the **Platform** group and
  the switcher, and can act as any organisation.

An account can hold more than one role. The menu shows what any one of its
roles allows.

---
title: Reports
description: The Reports hub, the programme dashboards, the learner reports for offline and online schools and the sync record, with what each number means, where it comes from, and what an empty report tells you.
---

# Reports

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

Reports tell you how many people you have added, how far through the content
learners are, and how often they use the app. Before you read any number, it
helps to know where it comes from, because two of the three sources are not the
admin itself.

## Where the numbers come from

| Report | Comes from | Fills in when |
|---|---|---|
| **Reach** (Home) and **Reach by school** | The records in the admin: the schools, learners and teachers you added | As soon as you add them |
| **Fees collection** | Figures typed by staff on a school's **Fees Collection** page | When someone types them |
| **Tech downtime** | The reports submitted from the learning app, listed under **Administration › Feedback** | When learners or teachers send feedback |
| **Learners, online schools** | The learner server (the one the learning app signs in to), asked live each time you open the report | As learners use the app |
| **Learners, offline schools**, **Impact** and **Sync record** | The central server's own copy of classroom activity, which classroom servers send up to it | Only when a classroom server's activity file has been uploaded to the central server |

Two facts about the marks are worth knowing.

- **The app reports its own marks.** The learner's tablet or phone judges each
  answer and sends the result up. The server records what it is told.
  A deployment can switch on a server-side check; ask the people who run yours
  whether it has. See [Lessons and question types](/reference/lessons-and-question-types).
- **The offline-school reports depend on an upload.** A classroom server holds
  its learners' progress on its own. It reaches the central server, and so these
  reports, only when that activity is uploaded, and not every deployment does
  that. If nobody uploads it, the offline reports, **Impact** and **Sync record**
  stay empty however much the learners have done. That is not a fault in your
  data. Ask whoever runs the deployment whether the upload is in use. It is
  described on [Classroom to cloud sync](/architecture/sync).

## The Reports hub

Choose **Reports** in the menu (under **Reports and settings**). The hub is a page
of link cards in four groups.

![The Reports hub: a Programme group (Reach by school, Impact, Fees collection, Tech downtime), a group for offline schools and one for online schools, each with Quiz scores, Current level, Active status and Level quiz, and a Sync record group.](/admin-guide/reports-hub.png)

- **Programme**: dashboards for the whole organisation.
- **Learners, offline schools** and **Learners, online schools**: the same four
  reports twice. Use the group that matches how the school's learners reach the
  app (see [the overview](/admin-guide/#online-and-offline-schools)).
- **Sync record**: when schools last sent their activity.

A card appears only if your role allows it, and a whole group is hidden when none
of its cards are allowed. **Reach** is not in the hub because it is **Home**.
Organisation Admin, Admin and Teacher accounts can all open every report, but a
Teacher account has limits, below.

## Programme dashboards

### Reach

**Reach** is the first thing you see after you sign in, under the title *Plus
Snapshot*. Choose **Home** to come back to it.

![The Reach dashboard, titled Plus Snapshot: country and year lists above a line chart of schools, students and teachers by month, with a legend headed Type.](/admin-guide/reach-dashboard.png)

- **The line chart** has one line each for **Schools**, **Students** and
  **Teachers**. Each point is how many of that kind had been added by the end of
  that month, so a line only ever rises. The two lists above it choose a
  **country** (or *All*) and a **year**.
- **Gender** counts learners as *girls* or *boys* from the gender column of
  the upload sheet. A learner with no gender is not counted in either.
- **Access** counts learners as *Online* or *Offline*, from the type recorded
  for each learner (see the note on `type` in
  [Add learners and teachers](/admin-guide/learners-and-teachers#the-learner-sheet)).
- **Disability** splits learners into *with disability*, *no disability* and
  *not collected*. *With disability* means at least one of the six questions was
  answered "a lot of difficulty" or "cannot do at all". Learners enrolled before
  the questions were asked count as *not collected*, never as *no disability*.
  See [Disability fields](/reference/disability-fields).

All of these count **what you have added**. None of them says anything about
whether anyone has opened the app.

### Reach by school

The same charts for one school. Choose the school in the list at the top. The
bars show the **Teachers** and **Students** you have added to it, and the Gender,
Access and Disability charts are for that school only.

### Impact

For each of your countries, two bars under *Time spent on app*:

- **Expected** is the **Expected Usage** you or the platform typed on the
  country. See [Set up your organisation](/admin-guide/organisation-setup#countries).
- **Actual** is worked out from the time the app has recorded learners using it
  over the last month, averaged per day and per learner.

Actual comes from the activity records on the central server, so it reads **0**
until classroom activity has been uploaded (see above). In this version Actual
and Expected may not be on the same scale; read Actual as a trend over time.

### Fees collection

Choose a country, a school and a month to see the **Community contribution**
for that school. **Download as Excel** saves the figures. They come from the two
numbers, **Expected** and **Actual**, that staff type on the school's **Fees
Collection** page (**People › Schools › Fees Collection**). Nothing here is collected by the admin, so an empty chart
means nobody has typed a figure for that month yet.

### Tech downtime

*Non-routine tech downtime* counts the problems reported through the app, one
bar for each area: **RPI** (the classroom server), **Router**, **Content**,
**Tablet**, **App** and **General**. An entry counts once for each area it
mentions. By default the chart covers the last month. The entries themselves
are under **Administration › Feedback**.

## The learner reports

Each of the four reports has an offline version and an online version. They look
the same and are titled the same, with *(online)* added to the online ones, so
check the title.

Every learner report has the same controls:

- **Filters** across the top, such as *Select countries*, *Select schools*,
  *Select class* and *Select students*. Each is a list you can type into.
- **Search** to run the report. On some reports it stays greyed until you have
  chosen what it needs, which is said below.
- **Download Excel** to save what you are looking at as a spreadsheet.

A learner's **Result** is **Pass** when they scored 80 percent or more and
**Redo** below that, on every report that shows one.

### Quiz scores

How each learner did in the quiz at the end of each lesson. **Student Quiz
Scores**, the first tab, shows one learner. You can narrow the list of learners
with the school and class first, but **Search** stays greyed until you have
chosen a **learner**.

| Column | Meaning |
|---|---|
| Curriculum, School, User ID, Class, Course, Level, Lesson | Where the lesson sits and who the learner is. *Course* is the grade (the track in the Company words). |
| Marks | Questions answered correctly out of the questions in the quiz, for example `7 / 10`. |
| Percentage | The same as a percentage. |
| Quiz Score | The points that attempt earned. |
| Result | **Pass** or **Redo**, as above. |
| Date | When that attempt started. |

There is one row for every lesson. A lesson the learner has not taken shows *N/A*
for the marks and the result, and 0 for the score. Where there are several attempts, the row shows the **first attempt that
passed**, or the **latest** one if none passed.

**Class Quiz Scores**, the second tab, shows the same columns for a whole class on
one lesson. Choose the school, class, course, level and lesson, then **Search**.

### Current level

One row per learner, showing the **furthest lesson quiz the learner has reached**
in the curriculum, with its **Score** (a percentage) and **Result**. A learner
who has not taken a quiz shows *N/A*.

### Active status

One row per learner.

![The Active status report: filters across the top, then a table of learners with Curriculum, Country, School Name, User ID, Class, Active, Total Usage and Last Login.](/admin-guide/active-status.png)

| Column | Meaning |
|---|---|
| Curriculum, Country, School Name, User ID, Class | Who the learner is. |
| Active | `true` if the learner signed in during the **last month**, otherwise `false`. |
| Total Usage (mins) | The minutes the app has recorded in use. The **Start** and **End** boxes narrow it to a range of dates. |
| Last Login | The latest sign-in the server has seen. Blank if there is none. |

A learner you have just added shows `false`, `0` and a blank *Last Login*. That
is correct: they have not signed in yet.

### Level quiz

Like Quiz scores, but for the quiz at the end of a **level** rather than a lesson.
There is one row per level, with **Marks**, **Percentage**, **Quiz Score**,
**Result** and **Date**. **Student Level Quiz** needs a learner chosen before
**Search** is available. **Class Level Quiz**, the second tab, is for a whole
class.

## Sync record

*Sync record* lists the activity files that classroom servers have sent to the
central server: **File Name**, **Country**, **School Name** and **Last Sync**.
Use it to see which schools have not sent anything lately.

Where the upload is not in use, the table says **No Data** and always will.

## When a report looks empty or odd

| What you see | What it means |
|---|---|
| **No Data** in a table | Nothing has reached this report yet. For the offline reports, **Impact** and **Sync record**, that usually means no classroom activity has been uploaded. For an online report, it means no matching learner activity yet. |
| **That school has no students yet.**, in red, as soon as you open **Quiz scores** or **Level quiz** | The page tries to load a default learner before you choose one, and cannot find it. The message does not mean your school is empty. Choose a school, class and learner, then **Search**. |
| **You don't have permission to do that.** when you open a learner report, with a Teacher account | The Teacher role cannot list learners, so the learner picker stays empty. The table still loads, but you cannot narrow it to one learner. |
| **Active** `false` and **0** minutes for everyone | Nobody has signed in during the last month, or the activity has not reached the server yet. |
| **The service is temporarily unavailable. Try again in a few minutes.** on an online report | The learner server could not be reached. Try again later. |

A platform account that has not chosen an organisation reads across every
organisation at once. Choose the organisation in the switcher first, so that the
figures are yours.

For other messages, see [When something is refused](/admin-guide/when-something-is-refused).

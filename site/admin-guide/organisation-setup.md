---
title: Set up your organisation
description: How to create and edit the schools, classes, subjects and tags your organisation is built from, what to create first, what a learner or teacher needs to exist beforehand, and why some saves seem to do nothing.
---

# Set up your organisation

*Written for the admin as of [`edtech-lms-ui` 183b4ac](https://github.com/edtech4good/edtech-lms-ui/commit/183b4ac), checked on 30 Oct 2026.*

Before you add a single learner, a handful of records have to exist: the
**schools**, the **classes** in them, the **countries** and **curricula** those
schools use, and, if you want them, **subjects** and **tags**. This page says
what each is for, how to add and change it, and what has to be in place first.

A company reads the words differently. The admin's menus say **School** and
**Class** for every organisation, a company's included. If yours is a company,
read "school" as "department" and "class" as "cohort". Nothing else changes.

## What to create, and in what order

| You want to add | These must exist first |
|---|---|
| A **learner** | A school that uses at least one curriculum, and a class in that school |
| A **teacher login** | A school |
| A **class** | A school |
| A **school** | A country linked to your organisation, and a curriculum linked to that country |
| A **curriculum** | A country linked to your organisation. A subject is optional |

So the usual order is:

1. **Countries.** You do not create these. They are already there, linked to
   your organisation by the people who run the server. See
   [Countries](#countries).
2. **Subjects**, if you want to group curricula by subject.
3. **A curriculum.** Building one is a separate job. For its **Country**, pick
   one of your countries: a school can only offer a curriculum that is linked to
   the school's country.
4. **Schools.**
5. **Classes.**
6. **Tags**, whenever you like. They are only labels.
7. Then [add learners and teachers](/admin-guide/learners-and-teachers).

## Schools

A school is where learners and teachers belong. Go to **People › Schools**.

![The Schools list, with each school's country and curricula and the buttons Delete, Download Students, Edit and Fees Collection.](/admin-guide/schools-list.png)

The columns are **School Name**, **Country**, **Curriculum** and **Tools**. The
magnifying glass beside *School Name* searches by name, and the funnel beside
*Country* and *Curriculum* filters. The buttons on a row are:

- **Delete**, **Edit**: described below.
- **Download Students**: a file of the school's learners, used to load a
  classroom server. See [Add learners and teachers](/admin-guide/learners-and-teachers#sync-students).
- **Fees Collection**: a place to record, for this school, two numbers typed by
  hand, **Expected** and **Actual**. The admin does not collect any money. It
  only keeps the figures you type in, and the
  [Fees collection](/admin-guide/reports#fees-collection) report draws on them.
- **Sync Students** is on this row too, for the platform's own accounts. See
  [Add learners and teachers](/admin-guide/learners-and-teachers#sync-students).

### Add a school

1. Choose **Create**, at the top right of the list.
2. Type the **School Name**.
3. Choose the **Country**.
4. Choose the **Curriculums**. The list only fills in **after** you have chosen
   the country, and it shows only the curricula that are linked to that country.
   You can choose more than one.
5. Choose **Submit**. You see **School created sucessfully** (the word
   "successfully" is misspelled on screen) and the school is in the list.

![The new-school form with a name, a country and a curriculum filled in.](/admin-guide/school-form.png)

The rules:

- **All three fields are required.** Left empty, each shows *Please enter
  school name!*, *Please select country* or *Please select curriculums*.
- **Use letters, digits and spaces only.** As you type, a symbol such as a full
  stop, comma, hyphen, ampersand or apostrophe shows the warning *Special
  characters are not allowed*, and **Submit** then answers **Invalid Input** and
  saves nothing.
- **Use a name that is not already in use.** If it is, the save does nothing.
  See [When a save does nothing](#when-a-save-does-nothing).
- **If your curriculum is missing from the list**, it is not linked to the
  country you chose. Edit the curriculum and give it that country.

### Change a school

Choose **Edit** on the row. The form has the same three fields plus **UI
theme**, **Kids** or **Corporate**, which chooses the look the learning app
shows that school's learners. Choose **Submit** to save.

### Delete a school

Choose **Delete** and confirm **Sure to delete?** with **OK**. A school that
still has learners cannot be deleted. The screen then says only *Some of the
information isn't valid.*, and the reason is that the school still has learners.
Move or remove the learners first. A deleted school's name can be used again.

## Classes

A class is a group of learners inside one school. Go to **People › Classes**.
The list shows **Class Name** and **School Name**, with a search for the class
name and a filter for the school.

To add one, choose **Create**, type the **Class Name**, choose the **School
Name**, and choose **Submit**. You see **Standard created successfully**. The
screen calls a class a "standard" in some messages; it is the same thing.

- Both fields are required (*Please enter class name!*, *Please select school*).
- **The name only has to be new inside its school.** Two schools can each have
  a "Class 4A".
- Keep to letters, digits, spaces and hyphens. A symbol such as a full stop
  shows *Special characters are not allowed*. For a class that warning does not
  stop the save, but keep the name plain anyway, because it appears in reports.
- **Edit** changes the name or moves the class to another school. **Delete**
  asks **Sure to delete?** and shows **Standard deleted sucessfully**.

::: warning Do not delete a class that has learners in it
The admin is meant to refuse this, with *That standard has students and can't
be deleted.* In the version this guide was checked against it does not: the
class is deleted even with learners in it. Check the Learners list first and
move the learners before you delete a class.
:::

## Subjects

A subject is a label you can give a curriculum, such as *Foundational Skills*.
It is optional, and it shows beside the curriculum in the Curriculum list. Go to
**Administration › Subjects**.

To add one, choose **Create**, fill in **Subject Name** and **Subject
Description**, and choose **Submit**. You see **Subject created sucessfully**.

- The name is **3 to 25** characters and the description **3 to 100**.
- **Fill in the description.** The form does not mark it as required, but a
  subject with an empty description is refused with *Some of the information
  isn't valid.*
- Names have to be new within your organisation.
- A subject that a curriculum uses cannot be deleted (*That subject is used by a
  curriculum and can't be deleted.*, which the screen reduces to *Some of the
  information isn't valid.*). Change the curriculum's subject first.

## Countries

A country is a place your organisation works in. Go to **Administration ›
Countries**. The list shows **Country Name** and **Expected Usage**.

**Countries are shared across the whole deployment, so you cannot add or change
one.** The people who run the server link a country to your organisation, and
you then see only your own countries. Your organisation's staff can view the
list. The **Create**, **Edit** and **Delete** buttons are not shown to an
Organisation Admin. An Admin account is shown them, but the server refuses
every one of them with *You don't have permission to do that.* If you need a
country that is not on the list, ask the people who run your deployment.

**Expected Usage** is a number of minutes: the time you hope learners spend in
the app. The [Impact](/admin-guide/reports#impact) report draws it as the
*Expected* bar. The list shows it as, for example, `30 min`. In this version
Actual and Expected may not be on the same scale; read Actual as a trend over
time.

## Question tags and media tags

Tags are short labels that help you find things later. There are two kinds,
each with its own list under **Administration**:

- **Question tags** are put on questions, on the **Questions** page, so that you
  can filter that page by tag.
- **Media tags** are put on files in the **Media** library, to filter that page.
  The page that lists them is headed *Document Tags*; it is the same thing.

![The Question tags list with one tag, easy, and its Delete and Edit buttons.](/admin-guide/question-tags.png)

To add one, choose **Create**, type the tag, and choose **Submit**. You see
**Question tag created sucessfully** or **Document tag created successfully**.

- **A tag is 3 to 8 letters and digits, nothing else.** No spaces, hyphens or
  underscores, so `two words` and `a-b-c` are refused.
- **Tags are saved in lower case.** `Easy` is stored as `easy`.
- A tag has to be new within your organisation.

## When a save does nothing

Two kinds of refusal on these forms give you almost no explanation. Both leave
you on the form with your typing still in it.

**A name that already exists shows no message at all.** You choose **Submit**
and nothing happens. This is the case for schools, classes, subjects and tags.
The server did answer, with *That school already exists.*, *That standard
already exists.*, *That subject already exists.*, *That question tag already
exists.* or *That document tag already exists.*, but the admin does not show it.
If a save does nothing, the name may already be in use; try a different name.

**Anything else the server refuses shows one general notice**: a red **Error**
saying *Some of the information isn't valid.* The notice does not say which
field. Check the form against the rules above:

| Form | The usual cause |
|---|---|
| School | A symbol in the name, or the name is over 300 characters |
| Class | The name is empty or over 300 characters |
| Subject | A name under 3 or over 25 characters, or a description that is empty, under 3 or over 100 characters |
| Question tag, media tag | A tag under 3 or over 8 characters, or anything that is not a letter or digit |
| Any delete | The record is still in use: a school with learners, or a subject used by a curriculum |

If a message is not here, see [When something is refused](/admin-guide/when-something-is-refused).

## Who can do what

- **Organisation Admin, Admin and Teacher** can see schools, classes, subjects,
  countries and tags.
- **Organisation Admin and Admin** can also add, change and delete schools,
  classes, subjects and tags.
- **Nobody inside an organisation** can add, change or delete a country. An
  Admin is shown the buttons and refused when it uses them.

A **platform** account has to choose your organisation in the switcher before it
can create any of these; otherwise it is asked to choose one. See
[Signing in and finding your way](/admin-guide/signing-in#the-organisation-switcher).

---
title: Two languages in content
description: How curriculum, lesson and question text is stored once and translated per language, how a changed source text makes a translation stale, and how the learner app shows the right one.
---

# Two languages in content

The learner app's *interface* has always been bilingual: every button and label
exists in English and Khmer and follows the learner's language setting. The
*content* is a different matter. A curriculum name, a lesson title, a question,
an answer option and a feedback message are each a single text column, so a
learner would see whatever the author typed. This page describes how content
text is translated without changing any of those columns.

## The model: one base text, many translations

Each organisation has a **content language**, `organisations.contentlanguage`.
The existing columns keep the text in that language, the *base text*. It is null
until the organisation has any translations, which means "show the base text".
The base language belongs to the organisation rather than the curriculum
because questions and documents are owned by the organisation and shared across
its curricula.

Every other language is a row in `contenttranslations`, on both the central and
the student database:

| Column | Meaning |
|---|---|
| `organisationid` | the owning organisation |
| `tablename`, `rowid` | the content row being translated (no foreign key: the parent is any of a fixed list of tables) |
| `field`, `subkey` | which text, and for text inside a question's JSON, which option, matching partner, distractor or feedback message (`''` when the field has none) |
| `language` | a language code, stored with its primary subtag in lower case (`km`, `en`) |
| `text` | the translated text |
| `sourcehash` | the sha-256 of the base text that was translated |
| `lastupdated` | when the row last changed |

A translation is unique per row, field, subkey and language, and is hard-deleted,
never soft-deleted, so a translation added again later does not collide with a
ghost.

What can be translated is a fixed allow-list of display text: names and
descriptions of curricula, grades, levels, lessons, learning items, plans,
practices and quizzes, and on a question its text, heading, option, matching and
distractor text and the correct and incorrect messages. Ids, orders, points,
statuses, file names and tags are not translated.

### Answer text is never translated

Some text is an answer key. Template 21 compares what the learner types with the
option text, on the device and on the server. The fill-in-the-blank templates (8
and 23) split `questiontext` on their blank markers. Translating those fields
could make the app and the server disagree about what is correct, so central
refuses to save a translation of them and the student API refuses a payload that
carries one. The ordering templates grade by sequence rather than text, so their
option text is display text and may be translated.

### Options keep their ids

A translation of an answer option is keyed by the option's id, so the id has to
survive an edit. Central keeps the option ids it is given and generates an id
only for a new option; the associate and distractor ids follow the same rule.

## A changed source makes a translation stale

When someone saves a translation, central stores the hash of the base text it
was translated from. When the base text changes later, the hashes no longer
match, and the translation is **stale**. The student API compares the hash on
every read and **leaves a stale translation out**, so a learner never sees an old
translation beside new source text. It also leaves out a translation whose base
text the response does not carry, one for an answer-bearing field, and any
translation in the organisation's own content language. The learner sees the
base text instead.

## How the text reaches the learner

Translations are content rows, so they travel with the content.

- **Central to student.** `contenttranslations` is the last table in the content
  payload, after every table it points at. A translation is published with its
  parent (see [publishing](/architecture/publishing)): a translation edit
  changes its own row's hash, so the curriculum shows as changed since publish,
  and in the merge a question's translations come from the same publication as
  the question. The payload is strict about this table: the student API refuses a
  payload that has translations but no content language, and an unknown table
  key, so central and the student API have to be upgraded in the right order
  (student API first, with no content sync in between).
- **Student to app.** The app sends `X-Content-Translations: 1` on its requests
  to the student API. With the header, every content row the learner routes list
  gains `translations`, grouped by language and keyed `field` or
  `field.subkey`, and the response root carries the organisation's
  `contentlanguage`. Without it a response is exactly what it was before
  translations existed, so older apps keep working. The header is on the CORS
  allow-list.
- **In the app.** Text is chosen where content enters the app, not screen by
  screen. The app picks the translation for the learner's interface language,
  falls back to the base text, and keeps a record of which language each string
  ended up in so a Khmer fallback inside an English interface is still set in
  the Khmer font. The cached responses carry both languages, so the choice works
  offline.

## Authoring

Central exposes `GET`, `PUT` and `DELETE /translations/:tablename/:rowid`. A save
sends the language and a map of field to text, central computes the hash,
refuses answer-bearing fields, and requires the permission and ownership of the
parent entity. The admin has a Translations drawer on the curriculum, grade,
level, lesson and question editors, an organisation setting for the content
language, and a map switch that shows untranslated and stale counts. Publishing
is never blocked by missing translations: the counts are information.

## Limits

- **Media is not per language.** The lesson video, question audio and images are
  single files. A learner can get Khmer titles over an English video, or the
  reverse, until a per-language document is added.
- **Orphaned translations are not cleaned up automatically.** Deleting a row or
  an option leaves its translations in the table. They are dropped from the
  content payload because their parent is missing.

## See also

- [Publishing](/architecture/publishing)
- [Learning items](/architecture/learning-items)
- [Khmer text](/reference/khmer-text)

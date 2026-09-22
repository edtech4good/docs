---
title: Lessons and question types
description: Eight question templates available for curriculum authoring, how lessons are structured, and what question types are ready, prototyped, or not yet implemented.
---

# Lessons and question types

The eight question types you can author today, and what the app does and does not do to sequence a learner through them.

## What you can build today

Eight question types are fully built, named clearly, and ready for a curriculum team to write against. Every question is one of these templates, and the template decides what the learner sees and how they answer.

| # | Type | What the learner does | Media |
|---|------|----------------------|-------|
| 1 | Multiple choice, one answer, text | Reads or listens to written options and taps the correct one. | Text, question audio, option audio |
| 2 | Multiple choice, one answer, pictures | Taps the correct picture from a set of images. | Image, question audio |
| 3 | Multiple choice, several answers, text | Selects every correct written option. | Text, question audio, option audio |
| 4 | Multiple choice, several answers, pictures | Selects every correct picture from a set of images. | Image, question audio |
| 5 | Put in order, text | Drags written items into sequence. Suits steps, events, sentence building. | Text, drag, question audio |
| 6 | Put in order, pictures | Drags images into sequence. Suits story order, life cycles, procedures. | Image, drag, question audio |
| 7 | Match or associate | Drags each item onto the target it belongs with. Suits pairing words to pictures, terms to meanings. | Drag, question audio, piece audio |
| 8 | Fill in the blanks | Supplies the missing piece of a sentence or expression. | Text, question audio |

### Audio comes with all eight

Every one of these can read its question aloud. That belongs to the question itself, so it works whichever template you pick, and it matters for learners who are not yet reading fluently. Audio on the individual answer options is narrower. It works on written options and on drag pieces, and it does not work on picture options.

## How a lesson fits together

A lesson is three lists on one screen. The learner taps whichever one they want.

| Activity | What it is | Retries | Results screen |
|----------|-----------|---------|----------------|
| Learning | Plays the video and records how much of it was watched. It carries no questions and produces no score. | none | no |
| Practice | A drill. The learner can attempt a question as many times as they like, and after two wrong attempts the app shows them the answer. Nothing here is graded. | unlimited | no |
| Quiz | The graded path. One attempt per question. | one attempt | yes, pass or fail at 50% |

**Nothing gates any of it.** Tapping an item records which one the learner picked and opens it. There is no lock, no prerequisite and no completion check in the lesson screen or in the code behind it, so a learner on a fresh tablet can open the quiz first and never watch the video. The three lists sit side by side with equal standing.

What separates practice from quiz is retries and grading, and both of those live inside the activity once it is already open. Neither one controls access to the other.

If the curriculum assumes a learner watches, then practices, then tests, that ordering is a classroom convention today and a teacher enforces it. The app has no opinion about it.

### Two things to know before planning any gating on results

**The pass mark on a lesson decides completion, and nothing else.** Every lesson carries a pass mark (`passing_points`, 80 on all current content; the authoring tool lets you set it per lesson). The classroom API marks a lesson complete when the learner's accumulated points reach it. Previously the app ignored the server's flag and demanded 100%. The 50% pass on the quiz results screen is still written into the app and the pass mark does not affect it.

### How a lesson earns its points

A lesson is worth `total_points` (100 on current content): learning 20, practice 40, quiz 40. Points are awarded for doing an activity, not for scoring well on it: a submitted quiz earns its 40 whether the learner got 3 of 10 or 10 of 10 (the score is stored separately as pass/fail at 80%). Learning points are awarded only when a video has been watched. Lessons whose learning item is a document (as in document-based curriculum) top out at 80 points, which is exactly the pass mark. This is why an earlier rule that required "more than 80%" left such lessons permanently incomplete. Whether documents should earn learning points is an open product decision.

The level and grade rollups still use a rule of "more than 80%".

**Marking happens on the tablet.** Each answer is judged right or wrong on the device, and the result travels up as a verdict. The server stores what it is told and never checks the answer itself. That suits tablets which spend the day off the network. It does mean every percentage in the progress tables is a figure the app reported about itself. Worth knowing if those numbers ever reach a donor report.

## Built, but not ready to hand to authors

Seven more question types are real, working screens, and the tablet will display them. The code is not the problem. Six of the seven carry no human-readable name, so an author choosing one sees "DOption1" in the dropdown with no description, and they sit in a folder marked prototypes. Someone needs to open each one, name it, and decide whether it earns a place in the curriculum.

| # | Name in the dropdown | What we know |
|---|---------------------|--------------|
| 18, 19, 20 | "DOption1", "DOption3", "DOption4" | Three variants of a picture-based option interaction where the learner works with a row of images. What separates the three is undocumented. The numbering skips 2, which suggests a fourth variant was designed and dropped. |
| 21, 22, 23 | "FOption1", "FOption2", "FOption4" | Three variants of fill in the blanks. The learner types an answer into the gap. What separates the three is undocumented. The numbering skips 3. |
| 24 | Fraction | A dedicated fraction interaction, the only math-specific one in the set and the only one of these seven with a real name. It is substantial enough to suggest it was built for a particular part of the numeracy curriculum. |

## On the authoring menu, but not supported

Nine more appear in the dropdown and can be saved against a question. The tablet has no screen for any of them, so the learner gets an error where the question should be. Nothing warns the author.

| # | Type |
|---|------|
| 9 | Question in text and audio, answers in audio |
| 10 | Question in text, answers in audio |
| 11 | Question in audio, answers in text. The classic listening comprehension shape. |
| 12 | Question in text, answers in pictures |
| 13 | Question in audio, answers in audio. Spoken throughout, with no reading required. |
| 14 | Question in text, answers in text |
| 15 | Question in pictures, answers in text |
| 16 | Question in pictures, answers in pictures |
| 17 | Question in audio, answers in pictures |

### Why these nine are worth a decision

Read together they form a grid, pairing how a question is asked (text, audio, picture) against how it is answered. That grid covers the designs that ask least of a learner's reading: a spoken question with picture answers asks for no literacy at all.

So the nine missing types are the most literacy-independent part of the design, planned and visible on the menu, and never built on the tablet. Whether that was a scope cut or an oversight is worth settling before a curriculum is planned around them.

---
title: Disability fields (Washington Group Short Set)
description: Six-domain disability fields collected at learner enrolment using the Washington Group Short Set instrument.
---

# Disability fields (Washington Group Short Set)

Disability disaggregation on student profiles, implemented at enrolment and carried through every report as a filter.

## The instrument: WG Short Set

Six domains, each answered on the same four-point scale:

| Column | Domain |
|--------|--------|
| `wg_seeing` | Seeing, even if wearing glasses |
| `wg_hearing` | Hearing, even if using a hearing aid |
| `wg_walking` | Walking or climbing steps |
| `wg_remembering` | Remembering or concentrating |
| `wg_selfcare` | Self-care (washing all over, dressing) |
| `wg_communicating` | Communicating in their usual language |

| Value | Meaning |
|-------|---------|
| 1 | No difficulty |
| 2 | Some difficulty |
| 3 | A lot of difficulty |
| 4 | Cannot do at all |
| NULL | **Not collected** |

**Chosen over the Child Functioning Module.** The WG/UNICEF Child Functioning Module (~13 domains) is the instrument the Washington Group actually recommends for under-18s and is better regarded by education funders. The Short Set was chosen: it is what "the Washington Group fields" is normally taken to mean, most funders accept it for yes/no disaggregation, and it keeps the enrolment interview short. Revisit if a funder asks for CFM. Note that switching instruments does not backfill either, so it is a decision per cohort, not per release.

## Two rules that are easy to get wrong later

**NULL is not "no difficulty".** A learner nobody asked is not a learner without difficulty. Folding the two together overstates the denominator of every disaggregated report. `GET /report/disability` therefore returns three buckets: `with disability`, `no disability`, `not collected`. The third is not cosmetic: at the start every learner is in it.

**The cutoff is ≥ 3, and it is not ours to choose.** A learner counts as having a disability when at least one domain is coded 3 or 4. This is the Washington Group's own threshold. Any other threshold still produces a number; it just isn't comparable to anybody else's, which defeats the purpose of using a standard instrument.

## Provenance

`wg_source` (1 = staff-reported, 2 = self-reported) and `wg_collected_at` record who supplied the answers and when. Today everything is staff-entered. When learners can fill these in on their own profile, a self-report supersedes a staff estimate rather than silently overwriting it, and the distinction is worth having on record if a funder asks who assessed whom.

That does **not** require self-registration. Learners already have accounts (`schoolusers`) and already log in; what is missing is letting an authenticated learner edit their own profile. That is a far smaller and safer piece of work than account creation, and it is the one that delivers self-reported answers. See [Authorization model](/architecture/authorization).

`wg_collected_at` is stamped only when an answer actually changes. Editing a learner's city does not make it look like the enrolment interview was repeated today.

## Collecting the answers

Enrolment is CSV bulk upload through the admin UI (there is no per-student create form). The six columns are optional in the template ([user-upload.csv](https://github.com/edtech4good/edtech-lms-api/blob/main/assets/user-upload.csv)), in the API validators, and in the admin UI's client-side joi mirror ([validator.service.ts](https://github.com/edtech4good/edtech-lms-ui/blob/main/src/app/services/validator.service.ts)). joi rejects unknown keys, so a roster carrying these columns fails in the browser unless they are declared there too. Rosters without the columns keep working unchanged.

A blank answer on an edit leaves the stored value alone rather than erasing it, so a CSV round-trip that drops the columns cannot silently wipe collected data.

## Reading the numbers

`GET /report/disability` backs a pie on reach dashboards (`/dashboard/index` and `/dashboard/school`), alongside the existing Gender and Access charts.

The two real categories wear the brand green and orange; **"not collected" is deliberately gray**. That bucket is missing data, not a kind of learner, and a categorical hue would read as a third group of people. At the start the chart is a single gray circle, which is the honest picture and the reason the bucket exists.

## Open

- **Who answers.** Staff-entered today, which is not what the instrument validates. The WG questions are designed to be self- or caregiver-reported. Worth settling alongside other design decisions.
- **The Pi mirror is untested.** The columns and the sync column list are in `edtech-lms-rpi-api`, but deployment scenarios vary, so nothing may exercise that path. It landed anyway: the sync copies students with an explicit column list, and a `edtech-lms-rpi-api` missing these columns would drop disability data silently.

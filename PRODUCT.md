# MediTrack

MediTrack is an English-language clinical documentation and research application for pilonidal sinus disease. It supports a medical doctoral project supervised by Prof. Dr. Dr. Doll. The researcher needs readable, compact code and a documented explanation of data flows. Technical progress does not establish clinical validity or approval for production research.

## Users and tasks

Clinicians document their own cases: baseline characteristics, an initial operation, further operations, follow-ups and patient-reported outcomes (PROMs). Administrators are intended to read all cases, without creating or changing clinical records. Dashboard, case views and analysis use authentication claims, never editable profile roles. Admins can see recorder identity; regular users cannot read other profiles. Local candidate rules enforce this, but the deployed July2025 rules have independently confirmed ownership/admin-write flaws. The corrected candidate is NOT deployed; publication requires user approval.

## Data and environments

SvelteKit, TypeScript and Firebase Authentication/Firestore are the existing stack. Baseline and initial operation share the parent patient document; later operations, follow-ups and PROMs are subcollections. This distinction must be retained when reading and analysing records. New documentation numbers count additional operations separately from the initial operation.

Local development uses the isolated demo-meditrack Auth and Firestore emulators, with a visible test banner. Missing emulators must fail rather than fall back to production. Published primary-source individual case facts may be used as explicitly identified local fixtures, retaining DOI, original case identifier, source locator, missingness and quality notes. Unreported facts are not invented. Synthetic disposable test records are marked and excluded from analysis; remove them after testing. No production migrations, rule deployment or patient changes without user approval.

## Analysis surface — /analysis

Purpose: inspect accessible cases, completeness and descriptive summaries while developing the research instrument. It is not a causal model, treatment recommendation, inferential study or representative cohort analysis.

- Dataset selector separates published literature cases from regularly entered records; a DOI selector narrows literature sources. Synthetic/excluded cases are omitted.
- Normal users read only their own accessible records. An existing admin custom claim permits the full set allowed by database rules. The interface cannot expand those permissions.
- Patient-level summaries show available and missing/invalid counts, median and range for reported age (or age at initial operation), BMI and reported index-procedure healing intervals. Distinct age references and healing definitions are disclosed.
- Initial/index procedure counts retain source labels; later operations are counted separately. Documentation counts are records, not independent patients. No recurrence rates or risk-factor/efficacy comparisons are calculated.
- Source links and case-level quality notes remain inspectable. Failure to load any required subcollection produces an error rather than a misleading zero.
- New PROM responses use explicit input and version 2; unanswered numeric fields remain null, deliberate zero is retained. Legacy scores with uncertain defaults are not pooled with explicit responses. New assessments require a stable operation ID and actual assessment date. Working outcome definitions v1 separate persistent disease from recurrence after complete healing; historical records remain unlinked and unchanged. The questions remain exploratory, not a validated questionnaire.

## Product and design boundaries

Use the established DESIGN.md system: neutral off-white, dark native system typography, restrained green, fine rules and English native controls. No redesign or decorative motion is needed for the analysis extension. Desktop and narrow screens must preserve denominators, provenance, missing values and clear navigation. A wide statistics table may scroll within its own keyboard-accessible region, without causing whole-page overflow.

The scientific question, endpoints, PROM instruments, observation windows and statistical analysis plan still need agreement with the supervisor. Existing local literature examples are software fixtures; their derived summaries are not dissertation findings. Code changes, tests, limitations and actual workflows belong in docs/development-log.md and docs/workflows.md.

## Account admission — 27 October 2026

Registration creates a pending professional profile, not clinical access. A trusted admin approves or revokes access under Team. Separate memberships documents record the approval, admin UID and server timestamp; ordinary users cannot write them. Approved clinicians access only their own cases and analysis. Admin claims independently retain global read-only clinical access. Existing normal accounts need explicit approval too; patient documents are not migrated. Institutional authorisation and privacy information remain prerequisites for clinical rollout.

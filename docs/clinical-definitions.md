# Clinical working definitions — meditrack-outcomes-v1

Decision record, 24 October 2026. These are transparent software working definitions for supervisor review, not a claim of consensus, questionnaire validation or an approved study protocol. Existing patient records are not migrated.

## Evidence and decisions

| Evidence | Implication for MediTrack |
|---|---|
| ESCP guideline (2024), DOI [10.1093/bjs/znae237](https://doi.org/10.1093/bjs/znae237): recurrence definitions differ between studies and estimates depend strongly on follow-up duration. | Record actual operation and assessment dates; do not display an unqualified pooled recurrence percentage. |
| SICCR consensus (2021), [full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8580911/): recurrent disease follows complete healing and a disease-free interval. | Separate persistent disease / never healed, recurrence after complete healing, no recurrence reported, and uncertain. Require healing followed by a later recurrence date for the recurrence category. No universal six-month threshold is assumed. |
| PITSTOP (2024), [primary cohort publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC10941257/): healing, treatment failure, pain and quality of life are distinct outcomes. | Preserve distinct observations rather than equating another intervention or an open wound with recurrence. |
| SQoL validation (2026), DOI [10.3390/jcm15155875](https://doi.org/10.3390/jcm15155875): a disease-specific 20-item questionnaire was studied in 116 patients in one centre and language context. | A relevant instrument now exists. Its appropriate language version, scoring and suitability require review before integration. The existing MediTrack items are exploratory and must not be labelled SQoL or a validated composite score. |

## Implemented definitions and data

- Complete healing: working operational definition of full epithelialisation and a dry wound without discharge or dressings. The chosen wording is an implementation proposal; the clinician records the observed/established date and assessment method. It is not asserted as a universal guideline definition.
- Persistent disease: disease has never completely healed by the assessment. No arbitrary duration cutoff is imposed. A previous complete-healing date contradicts this classification and is rejected.
- Recurrence: disease returns after established complete healing and a disease-free interval. The documented recurrence date must be later than the complete-healing date and no later than assessment. Unknown dates require uncertain, not invented dates.
- No recurrence reported: the assessor reports none at this assessment. It does not establish lifetime freedom from recurrence or imply complete healing; interpret alongside wound status.
- Assessments identify the operation by `operationId` (`initial` or the stable additional-surgery document ID), `assessedOn`, and `definitionsVersion`. Assessment cannot predate a known valid operation date. Missing historical operation dates remain missing.
- Follow-ups also retain `followUpDate`, `assessmentMethod`, `outcomeClassification`, `completeHealingDate`, and `dateOfRecurrence`. New PROMs identify `instrumentId: meditrack-exploratory-v1`, schema version 2, response date and operation.
- Pain endpoints: 0 no pain, 10 worst imaginable pain. Satisfaction: 0 completely dissatisfied, 10 completely satisfied. Blank answers remain null, deliberate zero remains zero. Before-surgery recall collected later is retrospective, not prospective baseline.
- Healing summaries use the documented index operation and only its linked healing observations; later-operation healing is excluded. Literature extracts retain reported intervals and source-specific uncertainty. They are software fixtures, not a recruited cohort.

## Decisions for the supervisor

Agree the primary research question, eligible population, index operation, endpoints, clinically justified observation windows and PROM instrument before prospective study recruitment. A 1/6/12-month schedule could be discussed but is not implemented as an evidence-mandated schedule. Historical `hospitalDays` units require a separate inventory before any conversion. Risk-factor models, comparative efficacy, censoring/time-to-event analysis and validated PROM scoring are not implemented. No patient or source author was contacted.

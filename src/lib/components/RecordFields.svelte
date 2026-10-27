<script lang="ts">
  import { Timestamp } from 'firebase/firestore';

  export let record: Record<string, unknown>;
  export let fields: string[] | undefined = undefined;

  const labels: Record<string, string> = {
    operationId: 'Assessed operation ID', assessedOn: 'Assessment date', definitionsVersion: 'Outcome definition version', outcomeClassification: 'Disease course', completeHealingDate: 'First complete-healing date', instrumentId: 'Questionnaire version',
    ageAtPresentation: 'Reported age (years)', diseaseDurationMonths: 'Reported disease duration (months)', anatomicalSite: 'Anatomical site',
    sourceTitle: 'Publication', sourceAuthors: 'Authors', sourceDoi: 'DOI', sourceCase: 'Original case identifier', sourceLocator: 'Source section or table', sourceLicense: 'Source licence', extractedAt: 'Extraction date', sourceMissingData: 'Missing information', sourceQualityNotes: 'Source quality notes', indexProcedureMeaning: 'Procedure interpretation', analysisEligibility: 'Use in analysis',
    followUpIntervalDays: 'Interval after index procedure (days)', followUpIntervalMonths: 'Interval after index procedure (months)', assessmentMethod: 'Assessment method', outcomeNotes: 'Reported outcome notes',
    birthDate: 'Birth date', height: 'Height (cm)', weight: 'Weight (kg)', bmi: 'BMI',
    sex: 'Sex', diseaseStartDate: 'Disease onset', familyHistory: 'Family history',
    previousSurgeries: 'Previous surgeries', previousSurgeryDetails: 'Previous surgery details',
    hospitalTown: 'Hospital town', hospitalCountry: 'Hospital country', hospitalDepartment: 'Department',
    otherDepartment: 'Other department', studyType: 'Study type', surgeonName: 'Surgeon',
    surgeonQualification: 'Surgeon qualification', opsByDept: 'Department operations per year',
    opsBySurgeon: 'Surgeon operations per year', operationDate: 'Operation date',
    abscess: 'Abscess present', operationTechnique: 'Operation technique', otherTechnique: 'Other technique',
    flapTechnique: 'Flap technique', otherFlap: 'Other flap technique', dyeInjected: 'Dye injected',
    dyeType: 'Dye type', otherDye: 'Other dye', woundClosure: 'Wound closure',
    sutureLocalization: 'Suture location', anesthesiaType: 'Anesthesia',
    hospitalizationForm: 'Hospitalization', hospitalDays: 'Hospital stay',
    dateWoundClosed: 'Wound closure date', dateHealed: 'Healing date', comments: 'Recorded comments', baselineComments: 'Baseline comments',
    surgeryNumber: 'Additional surgery number', followUpNumber: 'Follow-up number',
    followUpDate: 'Follow-up date', doctorName: 'Examining doctor', visitReason: 'Visit reason',
    woundStatus: 'Wound status', recurrence: 'Recurrence', signsOfRecurrence: 'Recurrence signs',
    dateOfRecurrence: 'Recurrence date', additionalComments: 'Additional comments',
    painBefore: 'Pain before surgery', painDuringHealing: 'Pain during healing', painToday: 'Pain today',
    missedDays: 'Days absent from work or school', qolImpact: 'Impact on quality of life',
    sameSurgery: 'Would choose the same surgery again', satisfaction: 'Treatment satisfaction'
  };
  const metadata = new Set(['type', 'userId', 'createdAt', 'sourceEventOrder', 'documentationCounters', 'promSchemaVersion']);
  $: visibleFields = (fields ?? Object.keys(record)).filter(key => !metadata.has(key) && record[key] !== '' && record[key] !== null && record[key] !== undefined);

  function label(key: string): string {
    if (labels[key]) return labels[key];
    const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  function display(value: unknown): string {
    if (typeof value === 'number' && !Number.isFinite(value)) return 'Not recorded';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Timestamp) return value.toDate().toLocaleDateString('en-GB');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
</script>

{#if visibleFields.length}
  <dl>
    {#each visibleFields as key}
      <div class="field"><dt>{label(key)}</dt><dd>{display(record[key])}</dd></div>
    {/each}
  </dl>
{:else}
  <p class="empty">No information recorded.</p>
{/if}

<style>
  dl { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 40px; margin: 0; }
  .field { min-width: 0; }
  dt { color: var(--muted); font-size: 13px; margin-bottom: 7px; line-height: 1.5; }
  dd { margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  .empty { color: var(--muted); margin: 0; }
  @media (max-width: 600px) { dl { grid-template-columns: 1fr; gap: 24px; } }
</style>

<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    type Timestamp
  } from 'firebase/firestore';
  import { getAccess, authorLabel } from '$lib/access';
  import RecordFields from '$lib/components/RecordFields.svelte';

  type DocumentationEntry = {
    [key: string]: unknown;
    type: 'surgery' | 'followup' | 'proms';
    operationDate?: string;
    followUpDate?: string;
    createdAt?: Timestamp;
  };

  const baselineFields = ['ageAtPresentation', 'sex', 'birthDate', 'height', 'weight', 'bmi', 'diseaseDurationMonths', 'anatomicalSite', 'diseaseStartDate', 'familyHistory', 'previousSurgeries', 'previousSurgeryDetails', 'baselineComments'];
  const surgeryFields = ['operationDate', 'operationTechnique', 'otherTechnique', 'flapTechnique', 'otherFlap', 'abscess', 'woundClosure', 'sutureLocalization', 'anesthesiaType', 'hospitalizationForm', 'hospitalDays', 'dateWoundClosed', 'dateHealed', 'hospitalTown', 'hospitalCountry', 'hospitalDepartment', 'otherDepartment', 'studyType', 'surgeonName', 'surgeonQualification', 'opsByDept', 'opsBySurgeon', 'dyeInjected', 'dyeType', 'otherDye'];
  // Published extracts retain their provenance separately from clinical measurements.
  const sourceFields = ['sourceTitle', 'sourceAuthors', 'sourceDoi', 'sourceCase', 'sourceLocator', 'sourceLicense', 'extractedAt', 'sourceMissingData', 'sourceQualityNotes', 'indexProcedureMeaning', 'analysisEligibility'];
  const sourceMetadata = [...sourceFields, 'sourceUrl', 'dataOrigin', 'datasetId'];
  let patient: Record<string, unknown> | null = null;
  $: additionalFields = patient ? Object.keys(patient).filter(key => !baselineFields.includes(key) && !surgeryFields.includes(key) && !['createdAt', 'userId', 'documentationCounters', ...sourceMetadata].includes(key) && patient?.[key] !== '' && patient?.[key] !== null && patient?.[key] !== undefined) : [];
  let documentation: DocumentationEntry[] = [];
  let error = '';
  let loading = true;
  let isAdmin = false;
  let enteredBy = '';
  let recorderUid = '';

  onMount(async () => {
    const db = getFirestore();
    const id = $page.params.id;
    if (!id) { error = 'Missing patient ID.'; loading = false; return; }
    const docRef = doc(db, 'patients', id);
    try {
      isAdmin = (await getAccess()).isAdmin;
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        patient = docSnap.data();
        if (isAdmin) { enteredBy = await authorLabel(db, patient.userId); recorderUid = typeof patient.userId === 'string' ? patient.userId : ''; }

        const surgeriesSnap = await getDocs(collection(docRef, 'surgeries'));
        const followupsSnap = await getDocs(collection(docRef, 'followups'));
        const promsSnap = await getDocs(collection(docRef, 'proms'));

        const allDocs: DocumentationEntry[] = [
          ...surgeriesSnap.docs.map(d => ({ ...d.data(), type: 'surgery' as const })),
          ...followupsSnap.docs.map(d => ({ ...d.data(), type: 'followup' as const })),
          ...promsSnap.docs.map(d => ({ ...d.data(), type: 'proms' as const }))
        ];

        documentation = allDocs.sort((a, b) => {
          // Literature often reports relative intervals, not calendar dates.
          // Preserve the explicitly extracted clinical order without inventing dates.
          if (patient?.dataOrigin === 'published_individual_case') return Number(a.sourceEventOrder ?? 0) - Number(b.sourceEventOrder ?? 0);
          const aDate = new Date(a.operationDate || a.followUpDate || (typeof a.assessedOn === 'string' ? a.assessedOn : '') || a.createdAt?.toDate?.() || 0);
          const bDate = new Date(b.operationDate || b.followUpDate || (typeof b.assessedOn === 'string' ? b.assessedOn : '') || b.createdAt?.toDate?.() || 0);
          return aDate.getTime() - bDate.getTime();
        });
      } else {
        error = 'Patient not found.';
      }
    } catch (err) {
      error = 'Failed to load patient.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function eventDate(entry: DocumentationEntry): string {
    if (typeof entry.followUpIntervalDays === 'number') return `Day ${entry.followUpIntervalDays} after published index procedure`;
    if (typeof entry.followUpIntervalMonths === 'number') return `${entry.followUpIntervalMonths} months after published index procedure`;
    return entry.operationDate || entry.followUpDate || (typeof entry.assessedOn === 'string' ? entry.assessedOn : '') || (entry.createdAt?.toDate?.().toLocaleDateString('en-GB') ?? 'Date not recorded');
  }
</script>

<svelte:head><title>Patient record · MediTrack</title></svelte:head>

<div class="page case-page">
  <a class="back-link" href="/dashboard">Back to patients</a>
  <div class="page-heading">
    <div>
      <h1>Patient record</h1>
      <p class="case-id">Case ID: {$page.params.id}</p>
    </div>
    {#if patient && !error && !loading && !isAdmin}
      <nav class="record-actions" aria-label="Add documentation">
        <a class="secondary-action" href={`/patients/${$page.params.id}/surgery`}>Add surgery</a>
        <a class="secondary-action" href={`/patients/${$page.params.id}/followup`}>Add follow-up</a>
        <a class="secondary-action" href={`/patients/${$page.params.id}/proms`}>Add PROM</a>
      </nav>
    {/if}
  </div>

  {#if loading}
    <p role="status">Loading patient record…</p>
  {:else if error}
    <p class="error" role="alert">{error}</p>
  {:else if patient}
    {#if isAdmin}<p class="recorder-note">Read-only administrator view · Entered by {enteredBy}{#if recorderUid}<br />Recorder UID: {recorderUid}{/if}</p>{/if}
    {#if patient.dataOrigin === 'published_individual_case'}
      <section class="record-section" aria-labelledby="source-heading">
        <div class="section-heading"><h2 id="source-heading">Published case · Test data</h2><p>Extracted individual facts, with unreported information left missing. These selected cases do not form a representative study cohort.</p></div>
        {#if typeof patient.sourceDoi === 'string'}
          <p><a href={`https://doi.org/${encodeURIComponent(patient.sourceDoi)}`} target="_blank" rel="noopener noreferrer">Open original publication</a></p>
        {/if}
        <RecordFields record={patient} fields={sourceFields} />
      </section>
    {/if}
    <section class="record-section" aria-labelledby="baseline-heading">
      <div class="section-heading"><h2 id="baseline-heading">Baseline</h2><p>Patient characteristics and history</p></div>
      <RecordFields record={patient} fields={baselineFields} />
    </section>
    <section class="record-section" aria-labelledby="initial-heading">
      <div class="section-heading"><h2 id="initial-heading">{patient.dataOrigin === 'published_individual_case' ? 'Published index procedure' : 'Initial surgery'}</h2><p>{patient.dataOrigin === 'published_individual_case' ? 'The procedure selected in the publication; earlier operations may be incompletely described.' : 'The initial operation documented in this record'}</p></div>
      <RecordFields record={patient} fields={surgeryFields} />
    </section>
    {#if additionalFields.length}
    <section class="record-section" aria-labelledby="additional-heading">
      <div class="section-heading"><h2 id="additional-heading">Additional information</h2><p>Other information stored with the patient record</p></div>
      <RecordFields record={patient} fields={additionalFields} />
    </section>
    {/if}
    <section class="record-section" aria-labelledby="history-heading">
      <div class="section-heading"><h2 id="history-heading">Follow-up and further treatment</h2><p>Additional operations, examinations and patient-reported outcomes</p></div>
      {#if documentation.length === 0}
        <p class="empty">No further documentation recorded.</p>
      {/if}
      {#each documentation as entry}
        <article class="event">
          <header class="event-heading">
            <h3>{entry.type === 'surgery' ? 'Further surgery' : entry.type === 'followup' ? 'Follow-up' : 'Patient-reported outcomes'}</h3>
            <p>{eventDate(entry)}</p>
          </header>
          {#if entry.type === 'proms'}
            <p class="field-hint">Exploratory questionnaire items, not a validated quality-of-life score.</p>
            {#if entry.promSchemaVersion !== 2}<p class="field-hint">Legacy record: numeric scores may include old defaults and cannot be assumed to be confirmed patient answers.</p>{/if}
          {/if}
          <RecordFields record={entry} />
        </article>
      {/each}
    </section>
  {/if}
</div>

<style>
  .back-link { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 24px; color: var(--muted); font-size: 14px; text-decoration: none; }
  @media (hover: hover) and (pointer: fine) {
    .back-link:hover { color: var(--ink); text-decoration: underline; }
  }
  .case-id { overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  .page-heading { align-items: flex-start; }
  .page-heading > div { min-width: 0; }
  .record-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .secondary-action { display: inline-flex; align-items: center; justify-content: center; padding: 11px 16px; min-height: 44px; border: 1px solid var(--line); border-radius: 6px; font-size: 14px; font-weight: 500; color: var(--ink); background: var(--surface); text-decoration: none; white-space: nowrap; }
  @media (hover: hover) and (pointer: fine) {
    .secondary-action:hover { background: var(--hover); border-color: var(--muted); }
  }
  .record-section { border-top: 1px solid var(--line); padding: 32px 0 48px; }
  .section-heading { margin-bottom: 32px; }
  h2 { margin: 0 0 8px; font-size: 22px; font-weight: 500; letter-spacing: -0.015em; }
  .section-heading p, .empty { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
  .event { padding: 28px 0; border-top: 1px solid var(--line); }
  .event-heading { display: flex; gap: 16px; justify-content: space-between; align-items: baseline; margin-bottom: 28px; }
  h3 { margin: 0; font-size: 18px; font-weight: 500; }
  .event-heading p { margin: 0; font-size: 13px; color: var(--muted); }
  .error { color: var(--danger); }
  @media (max-width: 750px) {
    .page-heading { flex-direction: column; gap: 24px; }
    .record-actions { justify-content: flex-start; }
    .event-heading { flex-direction: column; gap: 8px; }
  }
</style>

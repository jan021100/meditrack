<script lang="ts">
  import { page } from '$app/state';
  import { requireClinicalEditor } from '#lib/access.ts';
  import { goto } from '$app/navigation';
  import OperationContext from '#lib/components/OperationContext.svelte';
  import { assessmentContext, followupOutcome, OUTCOMES } from '#lib/clinical.ts';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import { saveDocumentation } from '#lib/firebase/documentation.ts';

  const patientId = page.params.id ?? '';
  if (!patientId) throw new Error('Missing patient ID.');

  let followUpDate = '';
  let doctorName = '';
  let assessmentMethod = '';
  let visitReason = '';
  let woundStatus = '';
  let operationId = '';
  let outcomeClassification = '';
  let completeHealingDate = '';
  let signsOfRecurrence = '';
  let dateOfRecurrence = '';
  let additionalComments = '';

  let submitting = false;
  let success = false;
  let error = '';

  async function saveFollowUp() {
    if (submitting) return; // Ignore duplicate submissions while the write is pending.
    submitting = true;
    error = '';
    success = false;

    try {
      const user = await requireClinicalEditor();
      const db = getFirestore();
      const context = await assessmentContext(db, patientId, operationId, followUpDate);
      const operation = await getDoc(operationId === 'initial' ? doc(db, 'patients', patientId) : doc(db, 'patients', patientId, 'surgeries', operationId));
      if (outcomeClassification === 'Persistent disease / never healed' && woundStatus === 'Completely healed') throw new Error('A completely healed wound cannot be classified as never healed.');
      const outcome = followupOutcome({ outcomeClassification, completeHealingDate, dateOfRecurrence, assessedOn: followUpDate, operationDate: operation.data()?.operationDate });
      await saveDocumentation(db, patientId, 'followups', {
        ...context,
        ...outcome,
        userId: user.uid,
        followUpDate,
        doctorName,
        assessmentMethod,
        visitReason,
        woundStatus,
        signsOfRecurrence,
        additionalComments
      });

      success = true;
      goto(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      error = err instanceof Error && !(err as { code?: string }).code ? err.message : 'Error saving follow-up. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head><title>Follow-up · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href={`/patients/${patientId}`}>Back to patient</a>
  <div class="page-heading"><div><h1>Follow-up</h1><p>Record the examination, wound status and recurrence findings.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={saveFollowUp}>
    <div class="form-grid">
      <OperationContext {patientId} bind:operationId />

  <p class="field-hint full-width">The follow-up number is assigned automatically when saved.</p>

  <div class="form-field"><label for="followUpDate">Follow-up date</label>
  <input id="followUpDate" bind:value={followUpDate} type="date" required /></div>

  <div class="form-field"><label for="doctorName">Examining doctor</label>
  <input id="doctorName" bind:value={doctorName} type="text" /></div>

  <div class="form-field"><label for="assessmentMethod">Assessment method</label><select id="assessmentMethod" bind:value={assessmentMethod} required><option value="">Select…</option><option>In-person examination</option><option>Video consultation</option><option>Telephone / patient report</option><option>Medical records review</option></select></div>
  <div class="form-field"><label for="visitReason">Reason for visit</label>
  <select id="visitReason" bind:value={visitReason}>
    <option value="">Select...</option>
    <option value="Invited">Invited</option>
    <option value="Sent by GP">Sent by GP</option>
    <option value="Self">Self</option>
  </select></div>

  <div class="form-field"><label for="woundStatus">Wound status</label>
  <select id="woundStatus" bind:value={woundStatus}>
    <option value="">Select...</option>
    <option value="Completely healed">Completely healed</option>
    <option value="Partially open">Partially open</option>
    <option value="Not healed at all">Not healed at all</option>
    <option value="New sinus tract observed">New sinus tract observed</option>
    <option value="Other">Other</option>
  </select></div>

  <div class="form-field full-width"><label for="outcomeClassification">Disease course after this operation</label>
  <select id="outcomeClassification" bind:value={outcomeClassification} required><option value="">Select…</option>{#each OUTCOMES as outcome}<option value={outcome}>{outcome}</option>{/each}</select>
  <p class="field-hint">Recurrence means disease returning after complete healing and a disease-free interval. Disease that never healed is persistent, not a recurrence.</p></div>
  <div class="form-field"><label for="completeHealingDate">First complete-healing date (if established)</label><input id="completeHealingDate" type="date" bind:value={completeHealingDate} required={outcomeClassification === 'Recurrence after complete healing'} /></div>
  <p class="field-hint full-width">Working definition: fully epithelialised and dry, with no discharge or dressing needed. Record the observed date; use uncertain rather than inventing a date.</p>
  <div class="form-field"><label for="signsOfRecurrence">Signs of recurrence</label>
  <select id="signsOfRecurrence" bind:value={signsOfRecurrence}>
    <option value="">Select...</option>
    <option value="Retention">Retention</option>
    <option value="Secretion">Secretion</option>
    <option value="New Sinus">New Sinus</option>
    <option value="New Wound with Hair">New Wound with Hair</option>
    <option value="Other">Other</option>
  </select></div>

  <div class="form-field"><label for="dateOfRecurrence">Recurrence date</label>
  <input id="dateOfRecurrence" bind:value={dateOfRecurrence} type="date" required={outcomeClassification === 'Recurrence after complete healing'} /></div>

  <div class="form-field full-width"><label for="additionalComments">Additional comments</label>
  <textarea id="additionalComments" rows="3" bind:value={additionalComments}></textarea></div>

  </div>
    <div class="form-footer"><button type="submit" class="primary-action" disabled={submitting}>
    {submitting ? 'Saving...' : ' Save follow-up'}
  </button>

  {#if success}
    <p class="feedback success" role="status"> Follow-up saved!</p>
  {/if}
  {#if error}
    <p class="feedback error" role="alert">{error}</p>
  {/if}
</div>
  </form>
</div>

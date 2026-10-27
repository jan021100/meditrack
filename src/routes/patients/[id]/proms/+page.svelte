<script lang="ts">
  import { page } from '$app/stores';
  import { requireClinicalEditor } from '$lib/access';
  import { goto } from '$app/navigation';
  import { getFirestore, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import OperationContext from '$lib/components/OperationContext.svelte';
  import { assessmentContext } from '$lib/clinical';
  import { buildProm } from '$lib/prom';
  import { get } from 'svelte/store';

  const patientId = get(page).params.id ?? '';
  if (!patientId) throw new Error('Missing patient ID.');

  let painBefore: number | null | undefined = null;
  let painDuringHealing: number | null | undefined = null;
  let painToday: number | null | undefined = null;
  let missedDays: number | null | undefined = null;
  let qolImpact = '';
  let sameSurgery = '';
  let satisfaction: number | null | undefined = null;
  let comments = '';
  let operationId = '';
  let assessedOn = '';

  let submitting = false;
  let success = false;
  let error = '';

  async function saveProm() {
    if (submitting) return; // Ignore duplicate submissions while the write is pending.
    submitting = true;
    error = '';
    success = false;

    try {
      const user = await requireClinicalEditor();
      const db = getFirestore();
      const patientRef = doc(db, 'patients', patientId);
      const promsRef = collection(patientRef, 'proms');

      const context = await assessmentContext(db, patientId, operationId, assessedOn);
      await addDoc(promsRef, {
        ...context,
        instrumentId: 'meditrack-exploratory-v1',
        userId: user.uid,
        ...buildProm({
        painBefore,
        painDuringHealing,
        painToday,
        missedDays,
        qolImpact,
        sameSurgery,
        satisfaction,
        comments
        }),
        createdAt: serverTimestamp()
      });

      success = true;
      goto(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      error = err instanceof Error && !(err as { code?: string }).code ? err.message : 'Error saving PROM. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head><title>Patient-reported outcomes · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href={`/patients/${patientId}`}>Back to patient</a>
  <div class="page-heading"><div><h1>Patient-reported outcomes</h1><p>Enter the patient’s responses. Scores range from 0 to 10. Leave unanswered items blank; no value is assumed.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={saveProm}>
    <div class="form-grid">
      <OperationContext {patientId} bind:operationId />
      <div class="form-field"><label for="assessedOn">Response date</label><input id="assessedOn" type="date" bind:value={assessedOn} required /></div>
      <p class="field-hint full-width">Exploratory patient questionnaire. These individual items do not form a validated quality-of-life score. The before-surgery item records retrospective recall, not a prospective baseline measurement.</p>

  <div class="form-field"><label for="painBefore">How severe was the pain before surgery?</label>
  <input id="painBefore" type="number" min="0" max="10" step="1" placeholder="Not answered (0–10)" bind:value={painBefore} /><p class="field-hint">0 = no pain; 10 = worst imaginable pain.</p></div>

  <div class="form-field"><label for="painDuringHealing">How severe was the pain during healing?</label>
  <input id="painDuringHealing" type="number" min="0" max="10" step="1" placeholder="Not answered (0–10)" bind:value={painDuringHealing} /><p class="field-hint">0 = no pain; 10 = worst imaginable pain.</p></div>

  <div class="form-field"><label for="painToday">How severe is the pain today?</label>
  <input id="painToday" type="number" min="0" max="10" step="1" placeholder="Not answered (0–10)" bind:value={painToday} /><p class="field-hint">0 = no pain; 10 = worst imaginable pain.</p></div>

  <div class="form-field"><label for="missedDays">How many days were you unable to attend school/work?</label>
  <input id="missedDays" type="number" bind:value={missedDays} min="0" /></div>

  <div class="form-field"><label for="qolImpact">How much did the disease impact your quality of life before surgery?</label>
  <select id="qolImpact" bind:value={qolImpact}>
    <option value="">Select...</option>
    <option value="Not at all">Not at all</option>
    <option value="Slightly">Slightly</option>
    <option value="Moderately">Moderately</option>
    <option value="Severely">Severely</option>
    <option value="Extremely">Extremely</option>
  </select></div>

  <div class="form-field"><label for="sameSurgery">Would you choose the same type of surgery again?</label>
  <select id="sameSurgery" bind:value={sameSurgery}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
    <option value="Not sure">Not sure</option>
  </select></div>

  <div class="form-field"><label for="satisfaction">Overall, how satisfied are you with the treatment outcome?</label>
  <input id="satisfaction" type="number" min="0" max="10" step="1" placeholder="Not answered (0–10)" bind:value={satisfaction} /><p class="field-hint">0 = completely dissatisfied; 10 = completely satisfied.</p></div>

  <div class="form-field full-width"><label for="comments">Additional comments or feedback</label>
  <textarea id="comments" rows="3" bind:value={comments}></textarea></div>

  </div>
    <div class="form-footer"><button type="submit" class="primary-action" disabled={submitting}>
    {submitting ? 'Saving...' : ' Save PROM' }
  </button>

  {#if success}
    <p class="feedback success" role="status"> PROM saved!</p>
  {/if}
  {#if error}
    <p class="feedback error" role="alert">{error}</p>
  {/if}
</div>
  </form>
</div>

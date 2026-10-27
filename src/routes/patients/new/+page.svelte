<script lang="ts">
  import { goto } from '$app/navigation';
  import { setCaseDraft } from '$lib/stores/caseStore';
  import { requireClinicalEditor } from '$lib/access';
  let error = '';
  let submitting = false;

  let birthDate = '';
  let height: number | null = null;
  let weight: number | null = null;
  let bmi: number | null = null;
  let sex = '';
  let diseaseStartDate = '';
  let familyHistory = '';
  let previousSurgeries = 0;
  let previousSurgeryDetails = '';
  let comments = '';

  $: bmi = height && height > 0 && weight && weight > 0
    ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10
    : null;

  async function goToSurgeryForm() {
    if (submitting) return;
    submitting = true; error = '';
    try {
      const user = await requireClinicalEditor();
      setCaseDraft(user.uid, {
        birthDate,
        height,
        weight,
        bmi,
        sex,
        diseaseStartDate,
        familyHistory,
        previousSurgeries,
        previousSurgeryDetails: previousSurgeries > 0 ? previousSurgeryDetails : '',
        comments
      });
      goto('/patients/new/surgery');
    } catch { error = 'Your session changed or cannot create patients. Please sign in and start again.'; }
    finally { submitting = false; }
  }
</script>

<svelte:head><title>New patient · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href="/dashboard">Back to patients</a>
  <div class="page-heading"><div><h1>New patient</h1><p>Patient characteristics and clinical history. Continue to document the initial surgery.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={goToSurgeryForm}>
    <div class="form-grid">

  <div class="form-field"><label for="sex">Sex</label>
  <select bind:value={sex} id="sex" required>
    <option value="">Select...</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select></div>

  <div class="form-field"><label for="birthDate">Birth date</label>
  <input type="date" id="birthDate" bind:value={birthDate} required /></div>

  <div class="form-field"><label for="diseaseStartDate">Disease onset</label>
  <input type="date" id="diseaseStartDate" bind:value={diseaseStartDate} required /></div>

  <div class="form-field"><label for="height">Height (cm)</label>
  <input type="number" id="height" step="any" bind:value={height} min="0" required /></div>

  <div class="form-field"><label for="weight">Weight (kg)</label>
  <input type="number" id="weight" step="any" bind:value={weight} min="0" required /></div>

  <div class="form-field"><label for="bmi">BMI (calculated)</label>
  <input type="number" id="bmi" value={bmi ?? ''} readonly /></div>

  <div class="form-field full-width"><label for="familyHistory">Family history of PSD (list relatives, e.g. mother, brother...)</label>
  <input type="text" id="familyHistory" bind:value={familyHistory} placeholder="e.g. father, cousin (mother's side), sister" /></div>

  <div class="form-field"><label for="previousSurgeries">Previous surgeries</label>
  <input type="number" id="previousSurgeries" bind:value={previousSurgeries} min="0" /></div>

  {#if previousSurgeries > 0}
    <div class="form-field full-width"><label for="previousSurgeryDetails">Previous surgery details (hospital, date, technique)</label>
    <textarea id="previousSurgeryDetails" bind:value={previousSurgeryDetails} rows="3"></textarea></div>
  {/if}

  <div class="form-field full-width"><label for="comments">Additional comments</label>
  <textarea id="comments" bind:value={comments} rows="4" placeholder="e.g. special wound healing, complications..."></textarea></div>

  </div>
    <div class="form-footer">{#if error}<p class="feedback error" role="alert">{error}</p>{/if}<button type="submit" class="primary-action" disabled={submitting}>Continue to surgery</button>
</div>
  </form>
</div>

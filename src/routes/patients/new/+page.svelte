<script lang="ts">
  import { goto } from '$app/navigation';
  import { caseData } from '$lib/stores/caseStore';

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

  $: if (height && weight) {
    const h = height / 100;
    bmi = Math.round((weight / (h * h)) * 10) / 10;
  }

  function goToSurgeryForm() {
    caseData.set({
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
  }
</script>

<style>
  .form-container {
    max-width: 700px;
    margin: 3rem auto;
    padding: 2rem;
    border-radius: 12px;
    background-color: #f5f5f3;
    font-family: 'Helvetica Neue', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  h1 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  label {
    display: block;
    margin-top: 1rem;
    font-weight: 500;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.25rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  button {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  button:hover {
    background-color: #333;
  }
</style>

<div class="form-container">
  <h1>Create New Case</h1>

  <label for="sex">Sex</label>
  <select bind:value={sex} id="sex" required>
    <option value="">Select...</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>

  <label for="birthDate">Birth date</label>
  <input type="date" id="birthDate" bind:value={birthDate} required />

  <label for="diseaseStartDate">Date of initial disease start</label>
  <input type="date" id="diseaseStartDate" bind:value={diseaseStartDate} required />

  <label for="height">Height (cm)</label>
  <input type="number" id="height" bind:value={height} min="0" required />

  <label for="weight">Weight (kg)</label>
  <input type="number" id="weight" bind:value={weight} min="0" required />

  <label for="bmi">BMI (calculated)</label>
  <input type="number" id="bmi" value={bmi ?? ''} readonly />

  <label for="familyHistory">Family history of PSD (list relatives, e.g. mother, brother...)</label>
  <input type="text" id="familyHistory" bind:value={familyHistory} placeholder="e.g. father, cousin (mother's side), sister" />

  <label for="previousSurgeries">Number of previous surgeries</label>
  <input type="number" id="previousSurgeries" bind:value={previousSurgeries} min="0" />

  {#if previousSurgeries > 0}
    <label for="previousSurgeryDetails">List previous surgeries (Hospital, Date, Technique used):</label>
    <textarea id="previousSurgeryDetails" bind:value={previousSurgeryDetails} rows="3"></textarea>
  {/if}

  <label for="comments">Additional comments</label>
  <textarea id="comments" bind:value={comments} rows="4" placeholder="e.g. special wound healing, complications..."></textarea>

  <button on:click={goToSurgeryForm}>➔ Continue to Surgery Record</button>
</div>
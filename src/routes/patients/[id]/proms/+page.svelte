<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getFirestore, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { get } from 'svelte/store';

  const patientId = get(page).params.id;

  let painBefore = 5;
  let painDuringHealing = 5;
  let painToday = 5;
  let missedDays = '';
  let qolImpact = '';
  let sameSurgery = '';
  let satisfaction = 5;
  let comments = '';

  let submitting = false;
  let success = false;
  let error = '';

  async function saveProm() {
    submitting = true;
    error = '';
    success = false;

    try {
      const db = getFirestore();
      const patientRef = doc(db, 'patients', patientId);
      const promsRef = collection(patientRef, 'proms');

      await addDoc(promsRef, {
        painBefore,
        painDuringHealing,
        painToday,
        missedDays,
        qolImpact,
        sameSurgery,
        satisfaction,
        comments,
        createdAt: serverTimestamp()
      });

      success = true;
      goto(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      error = 'Error saving PROM.';
    } finally {
      submitting = false;
    }
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

  input[type="range"] {
    margin-top: 0.5rem;
  }

  .slider-value {
    font-weight: bold;
    margin-top: 0.25rem;
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

  .success {
    color: green;
    margin-top: 1rem;
  }

  .error {
    color: red;
    margin-top: 1rem;
  }
</style>

<div class="form-container">
  <h1>📋 PROM – Patient-Reported Outcome Measures</h1>

  <label>How severe was the pain before surgery?</label>
  <input type="range" min="0" max="10" bind:value={painBefore} />
  <div class="slider-value">Value: {painBefore}</div>

  <label>How severe was the pain during healing?</label>
  <input type="range" min="0" max="10" bind:value={painDuringHealing} />
  <div class="slider-value">Value: {painDuringHealing}</div>

  <label>How severe is the pain today?</label>
  <input type="range" min="0" max="10" bind:value={painToday} />
  <div class="slider-value">Value: {painToday}</div>

  <label>How many days were you unable to attend school/work?</label>
  <input type="number" bind:value={missedDays} min="0" />

  <label>How much did the disease impact your quality of life before surgery?</label>
  <select bind:value={qolImpact}>
    <option value="">Select...</option>
    <option value="Not at all">Not at all</option>
    <option value="Slightly">Slightly</option>
    <option value="Moderately">Moderately</option>
    <option value="Severely">Severely</option>
    <option value="Extremely">Extremely</option>
  </select>

  <label>Would you choose the same type of surgery again?</label>
  <select bind:value={sameSurgery}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
    <option value="Not sure">Not sure</option>
  </select>

  <label>Overall, how satisfied are you with the treatment outcome?</label>
  <input type="range" min="0" max="10" bind:value={satisfaction} />
  <div class="slider-value">Value: {satisfaction}</div>

  <label>Additional Comments or Feedback</label>
  <textarea rows="3" bind:value={comments}></textarea>

  <button on:click={saveProm} disabled={submitting}>
    {submitting ? 'Saving...' : '💾 Save PROM' }
  </button>

  {#if success}
    <p class="success">✅ PROM saved!</p>
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
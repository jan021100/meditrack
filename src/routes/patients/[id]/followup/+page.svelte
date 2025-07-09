<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import {
    getFirestore,
    doc,
    collection,
    setDoc,
    getDocs,
    serverTimestamp
  } from 'firebase/firestore';
  import { get } from 'svelte/store';

  const patientId = get(page).params.id;

  let followUpNumber = '';
  let followUpDate = '';
  let doctorName = '';
  let visitReason = '';
  let woundStatus = '';
  let recurrence = '';
  let signsOfRecurrence = '';
  let dateOfRecurrence = '';
  let additionalComments = '';

  let submitting = false;
  let success = false;
  let error = '';

  async function saveFollowUp() {
    submitting = true;
    error = '';
    success = false;

    try {
      const db = getFirestore();
      const patientRef = doc(db, 'patients', patientId);
      const followupsRef = collection(patientRef, 'followups');

      // Zähle existierende Follow-Ups
      const snapshot = await getDocs(followupsRef);
      const nextNumber = snapshot.size + 1;

      // Speicher als followup1, followup2 usw.
      const followupDocRef = doc(followupsRef, `followup${nextNumber}`);

      await setDoc(followupDocRef, {
        followUpNumber: parseInt(followUpNumber),
        followUpDate,
        doctorName,
        visitReason,
        woundStatus,
        recurrence,
        signsOfRecurrence,
        dateOfRecurrence,
        additionalComments,
        createdAt: serverTimestamp()
      });

      success = true;
      goto(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      error = 'Error saving follow-up.';
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
  <h1>📆 Follow-Up Form</h1>

  <label>Number of Follow-Up</label>
  <input bind:value={followUpNumber} type="number" min="1" />

  <label>Date of Follow-Up</label>
  <input bind:value={followUpDate} type="date" />

  <label>Doctor Performing Follow-Up</label>
  <input bind:value={doctorName} type="text" />

  <label>Reason for Patient Visit</label>
  <select bind:value={visitReason}>
    <option value="">Select...</option>
    <option value="Invited">Invited</option>
    <option value="Sent by GP">Sent by GP</option>
    <option value="Self">Self</option>
  </select>

  <label>Wound Status at Follow-Up</label>
  <select bind:value={woundStatus}>
    <option value="">Select...</option>
    <option value="Completely healed">Completely healed</option>
    <option value="Partially open">Partially open</option>
    <option value="Not healed at all">Not healed at all</option>
    <option value="New sinus tract observed">New sinus tract observed</option>
    <option value="Other">Other</option>
  </select>

  <label>PSD Recurrence?</label>
  <select bind:value={recurrence}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>

  <label>Signs of Recurrence</label>
  <select bind:value={signsOfRecurrence}>
    <option value="">Select...</option>
    <option value="Retention">Retention</option>
    <option value="Secretion">Secretion</option>
    <option value="New Sinus">New Sinus</option>
    <option value="New Wound with Hair">New Wound with Hair</option>
    <option value="Other">Other</option>
  </select>

  <label>Date of Recurrence</label>
  <input bind:value={dateOfRecurrence} type="date" />

  <label>Additional Comments</label>
  <textarea rows="3" bind:value={additionalComments}></textarea>

  <button on:click={saveFollowUp} disabled={submitting}>
    {submitting ? 'Saving...' : '💾 Save Follow-Up'}
  </button>

  {#if success}
    <p class="success">✅ Follow-up saved!</p>
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
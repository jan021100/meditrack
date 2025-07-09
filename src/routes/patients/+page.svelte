<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { goto } from '$app/navigation';

  const db = getFirestore();
  let patients: any[] = [];
  let loading = true;

  async function fetchPatients() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'patients'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading = false;
  }

  function createPatient() {
    goto('/patients/new');
  }

  function formatDate(dateString: string): string {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString();
  }

  onMount(fetchPatients);
</script>

<style>
  .dashboard {
    max-width: 900px;
    margin: 3rem auto;
    font-family: 'Helvetica Neue', sans-serif;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .add-btn {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 2rem;
  }

  .add-btn:hover {
    background-color: #333;
  }

  .patient-list {
    list-style: none;
    padding: 0;
  }

  .patient-card {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    background: #f5f5f3;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .patient-card:hover {
    background: #e9e9e6;
  }

  .case-id {
    font-size: 0.9rem;
    font-weight: 400;
    color: #555;
    margin-bottom: 0.5rem;
  }

  .info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    font-size: 1rem;
  }

  .info-label {
    font-weight: 600;
  }
</style>

<div class="dashboard">
  <h1>📋 Your Patients</h1>

  <button class="add-btn" on:click={createPatient}>➕ Add New Patient</button>

  {#if loading}
    <p>⏳ Loading...</p>
  {:else if patients.length === 0}
    <p>No patients yet.</p>
  {:else}
    <ul class="patient-list">
      {#each patients as patient}
        <li>
          <div class="patient-card" on:click={() => goto(`/patients/${patient.id}`)}>
            <div class="case-id">🆔 Case ID: {patient.id}</div>
            <div class="info-row">
              <div><span class="info-label">Sex:</span> {patient.sex || '-'}</div>
              <div><span class="info-label">Birth Date:</span> {patient.birthDate || '-'}</div>
              <div><span class="info-label">Initial OP:</span> {patient.operationDate || '-'}</div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
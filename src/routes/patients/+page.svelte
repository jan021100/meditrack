<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
  } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { goto } from '$app/navigation';

  const db = getFirestore();
  let patients: {
    id: string;
    sex?: string;
    birthDate?: string;
    operationDate?: string;
    createdAt?: Date | null;
  }[] = [];

  let loading = true;

  async function fetchPatients() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'patients'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      patients = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sex: data.sex,
          birthDate: data.birthDate,
          operationDate: data.operationDate,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
        };
      });
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      loading = false;
    }
  }

  function createPatient() {
    goto('/patients/new');
  }

  function formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .case-id,
  .created-at {
    font-weight: 400;
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
            <div class="card-header">
              <div class="case-id">🆔 Case ID: {patient.id}</div>
              <div class="created-at">{formatDate(patient.createdAt)}</div>
            </div>
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
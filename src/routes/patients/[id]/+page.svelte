<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
  } from 'firebase/firestore';
  import { goto } from '$app/navigation';

  let patient: any = null;
  let documentation: any[] = [];
  let error = '';
  let loading = true;

  onMount(async () => {
    const db = getFirestore();
    const id = $page.params.id;
    const docRef = doc(db, 'patients', id);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        patient = docSnap.data();

        const surgeriesSnap = await getDocs(collection(docRef, 'surgeries'));
        const followupsSnap = await getDocs(collection(docRef, 'followups'));
        const promsSnap = await getDocs(collection(docRef, 'proms'));

        const allDocs = [
          ...surgeriesSnap.docs.map(d => ({ type: 'surgery', ...d.data() })),
          ...followupsSnap.docs.map(d => ({ type: 'followup', ...d.data() })),
          ...promsSnap.docs.map(d => ({ type: 'proms', ...d.data() }))
        ];

        documentation = allDocs.sort((a, b) => {
          const aDate = new Date(a.operationDate || a.followUpDate || a.createdAt?.toDate?.() || 0);
          const bDate = new Date(b.operationDate || b.followUpDate || b.createdAt?.toDate?.() || 0);
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

  function goBack() {
    goto('/dashboard');
  }

  function goTo(type: 'surgery' | 'followup' | 'proms') {
    const id = $page.params.id;
    goto(`/patients/${id}/${type}`);
  }
</script>

<style>
  .page {
    max-width: 700px;
    margin: 3rem auto;
    font-family: 'Helvetica Neue', sans-serif;
  }

  .back-btn {
    margin-bottom: 1rem;
    background: none;
    border: 1px solid #000;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .action-buttons button {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
  }

  .action-buttons button:hover {
    background-color: #333;
  }

  .card {
    background: #f5f5f3;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 600;
  }

  h2 {
    margin-top: 2rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .field {
    margin-bottom: 1rem;
  }

  .label {
    font-weight: 600;
  }
</style>

<div class="page">
  <div class="header">
    <button class="back-btn" on:click={goBack}>← Back</button>
    <div class="action-buttons">
      <button on:click={() => goTo('surgery')}>+ Surgery</button>
      <button on:click={() => goTo('followup')}>+ Follow-Up</button>
      <button on:click={() => goTo('proms')}>+ PROMs</button>
    </div>
  </div>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p style="color: red;">{error}</p>
  {:else}
    <div class="card">
      <h1>Case ID: {$page.params.id}</h1>

      <h2>🧾 Baseline</h2>
      {#each Object.entries(patient) as [key, value]}
        {#if key !== 'createdAt' && typeof value === 'string' && value !== ''}
          <div class="field"><span class="label">{key}:</span> {value}</div>
        {/if}
      {/each}
    </div>

    {#each documentation as entry}
      <div class="card">
        <h2>
          {entry.type === 'surgery' ? '🔪 Surgery' : entry.type === 'followup' ? '📆 Follow-Up' : '📋 PROM'}
          {entry.operationDate || entry.followUpDate ? ` (${entry.operationDate || entry.followUpDate})` : ''}
        </h2>

        {#each Object.entries(entry) as [key, value]}
          {#if key !== 'type' && key !== 'createdAt' && value !== '' && value !== null}
            <div class="field"><span class="label">{key}:</span> {value}</div>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</div>
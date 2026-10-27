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
  import { getAccess, authorLabel } from '$lib/access';
  import PatientList from '$lib/components/PatientList.svelte';

  const db = getFirestore();
  const auth = getAuth();

  let patients: {
    id: string;
    sex?: string;
    birthDate?: string;
    operationDate?: string;
    createdAt?: Date | null;
    enteredBy?: string;
  }[] = [];

  let loading = true;
  let error = '';

  function retryLoad() {
    loading = true;
    error = '';
    fetchPatients();
  }
  let userRole: string | null = null;

  async function fetchPatients() {
    const user = auth.currentUser;
    if (!user) {
      error = 'Please log in to view your patients.';
      loading = false;
      return;
    }

    try {
      const { isAdmin } = await getAccess(user);
      userRole = isAdmin ? 'admin' : 'user';

      let q;
      if (userRole === 'admin') {
        q = query(collection(db, 'patients'));
      } else {
        q = query(
          collection(db, 'patients'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);

      const authors = new Map<string, Promise<string>>();
      patients = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        if (isAdmin && typeof data.userId === 'string' && !authors.has(data.userId)) authors.set(data.userId, authorLabel(db, data.userId));
        return {
          id: doc.id,
          sex: data.sex,
          enteredBy: isAdmin ? await authors.get(data.userId) : undefined,
          birthDate: data.birthDate,
          operationDate: data.operationDate,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
        };
      }));
    } catch (err) {
      error = 'We could not load the patient list. Please try again.';
      console.error('Error fetching patients:', err);
    }

    loading = false;
  }

  onMount(fetchPatients);
</script>

<svelte:head><title>Patients · MediTrack</title></svelte:head>

<div class="page">
  <div class="page-heading">
    <div>
      <h1>{userRole === 'admin' ? 'All patients' : 'Your patients'}</h1>
      <p>Patient records and treatment follow-up.</p>
    </div>
    {#if userRole === 'user'}<a class="primary-action" href="/patients/new">New patient</a>{/if}
  </div>
  {#if loading}
    <div class="list-state" role="status">Loading patient records…</div>
  {:else if error}
    <div class="list-state" role="alert">
      <h2>Patient list unavailable</h2>
      <p>{error}</p>
      <button type="button" class="retry" on:click={retryLoad}>Try again</button>
    </div>
  {:else if patients.length === 0}
    <div class="list-state">
      <h2>No patient records yet</h2>
      <p>Your patient records will appear here.</p>
    </div>
  {:else}
    <p class="record-count">{patients.length} {patients.length === 1 ? 'patient record' : 'patient records'}</p>
    <PatientList {patients} />
  {/if}
</div>

<style>
  .record-count { margin: 0 0 24px; color: var(--muted); font-size: 13px; }
  .list-state { padding: 48px 0; border-top: 1px solid var(--line); color: var(--muted); line-height: 1.6; }
  .list-state h2 { margin: 0 0 10px; color: var(--ink); font-size: 20px; font-weight: 500; }
  .list-state p { margin: 0; }
  .retry { margin-top: 20px; padding: 10px 16px; min-height: 44px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--surface); cursor: pointer; }
  @media (hover: hover) and (pointer: fine) {
    .retry:hover { background: var(--hover); }
  }
</style>

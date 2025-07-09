<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/firebase';
  import { getAuth } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import { v4 as uuidv4 } from 'uuid';

  const auth = getAuth();
  let success = false;

  async function createCase() {
    const user = auth.currentUser;
    if (!user) return;

    const caseId = uuidv4();
    const baselineData = {
      createdAt: new Date(),
      gender: 'male', // placeholder – we will build the form later
      age: 22,
      location: 'gluteal',
      recurrence: false
    };

    await setDoc(doc(db, 'users', user.uid, 'cases', caseId), {
      caseId,
      ...baselineData
    });

    success = true;
  }
</script>

<h1>Neue Fallakte erstellen</h1>

<button on:click={createCase}>📦 Fall anlegen</button>

{#if success}
  <p>✅ Neuer Fall wurde erfolgreich gespeichert!</p>
{/if}
<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore } from 'firebase/firestore';
  import { operationOptions } from '$lib/clinical';
  export let patientId: string;
  export let operationId = '';
  let options: { id: string; label: string }[] = [];
  let loading = true;
  let error = '';
  onMount(async () => {
    try { options = await operationOptions(getFirestore(), patientId); }
    catch { error = 'Operations could not be loaded. Reload this page before saving.'; }
    finally { loading = false; }
  });
</script>
<div class="form-field full-width">
  <label for="assessment-operation">Operation being assessed</label>
  <select id="assessment-operation" bind:value={operationId} required disabled={loading || !!error}>
    <option value="">{loading ? 'Loading operations…' : 'Select an operation…'}</option>
    {#each options as option}<option value={option.id}>{option.label}</option>{/each}
  </select>
  {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
</div>

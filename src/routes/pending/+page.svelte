<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation';
  export let data;
  let checking = false;
  let error = '';
  async function checkApproval() {
    checking = true; error = '';
    try {
      await invalidateAll();
      if (data.user?.approved) await goto('/dashboard');
    } catch { error = 'Your approval status could not be checked. Please try again.'; }
    finally { checking = false; }
  }
</script>
<svelte:head><title>Account approval · MediTrack</title></svelte:head>
<div class="auth-page">
  <div class="page-heading"><div><h1>Account approval</h1><p>{data.user ? 'The study team must approve your account before you can access patient records or analysis.' : 'Sign in to check your account approval.'}</p></div></div>
  {#if data.user}
    <p class="field-hint">Your professional profile helps the team review your request. Registration alone does not grant access to clinical data.</p>
    <p><a href="/profile">Review your professional profile</a></p>
    <button class="primary-action" disabled={checking} on:click={checkApproval}>{checking ? 'Checking…' : 'Check approval status'}</button>
    {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
  {:else}<a class="primary-action" href="/login">Sign in</a>{/if}
</div>

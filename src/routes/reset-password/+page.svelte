<script lang="ts">
  import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
  let email = '';
  let busy = false;
  let message = '';
  let error = '';
  async function requestReset() {
    if (busy) return;
    busy = true; error = ''; message = '';
    try {
      await sendPasswordResetEmail(getAuth(), email.trim());
      message = 'If an account exists for this address, a password reset link will be sent. Check your inbox and spam folder.';
    } catch (err) {
      // Do not reveal whether an address belongs to a registered colleague.
      if ((err as { code?: string }).code === 'auth/user-not-found') message = 'If an account exists for this address, a password reset link will be sent. Check your inbox and spam folder.';
      else error = 'The request could not be completed. Check the address or try again later.';
    } finally { busy = false; }
  }
</script>
<svelte:head><title>Reset password · MediTrack</title></svelte:head>
<div class="auth-page">
  <a class="back-link" href="/login">Back to sign in</a>
  <div class="page-heading"><div><h1>Reset password</h1><p>Request a link for your MediTrack account.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={requestReset}>
    <div class="form-field"><label for="reset-email">Email</label><input id="reset-email" type="email" bind:value={email} required autocomplete="email" /></div>
    <div class="form-footer"><button class="primary-action" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></div>
    {#if message}<p class="feedback success" role="status">{message}</p>{/if}
    {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
  </form>
</div>

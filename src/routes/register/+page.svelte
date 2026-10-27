<script lang="ts">
  import { registerUser } from '#lib/firebase/auth.ts';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let title = '';
  let firstName = '';
  let lastName = '';
  let workplace = '';
  let error = '';
  let submitting = false;

  async function handleRegister() {
    if (submitting) return;
    submitting = true;
    error = '';
    try {
      await registerUser(email, password, { title, firstName, lastName, workplace });

      goto('/pending', { refreshAll: true });
    } catch {
      error = 'We could not complete registration. Check your details and try again. If an account was already created, try signing in.';
    } finally {
      submitting = false;
    }
  }
</script>
<svelte:head><title>Create account · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href="/login">Back to sign in</a>
  <div class="page-heading"><div><h1>Create your account</h1><p>Request access using your professional details. The study team must approve your account before you can access patient records.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={handleRegister}>
    <div class="form-grid"><div class="form-field"><label for="title">Title (optional)</label><input id="title" type="text" autocomplete="honorific-prefix" bind:value={title} /></div>
<div class="form-field"><label for="firstName">First name</label><input id="firstName" type="text" autocomplete="given-name" bind:value={firstName} required /></div>
<div class="form-field"><label for="lastName">Last name</label><input id="lastName" type="text" autocomplete="family-name" bind:value={lastName} required /></div>
<div class="form-field"><label for="workplace">Workplace</label><input id="workplace" type="text" autocomplete="organization" bind:value={workplace} required /></div>
<div class="form-field"><label for="email">Work email</label><input id="email" type="email" autocomplete="email" bind:value={email} required /></div>
<div class="form-field"><label for="password">Password</label><input id="password" type="password" autocomplete="new-password" bind:value={password} required minlength="6" /></div>
</div>
    <p class="field-hint">Use at least 6 characters for your password.</p>
    {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
    <div class="form-footer"><button type="submit" class="primary-action" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button></div>
  </form>
</div>

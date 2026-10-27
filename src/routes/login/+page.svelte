<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let error = '';
  let submitting = false;

  async function loginUser() {
    if (submitting) return;
    error = '';
    submitting = true;
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      goto('/dashboard', { invalidateAll: true });
    } catch {
      error = 'We could not sign you in. Check your email and password, then try again.';
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    const auth = getAuth();
    return auth.onAuthStateChanged(user => {
      if (user) goto('/dashboard', { invalidateAll: true });
    });
  });
</script>
<svelte:head><title>Sign in · MediTrack</title></svelte:head>
<div class="auth-page">
  <div class="page-heading"><div><h1>Welcome back</h1><p>Sign in to your MediTrack account.</p></div></div>
  <form class="clinical-form" on:submit|preventDefault={loginUser}>
    <div class="form-field"><label for="email">Email</label><input id="email" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" bind:value={email} required /></div>
    <div class="form-field password-field"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" bind:value={password} required /></div>
    {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
    <div class="form-footer"><button class="primary-action" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button></div>
  </form>
  <p class="account-link"><a href="/reset-password">Forgot your password?</a></p>
  <p class="account-link">New to MediTrack? <a href="/register">Create an account</a></p>
</div>
<style>.password-field { margin-top: 24px; } .primary-action { width: 100%; } .account-link { margin-top: 28px; color: var(--muted); font-size: 14px; text-align: center; }</style>

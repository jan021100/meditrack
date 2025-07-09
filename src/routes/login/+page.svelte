<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let error = '';

  async function loginUser() {
    error = '';
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message || 'Login failed';
    }
  }

  onMount(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      if (user) goto('/dashboard');
    });
  });
</script>

<style>
  .container {
    max-width: 400px;
    margin: 4rem auto;
    padding: 3rem 2rem;
    background: #f5f5f3;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
    font-family: 'Helvetica Neue', sans-serif;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #000;
  }

  label {
    display: block;
    margin-top: 1rem;
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.25rem;
    border-radius: 12px;
    border: 1px solid #ccc;
    font-size: 1rem;
    background: white;
    box-sizing: border-box;
  }

  button {
    margin-top: 2rem;
    width: 100%;
    padding: 0.9rem;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #333;
  }

  .error {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }

  .register-link {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.95rem;
  }

  .register-link a {
    color: #000;
    font-weight: 500;
    text-decoration: underline;
  }

  .register-link a:hover {
    color: #444;
  }
</style>

<div class="container">
  <h1>Login</h1>

  <form on:submit|preventDefault={loginUser}>
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} required />

    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} required />

    <button type="submit">➡ Login</button>
  </form>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <p class="register-link">
    No account yet?
    <a href="/register">Register here</a>
  </p>
</div>
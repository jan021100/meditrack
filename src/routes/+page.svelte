<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth, signOut } from 'firebase/auth';

  export let data;

  async function logout() {
    const auth = getAuth();
    await signOut(auth);
    goto('/login');
  }
</script>

<style>
  main {
    max-width: 960px;
    margin: 4rem auto;
    padding: 2rem;
    font-family: 'Helvetica Neue', sans-serif;
    color: #1a1a1a;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }

  .hero p {
    font-size: 1.25rem;
    color: #555;
    max-width: 600px;
    margin: 0 auto;
  }

  .card {
    background: #f5f5f3;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    text-align: center;
  }

  .status {
    font-size: 1.15rem;
    margin-bottom: 2rem;
  }

  .nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  button, a {
    font-size: 1rem;
    font-weight: 500;
    background-color: #000;
    color: #fff;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button:hover, a:hover {
    background-color: #333;
  }

  .small-text {
    font-size: 0.85rem;
    color: #777;
    margin-top: 2rem;
  }
</style>

<main>
  <div class="hero">
    <h1>MediTrack</h1>
    <p>Your minimalistic assistant for documenting surgeries, follow-ups, and outcomes — built by doctors for doctors.</p>
  </div>

  <div class="card">
    {#if data.user}
      <p class="status">✅ Logged in as <strong>{data.user.email}</strong></p>
      <div class="nav">
        <a href="/dashboard">Go to Dashboard</a>
        <button on:click={logout}>Logout</button>
      </div>
    {:else}
      <p class="status">🚫 You are not logged in.</p>
      <div class="nav">
        <button on:click={() => goto('/login')}>Login</button>
        <button on:click={() => goto('/register')}>Register</button>
      </div>
    {/if}
  </div>

  <p class="small-text">Built with ♥ for medical professionals</p>
</main>
<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth, signOut } from 'firebase/auth';

  export let data;
  const user = data.user;

  async function logout() {
    const auth = getAuth();
    await signOut(auth);
    goto('/login');
  }
</script>

<style>
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f5f5f3;
    padding: 1rem 2rem;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 0.95rem;
    border-bottom: 1px solid #ddd;
  }

  .user-info {
    color: #000;
    font-weight: 500;
  }

  .logout-button {
    background: none;
    border: 1px solid #000;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    font-weight: 500;
    cursor: pointer;
  }

  .logout-button:hover {
    background-color: #000;
    color: #fff;
  }

  main {
    padding: 2rem;
    font-family: 'Helvetica Neue', sans-serif;
  }
</style>

{#if user}
  <div class="topbar">
    <div class="user-info">Logged in as {user.email} <span style="opacity: 0.6">({user.role})</span></div>
    <button class="logout-button" on:click={logout}>🔒 Logout</button>
  </div>
{:else}
  <div class="topbar">
    <div class="user-info">Not logged in</div>
  </div>
{/if}

<main>
  <slot />
</main>
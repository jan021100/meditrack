<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth, signOut } from 'firebase/auth';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import { onMount } from 'svelte';

  export let data;
  const authUser = data.user;
  const auth = getAuth();
  const db = getFirestore();

  let showMenu = false;

  let fullUser: {
    title?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  } = {};

  async function logout() {
    await signOut(auth);
    goto('/login');
  }

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function goToProfile() {
    goto('/profile');
    showMenu = false;
  }

  function goToSettings() {
    goto('/settings');
    showMenu = false;
  }

  onMount(async () => {
    if (!authUser) return;
    try {
      const userRef = doc(db, 'users', authUser.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        fullUser = snapshot.data() as typeof fullUser;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  });
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
    position: relative;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .user-name {
    font-weight: 600;
    color: #000;
  }

  .avatar-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .avatar-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #ccc;
  }

  .dropdown {
    position: absolute;
    right: 2rem;
    top: 4.5rem;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 180px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .dropdown button {
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    font-family: inherit;
  }

  .dropdown button:hover {
    background-color: #f5f5f5;
  }

  main {
    padding: 2rem;
    font-family: 'Helvetica Neue', sans-serif;
  }

  .spacer {
    flex: 1;
  }

  .logo {
    height: 40px;
  }
</style>

{#if authUser}
  <div class="topbar">
    <div role="button" tabindex="0" on:click={() => goto('/dashboard')} on:keydown={(e) => e.key === 'Enter' && goto('/dashboard')}>
  <img src="/logo.png" alt="MediTrack Logo" class="logo" style="cursor: pointer;" />
</div>

    <div class="spacer" />

    <div class="user-section">
      <div class="user-name">
        {#if fullUser.firstName}
          {#if fullUser.title}
            <span style="font-weight: normal;">{fullUser.title}</span>&nbsp;
          {/if}
          {fullUser.firstName} {fullUser.lastName}
        {:else}
          {authUser.email}
        {/if}
      </div>

      <button class="avatar-button" on:click={toggleMenu}>
        <img
          src={fullUser.avatar || '/avatars/maleMedicalStudent.png'}
          alt="Avatar"
          class="avatar-img"
        />
      </button>

      {#if showMenu}
        <div class="dropdown">
          <button on:click={goToProfile}>📝 Edit Profile</button>
          <button on:click={goToSettings}>⚙️ Settings</button>
          <button on:click={logout}>🔒 Logout</button>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="topbar">
    <div class="user-name">Not logged in</div>
  </div>
{/if}

<main>
  <slot />
</main>
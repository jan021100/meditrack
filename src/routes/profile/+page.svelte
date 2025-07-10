<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { goto } from '$app/navigation';

  const db = getFirestore();
  const auth = getAuth();

  let title = '';
  let firstName = '';
  let lastName = '';
  let workplace = '';
  let avatar = '';
  let loading = true;
  let saving = false;

  let error = '';
  let success = '';

  const avatarOptions = [
    '/avatars/femaleMedicalStudent.png',
    '/avatars/femaleJuniorDoctor.png',
    '/avatars/femaleSeniorDoctor.png',
    '/avatars/maleMedicalStudent.png',
    '/avatars/maleJuniorDoctor.png',
    '/avatars/maleSeniorDoctor.png'
  ];

  onMount(async () => {
    const user = auth.currentUser;
    if (!user) {
      goto('/login');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      title = data.title || '';
      firstName = data.firstName || '';
      lastName = data.lastName || '';
      workplace = data.workplace || '';
      avatar = data.avatar || '';
    }

    loading = false;
  });

  async function saveProfile() {
    const user = auth.currentUser;
    if (!user) return;

    saving = true;
    error = '';
    success = '';

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        title,
        firstName,
        lastName,
        workplace,
        avatar
      });
      success = '✅ Profile saved successfully.';
    } catch (e) {
      error = '❌ Error saving profile.';
    }

    saving = false;
  }
</script>

<style>
  .profile-container {
    max-width: 500px;
    margin: 2rem auto;
    font-family: 'Helvetica Neue', sans-serif;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-top: 1rem;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    margin-top: 0.3rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .avatar-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .avatar-img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
  }

  .avatar-img.selected {
    border-color: #000;
  }

  .save-btn {
    margin-top: 2rem;
    background-color: #000;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .save-btn:hover {
    background-color: #333;
  }

  .status {
    margin-top: 1rem;
    font-weight: 500;
  }

  .success {
    color: green;
  }

  .error {
    color: red;
  }

  .back-btn {
    background: transparent;
    color: #000;
    border: 1px solid #aaa;
    border-radius: 6px;
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-bottom: 1.5rem;
  }

  .back-btn:hover {
    background: #f0f0f0;
  }
</style>

<div class="profile-container">
  <button class="back-btn" on:click={() => goto('/dashboard')}>← Back</button>

  <h1>👤 Edit Profile</h1>

  {#if loading}
    <p>⏳ Loading profile...</p>
  {:else}
    <form on:submit|preventDefault={saveProfile}>
      <label for="title">Title (optional)</label>
      <input id="title" type="text" bind:value={title} placeholder="e.g., Dr. med." />

      <label for="firstName">First Name</label>
      <input id="firstName" type="text" bind:value={firstName} required />

      <label for="lastName">Last Name</label>
      <input id="lastName" type="text" bind:value={lastName} required />

      <label for="workplace">Workplace</label>
      <input id="workplace" type="text" bind:value={workplace} required />

      <label>Choose Avatar</label>
      <div class="avatar-grid">
        {#each avatarOptions as option}
          <img
            src={option}
            alt="Avatar"
            class="avatar-img {avatar === option ? 'selected' : ''}"
            on:click={() => avatar = option}
          />
        {/each}
      </div>

      <button class="save-btn" type="submit" disabled={saving}>
        {saving ? 'Saving...' : '💾 Save'}
      </button>

      {#if error}
        <p class="status error">{error}</p>
      {/if}
      {#if success}
        <p class="status success">{success}</p>
      {/if}
    </form>
  {/if}
</div>
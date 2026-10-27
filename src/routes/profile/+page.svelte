<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuth, sendEmailVerification, reload } from 'firebase/auth';
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
  let verified = false;
  let verificationBusy = false;
  let verificationMessage = '';
  async function verifyEmail() {
    if (!auth.currentUser || verificationBusy) return;
    verificationBusy = true;
    try { await sendEmailVerification(auth.currentUser); verificationMessage = 'Verification link requested. Check your inbox and spam folder.'; }
    catch { verificationMessage = 'Verification could not be requested. Please try again later.'; }
    finally { verificationBusy = false; }
  }
  async function checkVerification() {
    if (!auth.currentUser) return;
    try { await reload(auth.currentUser); verified = auth.currentUser.emailVerified; }
    catch { verificationMessage = 'Verification status could not be refreshed. Please try again.'; }
  }

  const avatarOptions = [
    { src: '/avatars/femaleMedicalStudent.png', label: 'Female medical student' },
    { src: '/avatars/femaleJuniorDoctor.png', label: 'Female junior doctor' },
    { src: '/avatars/femaleSeniorDoctor.png', label: 'Female senior doctor' },
    { src: '/avatars/maleMedicalStudent.png', label: 'Male medical student' },
    { src: '/avatars/maleJuniorDoctor.png', label: 'Male junior doctor' },
    { src: '/avatars/maleSeniorDoctor.png', label: 'Male senior doctor' }
  ];

  onMount(async () => {
    const user = auth.currentUser;
    if (!user) {
      goto('/login');
      return;
    }

    verified = user.emailVerified;
    try {
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

    } catch {
      error = 'We could not load your profile. Please reload the page.';
    }
    loading = false;
  });

  async function saveProfile() {
    const user = auth.currentUser;
    if (!user || saving) return;

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
      success = ' Profile saved successfully.';
    } catch (e) {
      error = ' Error saving profile.';
    }

    saving = false;
  }
</script>
<svelte:head><title>Your profile · MediTrack</title></svelte:head>


<div class="form-page">
  <a class="back-link" href="/dashboard">Back to patients</a>

  <div class="page-heading"><div><h1>Your profile</h1><p>Your professional details and account avatar.</p></div></div>

  {#if loading}
    <p role="status">Loading profile…</p>
  {:else if error && !firstName}
    <p class="feedback error" role="alert">{error}</p>
  {:else}
    <section aria-label="Account verification">
      <p>Email status: {verified ? 'Verified' : 'Not yet verified'}. Email verification does not verify professional credentials.</p>
      {#if !verified}<button type="button" class="secondary-action" disabled={verificationBusy} on:click={verifyEmail}>Send verification link</button> <button type="button" class="secondary-action" on:click={checkVerification}>Check verification</button>{/if}
      {#if verificationMessage}<p role="status">{verificationMessage}</p>{/if}
    </section>
    <form class="clinical-form" on:submit|preventDefault={saveProfile}>
<div class="form-grid">      <div class="form-field"><label for="title">Title (optional)</label>
      <input id="title" type="text" bind:value={title} placeholder="e.g., Dr. med." /></div>

      <div class="form-field"><label for="firstName">First name</label>
      <input id="firstName" type="text" bind:value={firstName} required /></div>

      <div class="form-field"><label for="lastName">Last name</label>
      <input id="lastName" type="text" bind:value={lastName} required /></div>

      <div class="form-field"><label for="workplace">Workplace</label>
      <input id="workplace" type="text" bind:value={workplace} required /></div>

</div>      <fieldset class="avatar-fieldset">
        <legend>Choose avatar</legend>
        <div class="avatar-grid">
        {#each avatarOptions as option}
          <button
            type="button"
            class="avatar-choice"
            aria-label={`Select ${option.label} avatar`}
            aria-pressed={avatar === option.src}
            on:click={() => avatar = option.src}
          >
            <img
              src={option.src}
              alt=""
              class="avatar-img"
            />
          </button>
        {/each}
        </div>
      </fieldset>

      <button class="primary-action" type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save profile'}
      </button>

      {#if error}
        <p class="feedback error" role="alert">{error}</p>
      {/if}
      {#if success}
        <p class="feedback success" role="status">{success}</p>
      {/if}
    </form>
  {/if}
</div>
<style>
  .avatar-fieldset { border: 0; border-top: 1px solid var(--line); padding: 28px 0; margin: 32px 0 0; min-width: 0; }
  legend { padding: 0 12px 0 0; color: var(--muted); font-size: 14px; }
  .avatar-grid { display: flex; gap: 16px; flex-wrap: wrap; }
  .avatar-choice { display: flex; padding: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; cursor: pointer; }
  .avatar-choice[aria-pressed="true"] { border: 2px solid var(--accent); padding: 3px; background: var(--hover); }
  .avatar-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
</style>

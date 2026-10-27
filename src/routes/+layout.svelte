<script lang="ts">
  import '$lib/styles.css';
  import { clearCaseDraft } from '$lib/stores/caseStore';
  import { isLocalTest } from '$lib/firebase/firebase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  export let data;
  $: authUser = data.user;
  const auth = getAuth();
  const db = getFirestore();


  let accountOpen = false;
  let accountElement: HTMLDetailsElement;
  let avatarFailed = false;

  function dismissAccount(event: MouseEvent) {
    if (accountOpen && accountElement && !event.composedPath().includes(accountElement)) closeAccount();
  }

  function accountKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && accountOpen) {
      closeAccount();
      accountElement?.querySelector('summary')?.focus();
    }
  }

  function closeAccount() {
    accountOpen = false;
  }

  let fullUser: {
    title?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  } = {};

  async function logout() {
    closeAccount();
    clearCaseDraft(); // Remove clinical state before the asynchronous sign-out completes.
    await signOut(auth);
  }

  // External sign-out or account changes must also discard already rendered patient pages.
  onMount(() => {
    let previousUid = data.user?.uid ?? null;
    return onAuthStateChanged(auth, user => {
      const uid = user?.uid ?? null;
      if (uid === previousUid) return;
      const hadIdentity = previousUid !== null;
      previousUid = uid;
      closeAccount(); fullUser = {};
      // A fresh document also discards Firestore’s in-memory cache from the previous account.
      if (hadIdentity) window.location.replace(user ? '/dashboard' : '/login');
      else goto(user ? '/dashboard' : '/login', { invalidateAll: true, replaceState: true });
    });
  });

  let loadedUid = '';
  $: if (browser) loadIdentity(authUser?.uid ?? '');
  async function loadIdentity(uid: string) {
    if (uid === loadedUid) return;
    loadedUid = uid; fullUser = {}; avatarFailed = false;
    if (!uid) return;
    try {
      const snapshot = await getDoc(doc(db, 'users', uid));
      if (loadedUid === uid && snapshot.exists()) fullUser = snapshot.data() as typeof fullUser;
    } catch { /* The authenticated email remains a usable fallback. */ }
  }

</script>

<svelte:window on:click={dismissAccount} on:keydown={accountKey} on:pageshow={event => { if (event.persisted) window.location.reload(); }} />
<a class="skip-link" href="#main-content">Skip to content</a>
{#if isLocalTest}
  <div role="status" style="padding: 10px 20px; background: #e5eeea; color: #314a40; text-align: center; font-size: 14px;">Local test environment · Test data only · Separate from production patients</div>
{/if}
<header class="topbar">
  <div class="header-inner">
    <a class="brand" href={authUser ? '/dashboard' : '/'} aria-label="MediTrack home">MediTrack<span class="brand-dot" aria-hidden="true"></span></a>
    {#if authUser}
      <nav aria-label="Main navigation">{#if authUser.approved}<a class="nav-link" href="/dashboard" aria-current={$page.url.pathname.startsWith('/patients') || $page.url.pathname === '/dashboard' ? 'page' : undefined}>Patients</a><a class="nav-link" href="/analysis" aria-current={$page.url.pathname === '/analysis' ? 'page' : undefined}>Analysis</a>{:else}<a class="nav-link" href="/pending">Account approval</a>{/if}{#if authUser.role === 'admin'}<a class="nav-link" href="/admin/users" aria-current={$page.url.pathname === '/admin/users' ? 'page' : undefined}>Team</a>{/if}</nav>
      <details class="account" bind:this={accountElement} bind:open={accountOpen}>
        <summary aria-label="Open account options">
          <span class="user-name" title={fullUser.firstName ? `${fullUser.title || ''} ${fullUser.firstName} ${fullUser.lastName || ''}`.trim() : authUser.email || 'Account'}>{fullUser.firstName ? `${fullUser.title ? fullUser.title + ' ' : ''}${fullUser.firstName} ${fullUser.lastName || ''}` : authUser.email}</span>
          {#if avatarFailed}<span class="avatar-fallback" aria-hidden="true">MT</span>{:else}
            <img src={fullUser.avatar || '/avatars/maleMedicalStudent.png'} alt="" class="avatar-img" width="36" height="36" on:error={() => avatarFailed = true} />
          {/if}
        </summary>
        <div class="dropdown">
          <a href="/profile" on:click={closeAccount}>Edit profile</a>
          <a href="/settings" on:click={closeAccount}>Settings</a>
          <button type="button" on:click={logout}>Log out</button>
        </div>
      </details>
    {:else}
      <a class="signed-out" href="/login">Sign in</a>
    {/if}
  </div>
</header>
<main id="main-content" tabindex="-1">{#key authUser?.uid}<slot />{/key}</main>

<style>
  nav[aria-label="Main navigation"] { display: flex; gap: 20px; align-items: center; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--line); }
  .header-inner { max-width: 1232px; margin: 0 auto; min-height: 88px; padding: calc(20px + env(safe-area-inset-top, 0px)) max(40px, env(safe-area-inset-right, 0px)) 20px max(40px, env(safe-area-inset-left, 0px)); display: flex; align-items: center; gap: 48px; }
  .brand { display: inline-flex; align-items: baseline; gap: 4px; font-size: 25px; font-weight: 600; letter-spacing: -0.035em; text-decoration: none; }
  .brand-dot { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; }
  .nav-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--muted); font-weight: 500; font-size: 14px; text-decoration: none; padding: 10px 0; border-bottom: 1px solid transparent; }
  .nav-link[aria-current="page"] { color: var(--accent); border-color: var(--accent); }
  .account { min-width: 0; position: relative; margin-left: auto; }
  summary { min-width: 0; display: flex; align-items: center; gap: 14px; min-height: 44px; cursor: pointer; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  .user-name { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
  .avatar-fallback { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; background: var(--hover); font-size: 12px; font-weight: 600; }
  .avatar-img { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: var(--hover); }
  .dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 190px; padding: 8px; border-radius: 6px; background: var(--surface); box-shadow: 0 8px 28px rgb(36 41 37 / 12%); z-index: 10; }
  .dropdown a, .dropdown button { display: block; width: 100%; border: 0; background: none; padding: 12px; text-align: left; text-decoration: none; font-size: 14px; color: var(--ink); cursor: pointer; border-radius: 3px; }
  @media (hover: hover) and (pointer: fine) {
    .dropdown a:hover, .dropdown button:hover { background: var(--hover); }
  }
  .signed-out { margin-left: auto; color: var(--muted); font-size: 14px; }
  main { padding: 48px max(40px, env(safe-area-inset-right, 0px)) calc(80px + env(safe-area-inset-bottom, 0px)) max(40px, env(safe-area-inset-left, 0px)); }
  @media (max-width: 600px) {
    .header-inner { display: grid; grid-template-columns: minmax(0, 1fr) auto; min-height: 76px; gap: 8px 16px; padding: calc(16px + env(safe-area-inset-top, 0px)) max(20px, env(safe-area-inset-right, 0px)) 16px max(20px, env(safe-area-inset-left, 0px)); }
    nav[aria-label="Main navigation"] { grid-column: 1 / -1; grid-row: 2; gap: 24px; }
    .account { grid-column: 2; grid-row: 1; }
    .brand { font-size: 23px; }
    .user-name { display: none; }
    main { padding: 28px max(20px, env(safe-area-inset-right, 0px)) calc(56px + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left, 0px)); }
  }
</style>

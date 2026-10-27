<script lang="ts">
  import { onMount } from 'svelte';
  import { getAccess } from '$lib/access';
  import { collection, doc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
  type Member = { uid: string; name: string; email: string; workplace: string; approved: boolean; currentAdmin: boolean };
  let members: Member[] = [];
  let loading = true;
  let saving = '';
  let error = '';
  const text = (value: unknown) => typeof value === 'string' ? value : '';
  async function load() {
    loading = true; error = '';
    try {
      const access = await getAccess();
      if (!access.isAdmin) throw new Error('Administrator access required.');
      const db = getFirestore();
      const [profiles, approvals] = await Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'memberships'))]);
      const approved = new Set(approvals.docs.filter(item => item.data().approved === true).map(item => item.id));
      members = profiles.docs.map(item => {
        const profile = item.data();
        return { uid: item.id, name: [profile.title, profile.firstName, profile.lastName].map(text).filter(Boolean).join(' ') || 'Name not recorded', email: text(profile.email), workplace: text(profile.workplace), approved: approved.has(item.id), currentAdmin: item.id === access.user.uid };
      }).sort((a, b) => Number(a.approved) - Number(b.approved) || a.name.localeCompare(b.name));
    } catch { members = []; error = 'Team accounts could not be loaded. Administrator access is required.'; }
    finally { loading = false; }
  }
  async function setApproval(member: Member) {
    if (saving) return;
    saving = member.uid; error = '';
    try {
      const access = await getAccess();
      if (!access.isAdmin) throw new Error('Administrator access required.');
      await setDoc(doc(getFirestore(), 'memberships', member.uid), { approved: !member.approved, approvedBy: access.user.uid, approvedAt: serverTimestamp() });
      member.approved = !member.approved;
      members = [...members];
    } catch { error = 'Approval could not be saved. Please try again.'; }
    finally { saving = ''; }
  }
  onMount(load);
</script>
<svelte:head><title>Team access · MediTrack</title></svelte:head>
<div class="page">
  <div class="page-heading"><div><h1>Team access</h1><p>Approve colleagues after checking their identity, study participation and institutional authorisation.</p></div></div>
  <p class="field-hint">Approval permits access to the clinician’s own records. It does not grant administrator rights. Revoking approval blocks further clinical reads and writes; records remain stored. Administrator claims retain read-only clinical access independently.</p>
  {#if error}<p class="feedback error" role="alert">{error}</p>{/if}
  {#if loading}<p role="status">Loading team accounts…</p>
  {:else if members.length}
    <ul class="members">{#each members as member (member.uid)}
      <li><div><h2>{member.name}</h2><p>{member.email || 'Email not recorded'}</p><p>{member.workplace || 'Workplace not recorded'}</p></div>{#if member.currentAdmin}<span class="status">Administrator</span><span class="field-hint">Read-only clinical access</span>{:else}<span class="status">{member.approved ? 'Approved' : 'Not approved'}</span><button class="secondary-action" disabled={!!saving} on:click={() => setApproval(member)}>{saving === member.uid ? 'Saving…' : member.approved ? 'Revoke access' : 'Approve access'}</button>{/if}</li>
    {/each}</ul>
  {:else if !error}<p>No registered profiles found.</p>{/if}
  {#if error}<button class="secondary-action" on:click={load}>Try again</button>{/if}
</div>
<style>
  .members { margin: 32px 0 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
  li { display: grid; grid-template-columns: minmax(0, 1fr) 110px 140px; align-items: start; gap: 24px; padding: 24px 0; border-bottom: 1px solid var(--line); }
  h2 { margin: 0 0 8px; font-size: 16px; font-weight: 500; }
  p { margin: 4px 0; color: var(--muted); overflow-wrap: anywhere; font-size: 14px; }
  .status { font-size: 14px; color: var(--muted); }
  @media(max-width:600px) { li { grid-template-columns: minmax(0, 1fr) auto; gap: 16px; } li > div { grid-column: 1 / -1; } li > button { max-width: 160px; } }
</style>

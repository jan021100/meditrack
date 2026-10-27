<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  let ready = $state(false);
  onMount(() => { ready = true; });
  import { goto } from '$app/navigation';
  import PatientList from '#lib/components/PatientList.svelte';
  import RecordFields from '#lib/components/RecordFields.svelte';

  const states = ['Demo data', 'Worst case', 'Empty', 'One', '1,000 rows'];
  const mode = $derived(Math.max(0, states.indexOf(page.url.searchParams.get('data') || 'Demo data')));
  const demo = [{ id: 'DEMO-001', sex: 'female', birthDate: '1985-04-12', operationDate: '2025-06-01', createdAt: new Date('2025-06-02T12:00:00Z') }];
  const worst = [
    { id: 'Study-North-West-2026-site-023-participant-00000001284', sex: 'Not recorded in the original dataset', birthDate: '2025-02-30', operationDate: '', createdAt: null },
    { id: 'DEMO-王秀英-002', sex: '', birthDate: '', operationDate: '2025-06-01', createdAt: new Date('invalid') },
    { id: 'DEMO-003', sex: 'female', birthDate: '1970-01-01', operationDate: '2025-12-31', createdAt: new Date('2025-12-31T23:30:00-08:00') }
  ];
  const patients = $derived(mode === 1 ? worst : mode === 2 ? [] : mode === 4
    ? Array.from({length: 1000}, (_, index) => ({ ...demo[0], id: `DEMO-${String(index + 1).padStart(5, '0')}` })) : demo);
  const record = $derived(mode === 1 ? {
    surgeonName: 'Aleksandra Wiśniewska-Kowalczyk',
    workplace: 'Department of Colorectal Surgery, North-West Regional University Hospital',
    comments: 'Line one: <b>plain text only</b>.\nSecond line: https://example.com/research/clinical-documentation/long-reference-without-spaces-00000001284',
    previousSurgeries: 0, recurrence: false, hospitalDays: Number.NaN
  } : { surgeonName: 'Jo', previousSurgeries: 0, recurrence: false, comments: 'Synthetic demonstration data.' });

  function setMode(value: string) {
    goto(`?data=${encodeURIComponent(value)}`, { replace: true, reset: false });
  }

  function blockSyntheticNavigation(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('a[href*="/patients/DEMO"], a[href*="/patients/Study-"]')) event.preventDefault();
  }
</script>

<svelte:head><title>UI test fixtures · MediTrack</title></svelte:head>
<svelte:window onclick={blockSyntheticNavigation} />
<div class="page fixture">
  <div class="page-heading"><div><h1>UI test fixtures</h1><p>Synthetic data only. No data is saved. Available in local development only.</p></div></div>
  <section><h2>Patient list</h2><p>{patients.length.toLocaleString('en-GB')} {patients.length === 1 ? 'patient record' : 'patient records'}</p><PatientList {patients} /></section>
  <section><h2>Record fields</h2><RecordFields {record} /></section>
  <section class="form-page"><h2>Form controls</h2>
    <form onsubmit={event => event.preventDefault()}>
      <div class="form-grid">
        <div class="form-field"><label for="fixture-name">Full name</label><input id="fixture-name" value={mode === 1 ? 'Aleksandra Wiśniewska-Kowalczyk' : 'Jo'} /></div>
        <div class="form-field"><label for="fixture-email">Work email</label><input id="fixture-email" type="email" value={mode === 1 ? 'bartholomew.fitzgerald@northwind-industries-holdings.example.com' : 'jo@example.com'} /></div>
        <div class="form-field full-width"><label for="fixture-notes">Clinical notes</label><textarea id="fixture-notes" rows="4" value={String(record.comments)}></textarea></div>
      </div>
      <div class="form-footer"><button type="submit" class="primary-action">Test button feedback</button><p class="field-hint">This button only tests the interface. It has no save action.</p></div>
    </form>
  </section>
</div>
<div class="test-switcher" role="group" aria-label="Test data">
  {#each states as state, index}<button type="button" disabled={!ready} aria-pressed={mode === index} onclick={() => setMode(state)}>{state}</button>{/each}
</div>
<style>
  .fixture { padding-bottom: 80px; }
  section { margin-top: 40px; }
  h2 { font-size: 22px; font-weight: 600; }
  section > p { color: var(--muted); }
  .test-switcher { position: fixed; inset: auto 16px 16px; width: max-content; max-width: calc(100% - 32px); margin: auto; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; padding: 6px; border-radius: 12px; background: #e6e6e6; box-shadow: 0 4px 20px rgb(0 0 0 / 12%); z-index: 30; }
  .test-switcher button { min-height: 40px; padding: 8px 12px; background: transparent; color: #333; border: 0; border-radius: 7px; cursor: pointer; font-size: 13px; }
  .test-switcher button[aria-pressed='true'] { background: #fff; }
</style>

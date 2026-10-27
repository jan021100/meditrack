<script lang="ts">
  export let patients: {
    id: string;
    sex?: string;
    birthDate?: string;
    operationDate?: string;
    createdAt?: Date | null;
    enteredBy?: string;
  }[] = [];

  const pageSize = 25;
  let currentPage = 0;
  $: pageCount = Math.max(1, Math.ceil(patients.length / pageSize));
  $: if (currentPage >= pageCount) currentPage = pageCount - 1;
  $: visiblePatients = patients.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  function formatDate(value: string | Date | null | undefined): string {
    if (!value) return 'Not recorded';
    if (typeof value !== 'string' && !(value instanceof Date)) return 'Not recorded';
    if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Not recorded';
    const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
    if (Number.isNaN(date.getTime())) return 'Not recorded';
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return 'Not recorded';
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
</script>

<div class="list-heading" aria-hidden="true">
  <span>Case ID</span><span>Sex</span><span>Birth date</span><span>Initial surgery</span><span>Added</span><span></span>
</div>
{#if patients.length === 0}<p class="empty-list">No patient records to display.</p>{/if}
<ul class="patient-list" aria-label="Patient cases">
  {#each visiblePatients as patient}
    <li>
      <a class="patient-row" href={`/patients/${encodeURIComponent(patient.id)}`}>
        <span class="case-id"><span class="mobile-label">Case ID</span>{patient.id}{#if patient.enteredBy}<small class="recorder">Entered by {patient.enteredBy}</small>{/if}</span>
        <span class="sex"><span class="mobile-label">Sex</span>{patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : 'Not recorded'}</span>
        <span><span class="mobile-label">Birth date</span>{formatDate(patient.birthDate)}</span>
        <span><span class="mobile-label">Initial surgery</span>{formatDate(patient.operationDate)}</span>
        <span class="added"><span class="mobile-label">Added</span>{formatDate(patient.createdAt)}</span>
        <svg class="row-arrow" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 5 7 7-7 7" /></svg>
      </a>
    </li>
  {/each}
</ul>
{#if pageCount > 1}
  <nav class="pagination" aria-label="Patient list pages">
    <button type="button" class="secondary-action" disabled={currentPage === 0} on:click={() => currentPage -= 1}>Previous</button>
    <span aria-live="polite">Page {currentPage + 1} of {pageCount}</span>
    <button type="button" class="secondary-action" disabled={currentPage + 1 >= pageCount} on:click={() => currentPage += 1}>Next</button>
  </nav>
{/if}

<style>
  .recorder { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; line-height: 1.5; font-weight: 400; }
  .list-heading, .patient-row { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 0.65fr) repeat(3, minmax(0, 1fr)) 18px; gap: 24px; align-items: start; }
  .patient-row > span { min-width: 0; overflow-wrap: anywhere; }
  .pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; font-size: 13px; }
  .empty-list { color: var(--muted); }
  .list-heading { padding: 0 20px 14px; color: var(--muted); font-size: 13px; }
  .patient-list { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--line); }
  li { border-bottom: 1px solid var(--line); }
  .patient-row { padding: 26px 20px; min-height: 84px; text-decoration: none; font-size: 14px; font-variant-numeric: tabular-nums; }
  @media (hover: hover) and (pointer: fine) {
    .patient-row:hover { background: var(--hover); }
  }
  .case-id { font-weight: 500; overflow-wrap: anywhere; }
  .added, .row-arrow { color: var(--muted); }
  .mobile-label { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (max-width: 850px) {
    .list-heading { display: none; }
    .patient-row { position: relative; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; padding: 24px 16px; }
    .case-id { grid-column: 1 / -1; padding-right: 28px; }
    .mobile-label { position: static; width: auto; height: auto; margin: 0; overflow: visible; clip-path: none; white-space: normal; display: block; margin-bottom: 6px; font-size: 12px; font-weight: 400; color: var(--muted); }
    .row-arrow { position: absolute; right: 16px; top: 34px; }
  }
</style>

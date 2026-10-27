<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuth } from 'firebase/auth';
  import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
  import { isLocalTest } from '#lib/firebase/firebase.ts';
  import { isSynthetic, origin, summarize, type AnalysisCase } from '#lib/analysis/summary.ts';

  let records: AnalysisCase[] = [];
  let loading = true;
  let error = '';
  let scope = isLocalTest ? 'literature' : 'regular';
  let source = '';
  let access = 'your own accessible cases';
  $: eligible = records.filter(item => !isSynthetic(item.patient));
  $: cohort = eligible.filter(item => origin(item.patient) === scope);
  $: sources = [...new Set(cohort.map(item => String(item.patient.sourceDoi ?? 'Unspecified')))].sort();
  $: selected = cohort.filter(item => !source || String(item.patient.sourceDoi ?? 'Unspecified') === source);
  $: summary = summarize(selected);
  $: rows = [{ label: 'Reported age / age at index surgery (years)', value: summary.age }, { label: 'BMI', value: summary.bmi }, { label: 'Reported healing interval (days)', value: summary.healing }];
  const format = (value: number | null) => value === null ? '—' : new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value);

  async function load() {
    loading = true; error = '';
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('Please sign in to view analysis.');
      const token = await user.getIdTokenResult(true);
      const db = getFirestore();
      const admin = token.claims.role === 'admin';
      access = admin ? 'all cases permitted by database rules' : 'your own accessible cases';
      const patients = await getDocs(admin ? collection(db, 'patients') : query(collection(db, 'patients'), where('userId', '==', user.uid)));
      // Load only accessible, non-synthetic cases. A failed child read fails the whole report;
      // it must never appear as a genuine zero or silently shrink the denominator.
      records = await Promise.all(patients.docs.map(async patient => {
        const data = patient.data();
        if (isSynthetic(data)) return { id: patient.id, patient: data, surgeries: [], followups: [], proms: [] };
        const children = await Promise.all(['surgeries', 'followups', 'proms'].map(name => getDocs(collection(patient.ref, name))));
        return { id: patient.id, patient: data, surgeries: children[0].docs.map(item => item.data()), followups: children[1].docs.map(item => item.data()), proms: children[2].docs.map(item => item.data()) };
      }));
    } catch (err) {
      records = []; error = err instanceof Error && err.message.startsWith('Please sign in') ? err.message : 'Analysis could not be loaded completely. Please try again.';
    } finally { loading = false; }
  }
  onMount(load);
</script>

<svelte:head><title>Analysis · MediTrack</title></svelte:head>
<div class="page analysis-page">
  <div class="page-heading"><div><h1>Analysis</h1><p>Descriptive summaries of {access}. Each case counts once.</p></div></div>
  {#if loading}<p role="status">Loading cases and documentation…</p>
  {:else if error}<div class="feedback error" role="alert"><p>{error}</p><button class="secondary-action" on:click={load}>Try again</button></div>
  {:else}
    <div class="filters">
      <div class="form-field"><label for="analysis-scope">Dataset</label><select id="analysis-scope" bind:value={scope} on:change={() => source = ''}><option value="literature">Published literature cases</option><option value="regular">Regularly entered cases</option></select></div>
      {#if scope === 'literature'}<div class="form-field"><label for="analysis-source">Publication (DOI)</label><select id="analysis-source" bind:value={source}><option value="">All publications</option>{#each sources as doi}<option value={doi}>{doi}</option>{/each}</select></div>{/if}
    </div>
    <p class="cohort-count" aria-live="polite"><strong>{summary.count}</strong> {summary.count === 1 ? 'case selected' : 'cases selected'} · {records.length - eligible.length} synthetic or excluded records omitted</p>
    {#if scope === 'literature'}<p class="context">Selected published case reports and small series are not a representative cohort. Source inconsistencies and different healing definitions remain unresolved. Use publication filters to inspect each source separately; these results do not establish risk factors or treatment effectiveness.</p>{/if}
    {#if !summary.count}<div class="empty-state"><h2>No cases in this selection</h2><p>Choose another dataset or publication. No missing value is treated as zero.</p></div>
    {:else}
      <section aria-labelledby="summary-heading"><h2 id="summary-heading">Patient characteristics and healing</h2>
        <p class="context">Age combines reported age at presentation with age at the recorded initial operation where both dates exist. Healing uses the reported index-procedure interval, not a time-to-event estimate. Missing includes absent or invalid values.</p>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to reach and scroll the wide data table.) -->
        <div class="table-scroll" tabindex="0" role="region" aria-label="Descriptive statistics table"><table><caption>Median and range among available values; denominator is {summary.count} selected cases.</caption><thead><tr><th scope="col">Measure</th><th scope="col">Available</th><th scope="col">Missing</th><th scope="col">Median</th><th scope="col">Range</th></tr></thead><tbody>{#each rows as row}<tr><th scope="row">{row.label}</th><td>{row.value.n} / {summary.count}</td><td>{row.value.missing}</td><td>{format(row.value.median)}</td><td>{format(row.value.min)}–{format(row.value.max)}</td></tr>{/each}</tbody></table></div>
      </section>
      <section aria-labelledby="procedure-heading"><h2 id="procedure-heading">Recorded initial / published index procedures</h2><p class="context">Original labels are retained. Further operations are counted separately. Bar length represents cases, not success.</p>
        <ul class="procedure-list">{#each summary.procedures as item}<li><div><span>{item.label}</span><strong>{item.count} / {summary.count} ({format(item.count / summary.count * 100)}%)</strong></div><div class="bar-track" aria-hidden="true"><div style={`width:${item.count / summary.count * 100}%`}></div></div></li>{/each}</ul>
      </section>
      <section aria-labelledby="documentation-heading"><h2 id="documentation-heading">Available documentation</h2><dl class="documentation"><div><dt>Further operation records</dt><dd>{summary.furtherSurgeries}</dd></div><div><dt>Follow-up records</dt><dd>{summary.followups}</dd></div><div><dt>PROM records</dt><dd>{summary.promRecords}</dd></div><div><dt>Legacy PROM records with uncertain defaults</dt><dd>{summary.legacyPromRecords}</dd></div><div><dt>Explicit current-pain responses (new format)</dt><dd>{summary.answeredPainToday}</dd></div></dl><p class="context">Documentation counts are records, not independent patients. Legacy PROM scores are not pooled with explicit new answers. Recurrence rates and procedure comparisons need agreed definitions, follow-up times and operation linkage before calculation.</p></section>
      <section aria-labelledby="sources-heading"><h2 id="sources-heading">Included cases and provenance</h2><ul class="source-list">{#each selected as item}<li><a href={`/patients/${encodeURIComponent(item.id)}`}>{item.id}</a><span>{item.patient.sourceCase ?? 'Locally entered record'}</span>{#if typeof item.patient.sourceDoi === 'string'}<a href={`https://doi.org/${encodeURIComponent(item.patient.sourceDoi)}`} target="_blank" rel="noopener noreferrer">{item.patient.sourceDoi}</a>{/if}{#if item.patient.sourceQualityNotes}<p>{String(item.patient.sourceQualityNotes)}</p>{/if}</li>{/each}</ul></section>
    {/if}
  {/if}
</div>
<style>
  .filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; max-width: 840px; }
  .cohort-count { margin: 28px 0 16px; font-size: 16px; }
  .context { max-width: 72ch; color: var(--muted); font-size: 14px; line-height: 1.7; }
  section, .empty-state { border-top: 1px solid var(--line); margin-top: 36px; padding-top: 28px; }
  h2 { font-size: 22px; font-weight: 500; margin: 0 0 16px; letter-spacing: -0.015em; }
  .table-scroll { overflow-x: auto; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
  caption { text-align: left; color: var(--muted); margin-bottom: 16px; }
  th, td { text-align: left; padding: 16px 12px; border-bottom: 1px solid var(--line); }
  thead th { color: var(--muted); font-weight: 500; } tbody th { font-weight: 500; }
  .procedure-list, .source-list { list-style: none; padding: 0; }
  .procedure-list li { padding: 16px 0; }
  .procedure-list li > div:first-child { display: flex; gap: 20px; justify-content: space-between; font-size: 14px; }
  .procedure-list strong { white-space: nowrap; font-weight: 500; font-variant-numeric: tabular-nums; }
  .bar-track { background: var(--hover); height: 8px; margin-top: 12px; } .bar-track > div { height: 100%; background: var(--accent); }
  .documentation { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; font-size: 14px; }
  dt { color: var(--muted); margin-bottom: 8px; } dd { margin: 0; font-variant-numeric: tabular-nums; }
  .source-list li { border-bottom: 1px solid var(--line); padding: 20px 0; display: grid; gap: 8px; overflow-wrap: anywhere; font-size: 14px; }
  .source-list p { color: var(--muted); line-height: 1.7; max-width: 72ch; margin: 0; }
  @media(max-width:600px) { .filters, .documentation { grid-template-columns: 1fr; } .procedure-list li > div:first-child { flex-direction: column; gap: 8px; } th, td { padding: 12px 8px; } }
</style>

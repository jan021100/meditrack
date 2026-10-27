<script lang="ts">export let data;</script>
<svelte:head><title>MediTrack · Patient documentation</title></svelte:head>
<div class="welcome page">
  <h1>Care, documented.</h1>
  <p class="intro">Patient records, surgical treatment and follow-up in one place.</p>
  {#if data.user}
    <p class="signed-in">Signed in as <span>{data.user.email}</span></p>
    <a class="primary-action" href="/dashboard">Open patient records</a>
  {:else}
    <div class="welcome-actions"><a class="primary-action" href="/login">Sign in</a><a class="secondary-action" href="/register">Create account</a></div>
  {/if}
  <div class="overview"><p>Baseline and history</p><p>Procedures and recovery</p><p>Patient-reported outcomes</p></div>
</div>
<style>
  .welcome { padding: 40px 0; }
  h1 { margin: 0; font-size: clamp(36px, 6vw, 60px); line-height: 1.1; letter-spacing: -0.035em; font-weight: 600; }
  .intro { margin: 24px 0 36px; color: var(--muted); max-width: 40ch; font-size: 20px; line-height: 1.6; }
  .signed-in { color: var(--muted); margin-bottom: 20px; overflow-wrap: anywhere; }
  .signed-in span { color: var(--ink); }
  .welcome-actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .overview { display: flex; gap: 40px; flex-wrap: wrap; margin-top: 72px; padding-top: 24px; border-top: 1px solid var(--line); color: var(--muted); font-size: 14px; }
  .overview p { margin: 0; }
</style>

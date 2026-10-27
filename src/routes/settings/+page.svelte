<svelte:head><title>Settings · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href="/dashboard">Back to patients</a>
  <div class="page-heading"><div><h1>Settings</h1><p>Manage your MediTrack account.</p></div></div>
  <section><div><h2>Professional profile</h2><p>Update your name, workplace and avatar.</p></div><a class="secondary-action" href="/profile">Edit profile</a></section>
  <section><div><h2>More settings</h2><p>No additional account settings are available yet.</p></div></section>
</div>
<style>
  section { display: flex; gap: 24px; align-items: center; justify-content: space-between; padding: 28px 0; border-top: 1px solid var(--line); }
  h2 { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
  p { margin: 0; color: var(--muted); line-height: 1.6; }
  .secondary-action { flex-shrink: 0; }
  @media(max-width:600px) { section { align-items: flex-start; flex-direction: column; } }
</style>

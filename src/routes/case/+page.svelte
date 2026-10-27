<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => { goto('/patients/new', { replaceState: true }); });
</script>
<svelte:head><title>New patient · MediTrack</title></svelte:head>
<p role="status">Opening patient documentation…</p>
<a href="/patients/new">Continue to new patient</a>

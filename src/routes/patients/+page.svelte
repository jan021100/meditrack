<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => goto('/dashboard', { replaceState: true }));
</script>
<p role="status">Opening patient records… <a href="/dashboard">Continue to patients</a></p>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => goto('/dashboard', { replace: true }));
</script>
<p role="status">Opening patient records… <a href="/dashboard">Continue to patients</a></p>

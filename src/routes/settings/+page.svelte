<script lang="ts">
  import { goto } from '$app/navigation';

  function backToDashboard() {
    goto('/dashboard');
  }
</script>

<style>
  .settings-container {
    max-width: 600px;
    margin: 2rem auto;
    font-family: 'Helvetica Neue', sans-serif;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .back-btn {
    background: transparent;
    color: #000;
    border: 1px solid #aaa;
    border-radius: 6px;
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-bottom: 1.5rem;
  }

  .back-btn:hover {
    background: #f0f0f0;
  }

  .settings-placeholder {
    font-size: 1rem;
    color: #555;
    margin-top: 1rem;
  }
</style>

<div class="settings-container">
  <button class="back-btn" on:click={backToDashboard}>← Back</button>
  <h1>⚙️ Settings</h1>

  <div class="settings-placeholder">
    This is your settings page. In the future, you could add:
    <ul>
      <li>Language preference</li>
      <li>Theme (light/dark)</li>
      <li>Email notifications</li>
      <li>Password change</li>
      <li>Data export</li>
      <li>Danger zone for account deletion</li>
    </ul>
  </div>
</div>
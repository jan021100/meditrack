<script lang="ts">
  import { registerUser } from '$lib/firebase/auth';
  import { goto } from '$app/navigation';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';

  let email = '';
  let password = '';
  let title = '';
  let firstName = '';
  let lastName = '';
  let workplace = '';
  let error = '';

  async function handleRegister() {
    try {
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;

      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        title,
        firstName,
        lastName,
        workplace,
        email,
        createdAt: new Date()
      });

      goto('/dashboard');
    } catch (e: any) {
      error = e.message;
    }
  }
</script>

<style>
  .container {
    max-width: 480px;
    margin: 4rem auto;
    background: #f5f5f3;
    padding: 3rem 2rem;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
    font-family: 'Helvetica Neue', sans-serif;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #000;
  }

  label {
    display: block;
    margin-top: 1rem;
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.25rem;
    border-radius: 12px;
    border: 1px solid #ccc;
    font-size: 1rem;
    background: white;
    box-sizing: border-box;
  }

  button {
    margin-top: 2rem;
    width: 100%;
    padding: 0.9rem;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #333;
  }

  .error {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }
</style>

<div class="container">
  <h1>Register</h1>

  <label for="title">Title</label>
  <input id="title" bind:value={title} placeholder="Dr., Prof., etc." />

  <label for="firstName">First Name</label>
  <input id="firstName" bind:value={firstName} placeholder="First Name" />

  <label for="lastName">Last Name</label>
  <input id="lastName" bind:value={lastName} placeholder="Last Name" />

  <label for="workplace">Workplace</label>
  <input id="workplace" bind:value={workplace} placeholder="Clinic or Practice" />

  <label for="email">Work-Email</label>
  <input id="email" type="email" bind:value={email} placeholder="Email" />

  <label for="password">Password</label>
  <input id="password" type="password" bind:value={password} placeholder="Password" />

  <button on:click={handleRegister}>Create Account</button>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
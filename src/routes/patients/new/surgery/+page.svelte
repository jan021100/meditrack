<script lang="ts">
  import { goto } from '$app/navigation';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { caseData } from '$lib/stores/caseStore';
  import { onDestroy } from 'svelte';

  let baseData = {};
  const unsubscribe = caseData.subscribe(value => baseData = value);
  onDestroy(() => unsubscribe());

  let hospitalTown = '';
  let hospitalCountry = '';
  let hospitalDepartment = '';
  let otherDepartment = '';
  let studyType = '';
  let surgeonName = '';
  let surgeonQualification = '';
  let opsByDept = '';
  let opsBySurgeon = '';
  let operationDate = '';
  let abscess = '';
  let operationTechnique = '';
  let otherTechnique = '';
  let flapTechnique = '';
  let otherFlap = '';
  let dyeInjected = '';
  let dyeType = '';
  let otherDye = '';
  let woundClosure = '';
  let sutureLocalization = '';
  let anesthesiaType = '';
  let hospitalizationForm = '';
  let hospitalDays: number | null = null;
  let dateWoundClosed = '';
  let dateHealed = '';
  let comments = '';

  let submitting = false;
  let error = '';
  let success = false;

  async function saveCase() {
    submitting = true;
    error = '';
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        error = 'You must be logged in.';
        submitting = false;
        return;
      }

      const db = getFirestore();
      const patientsRef = collection(db, 'patients');

      const { followups, surgeries, proms, ...cleanBaseData } = baseData;

await addDoc(patientsRef, {
  ...cleanBaseData,
  hospitalTown,
  hospitalCountry,
  hospitalDepartment,
  otherDepartment: hospitalDepartment === 'Other' ? otherDepartment : null,
  studyType,
  surgeonName,
  surgeonQualification,
  opsByDept,
  opsBySurgeon,
  operationDate,
  abscess,
  operationTechnique,
  otherTechnique: operationTechnique === 'Other' ? otherTechnique : null,
  flapTechnique,
  otherFlap: flapTechnique === 'Other' ? otherFlap : null,
  dyeInjected,
  dyeType,
  otherDye: dyeType === 'Other' ? otherDye : null,
  woundClosure,
  sutureLocalization,
  anesthesiaType,
  hospitalizationForm,
  hospitalDays,
  dateWoundClosed,
  dateHealed,
  comments,
  createdAt: serverTimestamp(),
  userId: user.uid
});

      success = true;
      goto('/dashboard');
    } catch (err) {
      error = 'Error saving case.';
      console.error(err);
    } finally {
      submitting = false;
    }
  }
</script>

<style>
  .form-container {
    max-width: 720px;
    margin: 3rem auto;
    padding: 2rem;
    border-radius: 12px;
    background-color: #f5f5f3;
    font-family: 'Helvetica Neue', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  label {
    display: block;
    margin-top: 1rem;
    font-weight: 500;
  }
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.25rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }
  button {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover {
    background-color: #333;
  }
  .success {
    color: green;
    margin-top: 1rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
</style>

<div class="form-container">
  <h1>Surgery Form</h1>

  <!-- 🩺 Section 1: Patient Information -->
  <h2>1. Patient Information</h2>

  <label>Hospital Town</label>
  <input bind:value={hospitalTown} />

  <label>Hospital Country</label>
  <input bind:value={hospitalCountry} />

  <label>Hospital Department</label>
  <select bind:value={hospitalDepartment}>
    <option value="">Select...</option>
    <option value="Surgery">Surgery</option>
    <option value="Dermatology">Dermatology</option>
    <option value="Other">Other</option>
  </select>
  {#if hospitalDepartment === 'Other'}
    <label>Other Department</label>
    <input bind:value={otherDepartment} />
  {/if}

  <label>Study Type</label>
  <select bind:value={studyType}>
    <option value="">Select...</option>
    <option value="Prospective">Prospective</option>
    <option value="Retrospective">Retrospective</option>
    <option value="Not applicable">Not applicable</option>
  </select>

  <!-- 🧑‍⚕️ Section 2: Surgeon Information -->
  <h2>2. Surgeon Information</h2>

  <label>Surgeon Name</label>
  <input bind:value={surgeonName} />

  <label>Surgeon Qualification</label>
  <select bind:value={surgeonQualification}>
    <option value="">Select...</option>
    <option value="Resident">Resident</option>
    <option value="Specialist">Specialist</option>
    <option value="Consultant">Consultant</option>
    <option value="Other">Other</option>
  </select>

  <label>Operations per Department per Year</label>
  <input type="number" bind:value={opsByDept} min="0" />

  <label>Operations by Surgeon per Year</label>
  <input type="number" bind:value={opsBySurgeon} min="0" />

  <!-- 🛠️ Section 3: Operation Information -->
  <h2>3. Operation Information</h2>

  <label>Operation Date</label>
  <input type="date" bind:value={operationDate} />

  <label>Abscess Present?</label>
  <select bind:value={abscess}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>

  <label>Operation Technique</label>
  <select bind:value={operationTechnique}>
    <option value="">Select...</option>
    <option value="Flap">Flap</option>
    <option value="Pit Picking">Pit Picking</option>
    <option value="Phenol">Phenol</option>
    <option value="Endoscopy">Endoscopy</option>
    <option value="Incision and Drainage (IND)">Incision and Drainage (IND)</option>
    <option value="Primary Wound Management (PVM)">Primary Wound Management (PVM)</option>
    <option value="Primary Wound Closure (PVA)">Primary Wound Closure (PVA)</option>
    <option value="Other">Other</option>
  </select>
  {#if operationTechnique === 'Other'}
    <label>Other Technique</label>
    <input bind:value={otherTechnique} />
  {/if}

  <label>Flap Technique</label>
  <select bind:value={flapTechnique}>
    <option value="">Select...</option>
    <option value="Limberg">Limberg</option>
    <option value="Karydakis">Karydakis</option>
    <option value="Modified Karydakis">Modified Karydakis</option>
    <option value="Bascom">Bascom</option>
    <option value="Other">Other</option>
  </select>
  {#if flapTechnique === 'Other'}
    <label>Other Flap</label>
    <input bind:value={otherFlap} />
  {/if}

  <label>Dye Injected?</label>
  <select bind:value={dyeInjected}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>

  <label>Dye Type</label>
  <select bind:value={dyeType}>
    <option value="">Select...</option>
    <option value="Methylene Blue">Methylene Blue</option>
    <option value="Other">Other</option>
  </select>
  {#if dyeType === 'Other'}
    <label>Other Dye</label>
    <input bind:value={otherDye} />
  {/if}

  <label>Wound Closure</label>
  <select bind:value={woundClosure}>
    <option value="">Select...</option>
    <option value="Open">Open</option>
    <option value="Primary Closure">Primary Closure</option>
    <option value="Secondary Closure">Secondary Closure</option>
    <option value="Other">Other</option>
  </select>

  <label>Suture Localization</label>
  <select bind:value={sutureLocalization}>
    <option value="">Select...</option>
    <option value="Midline">Midline</option>
    <option value="Off-midline">Off-midline</option>
  </select>

  <label>Anesthesia Type</label>
  <select bind:value={anesthesiaType}>
    <option value="">Select...</option>
    <option value="Local">Local</option>
    <option value="Spinal">Spinal</option>
    <option value="General">General</option>
    <option value="Other">Other</option>
  </select>

  <label>Hospitalization Form</label>
  <select bind:value={hospitalizationForm}>
    <option value="">Select...</option>
    <option value="Inpatient">Inpatient</option>
    <option value="Outpatient">Outpatient</option>
    <option value="Same-day discharge">Same-day discharge</option>
  </select>

  <label>Nights Stayed at Hospital (0 = Outpatient)</label>
  <input type="number" bind:value={hospitalDays} min="0" />

  <label>Date Wound Closed</label>
  <input type="date" bind:value={dateWoundClosed} />

  <label>Date Healed</label>
  <input type="date" bind:value={dateHealed} />

  <label>Additional Comments</label>
  <textarea rows="3" bind:value={comments}></textarea>

  <button on:click={saveCase} disabled={submitting}>
    {submitting ? 'Saving...' : '💾 Save Case'}
  </button>

  {#if success}
    <p class="success">✅ Case successfully saved!</p>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
<script lang="ts">
  import { requireClinicalEditor } from '#lib/access.ts';
  import { goto } from '$app/navigation';
  import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { caseData, clearCaseDraft, getCaseDraftFor, type BaselineData } from '#lib/stores/caseStore.ts';
  import { onDestroy } from 'svelte';

  let baseData: Partial<BaselineData> = {};
  const unsubscribe = caseData.subscribe(value => baseData = value?.baseline ?? {});
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
    if (submitting) return;
    // The baseline draft lives in memory. Reloading must never save an empty patient.
    if (!baseData.birthDate || !baseData.sex) {
      error = 'Baseline information is missing. Please start again from the baseline form.';
      return;
    }
    submitting = true;
    error = '';
    try {
      const user = await requireClinicalEditor();
      const ownedBaseline = getCaseDraftFor(user.uid);

      const db = getFirestore();
      const patientsRef = collection(db, 'patients');


// Baseline and operation comments describe different events; keep both.
const { comments: baselineComments = '', ...baseline } = ownedBaseline;
await addDoc(patientsRef, {
  ...baseline,
  baselineComments,
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

      if (clearCaseDraft(user.uid)) {
        success = true;
        goto('/dashboard');
      }
    } catch (err) {
      error = 'Error saving case.';
      console.error(err);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head><title>Initial surgery · MediTrack</title></svelte:head>
<div class="form-page">
  <a class="back-link" href="/dashboard">Back to patients</a>
  <div class="page-heading"><div><h1>Initial surgery</h1><p>Complete the initial operation to save this patient record.</p></div></div>
  {#if !baseData.birthDate || !baseData.sex}
    <p class="feedback error" role="alert">Baseline information is missing after a reload or direct visit. <a href="/patients/new" data-sveltekit-reload>Return to baseline</a> to start again.</p>
  {/if}
  <form class="clinical-form" on:submit|preventDefault={saveCase}>
    <div class="form-grid">


  <h2 class="form-section-title">Hospital and study</h2>

  <div class="form-field"><label for="hospitalTown">Hospital town</label>
  <input id="hospitalTown" bind:value={hospitalTown} /></div>

  <div class="form-field"><label for="hospitalCountry">Hospital country</label>
  <input id="hospitalCountry" bind:value={hospitalCountry} /></div>

  <div class="form-field"><label for="hospitalDepartment">Hospital department</label>
  <select id="hospitalDepartment" bind:value={hospitalDepartment}>
    <option value="">Select...</option>
    <option value="Surgery">Surgery</option>
    <option value="Dermatology">Dermatology</option>
    <option value="Other">Other</option>
  </select></div>
  {#if hospitalDepartment === 'Other'}
    <div class="form-field"><label for="otherDepartment">Other department</label>
    <input id="otherDepartment" bind:value={otherDepartment} /></div>
  {/if}

  <div class="form-field"><label for="studyType">Study type</label>
  <select id="studyType" bind:value={studyType}>
    <option value="">Select...</option>
    <option value="Prospective">Prospective</option>
    <option value="Retrospective">Retrospective</option>
    <option value="Not applicable">Not applicable</option>
  </select></div>


  <h2 class="form-section-title">Surgeon</h2>

  <div class="form-field"><label for="surgeonName">Surgeon name</label>
  <input id="surgeonName" bind:value={surgeonName} /></div>

  <div class="form-field"><label for="surgeonQualification">Surgeon qualification</label>
  <select id="surgeonQualification" bind:value={surgeonQualification}>
    <option value="">Select...</option>
    <option value="Resident">Resident</option>
    <option value="Specialist">Specialist</option>
    <option value="Consultant">Consultant</option>
    <option value="Other">Other</option>
  </select></div>

  <div class="form-field"><label for="opsByDept">Operations per department per year</label>
  <input id="opsByDept" type="number" bind:value={opsByDept} min="0" /></div>

  <div class="form-field"><label for="opsBySurgeon">Operations by surgeon per year</label>
  <input id="opsBySurgeon" type="number" bind:value={opsBySurgeon} min="0" /></div>


  <h2 class="form-section-title">Procedure and recovery</h2>

  <div class="form-field"><label for="operationDate">Operation date</label>
  <input id="operationDate" type="date" bind:value={operationDate} /></div>

  <div class="form-field"><label for="abscess">Abscess present?</label>
  <select id="abscess" bind:value={abscess}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select></div>

  <div class="form-field"><label for="operationTechnique">Operation technique</label>
  <select id="operationTechnique" bind:value={operationTechnique}>
    <option value="">Select...</option>
    <option value="Flap">Flap</option>
    <option value="Pit Picking">Pit Picking</option>
    <option value="Phenol">Phenol</option>
    <option value="Endoscopy">Endoscopy</option>
    <option value="Incision and Drainage (IND)">Incision and Drainage (IND)</option>
    <option value="Primary Wound Management (PVM)">Primary Wound Management (PVM)</option>
    <option value="Primary Wound Closure (PVA)">Primary Wound Closure (PVA)</option>
    <option value="Other">Other</option>
  </select></div>
  {#if operationTechnique === 'Other'}
    <div class="form-field"><label for="otherTechnique">Other technique</label>
    <input id="otherTechnique" bind:value={otherTechnique} /></div>
  {/if}

  <div class="form-field"><label for="flapTechnique">Flap technique</label>
  <select id="flapTechnique" bind:value={flapTechnique}>
    <option value="">Select...</option>
    <option value="Limberg">Limberg</option>
    <option value="Karydakis">Karydakis</option>
    <option value="Modified Karydakis">Modified Karydakis</option>
    <option value="Bascom">Bascom</option>
    <option value="Other">Other</option>
  </select></div>
  {#if flapTechnique === 'Other'}
    <div class="form-field"><label for="otherFlap">Other flap technique</label>
    <input id="otherFlap" bind:value={otherFlap} /></div>
  {/if}

  <div class="form-field"><label for="dyeInjected">Dye injected?</label>
  <select id="dyeInjected" bind:value={dyeInjected}>
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select></div>

  <div class="form-field"><label for="dyeType">Dye type</label>
  <select id="dyeType" bind:value={dyeType}>
    <option value="">Select...</option>
    <option value="Methylene Blue">Methylene Blue</option>
    <option value="Other">Other</option>
  </select></div>
  {#if dyeType === 'Other'}
    <div class="form-field"><label for="otherDye">Other dye</label>
    <input id="otherDye" bind:value={otherDye} /></div>
  {/if}

  <div class="form-field"><label for="woundClosure">Wound closure</label>
  <select id="woundClosure" bind:value={woundClosure}>
    <option value="">Select...</option>
    <option value="Open">Open</option>
    <option value="Primary Closure">Primary Closure</option>
    <option value="Secondary Closure">Secondary Closure</option>
    <option value="Other">Other</option>
  </select></div>

  <div class="form-field"><label for="sutureLocalization">Suture location</label>
  <select id="sutureLocalization" bind:value={sutureLocalization}>
    <option value="">Select...</option>
    <option value="Midline">Midline</option>
    <option value="Off-midline">Off-midline</option>
  </select></div>

  <div class="form-field"><label for="anesthesiaType">Anesthesia type</label>
  <select id="anesthesiaType" bind:value={anesthesiaType}>
    <option value="">Select...</option>
    <option value="Local">Local</option>
    <option value="Spinal">Spinal</option>
    <option value="General">General</option>
    <option value="Other">Other</option>
  </select></div>

  <div class="form-field"><label for="hospitalizationForm">Hospitalization</label>
  <select id="hospitalizationForm" bind:value={hospitalizationForm}>
    <option value="">Select...</option>
    <option value="Inpatient">Inpatient</option>
    <option value="Outpatient">Outpatient</option>
    <option value="Same-day discharge">Same-day discharge</option>
  </select></div>

  <div class="form-field"><label for="hospitalDays">Nights Stayed at Hospital (0 = Outpatient)</label>
  <input id="hospitalDays" type="number" bind:value={hospitalDays} min="0" /></div>

  <div class="form-field"><label for="dateWoundClosed">Date of wound closure</label>
  <input id="dateWoundClosed" type="date" bind:value={dateWoundClosed} /></div>

  <div class="form-field"><label for="dateHealed">Date healed</label>
  <input id="dateHealed" type="date" bind:value={dateHealed} /></div>

  <div class="form-field full-width"><label for="comments">Additional comments</label>
  <textarea id="comments" rows="3" bind:value={comments}></textarea></div>

  </div>
    <div class="form-footer"><button type="submit" class="primary-action" disabled={submitting || !baseData.birthDate || !baseData.sex}>
    {submitting ? 'Saving...' : ' Save patient'}
  </button>

  {#if success}
    <p class="feedback success" role="status"> Case successfully saved!</p>
  {/if}

  {#if error}
    <p class="feedback error" role="alert">{error}</p>
  {/if}
</div>
  </form>
</div>

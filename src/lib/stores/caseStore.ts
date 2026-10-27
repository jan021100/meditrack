import { get, writable } from 'svelte/store';

export type BaselineData = {
  birthDate: string;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  sex: string;
  diseaseStartDate: string;
  familyHistory: string;
  previousSurgeries: number;
  previousSurgeryDetails: string;
  comments: string;
};

/** Patient drafts belong to one signed-in identity, not to a shared browser tab. */
export type CaseDraft = { ownerUid: string; baseline: BaselineData };
const draft = writable<CaseDraft | null>(null);
let identity: string | null = null;
// Callers may observe state; only the identity-aware functions below may change it.
export const caseData = { subscribe: draft.subscribe };

export function clearCaseDraft(ownerUid?: string) {
  // A late save from account A must not clear a new draft belonging to account B.
  if (ownerUid && ownerUid !== identity) return false;
  draft.set(null);
  return true;
}

/** Called for every Auth change, including sign-out from another tab. */
export function syncDraftIdentity(uid: string | null) {
  if (uid !== identity) {
    identity = uid;
    clearCaseDraft();
  }
}

export function setCaseDraft(uid: string, baseline: BaselineData) {
  if (!uid || uid !== identity) throw new Error('Your session changed. Please sign in and start the patient again.');
  draft.set({ ownerUid: uid, baseline: { ...baseline } });
}

/** Recheck after async authentication, immediately before preparing the write. */
export function getCaseDraftFor(uid: string): BaselineData {
  const value = get(draft);
  if (!uid || uid !== identity || value?.ownerUid !== uid) throw new Error('No patient draft belongs to this account. Please start again from baseline.');
  return { ...value.baseline };
}

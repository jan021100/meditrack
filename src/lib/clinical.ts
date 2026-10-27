import { collection, doc, getDoc, getDocs, type Firestore } from 'firebase/firestore';

export const DEFINITIONS_VERSION = 'meditrack-outcomes-v1';
export const OUTCOMES = ['No recurrence reported', 'Persistent disease / never healed', 'Recurrence after complete healing', 'Uncertain'] as const;
export type Outcome = typeof OUTCOMES[number];

export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

/** Stable initial/child IDs avoid linking an assessment by date or display number alone. */
export async function operationOptions(db: Firestore, patientId: string) {
  const parent = doc(db, 'patients', patientId);
  const [patient, surgeries] = await Promise.all([getDoc(parent), getDocs(collection(parent, 'surgeries'))]);
  if (!patient.exists()) throw new Error('Patient not found.');
  const initial = patient.data();
  return [{ id: 'initial', label: `Initial / published index procedure · ${initial.operationDate || 'date not recorded'} · ${initial.operationTechnique || 'technique not recorded'}` },
    ...surgeries.docs.map(entry => ({ id: entry.id, label: `Additional operation ${entry.data().surgeryNumber ?? 'unnumbered'} · ${entry.data().operationDate || 'date not recorded'} · ${entry.data().operationTechnique || 'technique not recorded'}` }))];
}

export async function assessmentContext(db: Firestore, patientId: string, operationId: string, assessedOn: string) {
  if (!operationId || operationId.includes('/')) throw new Error('Select the operation this assessment refers to.');
  if (!validDate(assessedOn)) throw new Error('Enter a valid assessment date.');
  const target = operationId === 'initial' ? doc(db, 'patients', patientId) : doc(db, 'patients', patientId, 'surgeries', operationId);
  const operation = await getDoc(target);
  if (!operation.exists()) throw new Error('The selected operation no longer exists. Reload the form.');
  const operationDate = operation.data().operationDate;
  if (typeof operationDate === 'string' && validDate(operationDate) && assessedOn < operationDate) throw new Error('Assessment cannot precede the selected operation.');
  return { operationId, assessedOn, definitionsVersion: DEFINITIONS_VERSION };
}

/** This is a stated, versioned operational definition, not an inferred diagnosis.
 * Never-healed disease is kept distinct from recurrence after a disease-free interval.
 */
export function followupOutcome(input: { outcomeClassification: string; completeHealingDate: string; dateOfRecurrence: string; assessedOn: string; operationDate?: string }) {
  if (!OUTCOMES.includes(input.outcomeClassification as Outcome)) throw new Error('Select the disease course, including uncertain if it cannot be established.');
  for (const [value, name] of [[input.completeHealingDate, 'Complete healing'], [input.dateOfRecurrence, 'Recurrence']] as const) {
    if (value && (!validDate(value) || value > input.assessedOn || (input.operationDate && validDate(input.operationDate) && value < input.operationDate))) throw new Error(`${name} date must lie between the operation and this assessment.`);
  }
  if (input.outcomeClassification === 'Persistent disease / never healed' && input.completeHealingDate) throw new Error('Never-healed disease cannot have a previous complete-healing date.');
  if (input.outcomeClassification === 'Recurrence after complete healing') {
    if (!input.completeHealingDate || !input.dateOfRecurrence || input.dateOfRecurrence <= input.completeHealingDate) throw new Error('Recurrence requires a recorded complete-healing date followed by a later recurrence date. Use uncertain when dates cannot be established.');
  } else if (input.dateOfRecurrence) throw new Error('Only record a recurrence date for recurrence after complete healing.');
  return { outcomeClassification: input.outcomeClassification, completeHealingDate: input.completeHealingDate || null,
    dateOfRecurrence: input.dateOfRecurrence || null, recurrence: input.outcomeClassification === 'Recurrence after complete healing' ? 'Yes' : input.outcomeClassification === 'No recurrence reported' ? 'No' : 'Unknown' };
}

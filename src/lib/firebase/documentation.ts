import { collection, doc, getDocs, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';

type Kind = 'surgeries' | 'followups';

/** Save the child record and its sequence number together, or save neither.
 * Numbers count additional surgeries (the initial operation stays in the parent).
 * Random document IDs prevent overwrites; a parent counter serializes numbering.
 */
export async function saveDocumentation(db: Firestore, patientId: string, kind: Kind, data: Record<string, unknown>) {
  const parent = doc(db, 'patients', patientId);
  const children = collection(parent, kind);
  const field = kind === 'surgeries' ? 'surgeryNumber' : 'followUpNumber';
  // Bootstrap old records without changing them. Include legacy followupN IDs and gaps.
  const existing = await getDocs(children);
  const legacyMax = existing.docs.reduce((max, entry) => {
    const value = Number(entry.data()[field]);
    const idNumber = kind === 'followups' ? Number(/^followup(\d+)$/.exec(entry.id)?.[1] ?? 0) : 0;
    return Math.max(max, Number.isSafeInteger(value) && value > 0 ? value : 0, idNumber);
  }, existing.size);
  const target = doc(children); // Stable through automatic transaction retries.
  return runTransaction(db, async transaction => {
    const [patient, child] = await Promise.all([transaction.get(parent), transaction.get(target)]);
    if (!patient.exists()) throw new Error('Patient not found.');
    if (child.exists()) throw new Error('Documentation ID already exists.');
    const savedCounter = patient.data().documentationCounters?.[kind] ?? 0;
    if (!Number.isSafeInteger(savedCounter) || savedCounter < 0) throw new Error('Invalid documentation counter.');
    const number = Math.max(savedCounter, legacyMax) + 1;
    if (!Number.isSafeInteger(number)) throw new Error('Documentation counter exhausted.');
    transaction.update(parent, { [`documentationCounters.${kind}`]: number });
    transaction.set(target, { ...data, [field]: number, createdAt: serverTimestamp() });
    return { id: target.id, number };
  });
}

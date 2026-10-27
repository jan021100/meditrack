// Import published individual facts ONLY into the local demo project.
// No service account or production Firebase configuration is read by this script.
const fs = require('node:fs');
const path = require('node:path');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

async function main() {
  const projectId = 'demo-meditrack';
  // Refuse caller-supplied remote hosts rather than risk redirecting the import.
  for (const [key, expected] of Object.entries({ FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' })) {
    if (process.env[key] && process.env[key] !== expected) throw new Error(`Unexpected ${key}; import refused.`);
    process.env[key] = expected;
  }
  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const targetUid = process.argv[2];
  if (!targetUid) throw new Error('Pass the UID of the intended local test account. No automatic account selection.');
  await auth.getUser(targetUid); // Confirm this account exists in the local Auth emulator.
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'published-cases.json'), 'utf8'));
  if (manifest.schemaVersion !== 1) throw new Error('Unknown source manifest version.');
  const ids = manifest.cases.map(item => item.id);
  if (new Set(ids).size !== ids.length || ids.some(id => !/^LIT-[A-Z0-9-]+$/.test(id))) throw new Error('Invalid or duplicate case IDs.');

  let added = 0, skipped = 0;
  for (const item of manifest.cases) {
    const source = manifest.sources[item.sourceKey];
    if (!source?.doi || !item.sourceLocator) throw new Error('Missing provenance.');
    const ref = db.collection('patients').doc(item.id);
    // A transaction preserves existing test edits and prevents duplicate imports.
    const created = await db.runTransaction(async transaction => {
      const existing = await transaction.get(ref);
      if (existing.exists) return false;
      transaction.create(ref, {
        ...item.patient, userId: targetUid, createdAt: FieldValue.serverTimestamp(),
        dataOrigin: 'published_individual_case', datasetId: manifest.datasetId,
        sourceTitle: source.title, sourceAuthors: source.authors, sourceDoi: source.doi,
        sourceUrl: source.url, sourceLicense: source.license, sourceCase: item.sourceCase,
        sourceLocator: item.sourceLocator, extractedAt: manifest.extractedAt,
        sourceQualityNotes: item.qualityNotes.join(' '),
        sourceMissingData: 'Unreported fields are absent. No birth dates, calendar operation dates or numeric PROMs were invented.',
        indexProcedureMeaning: 'First procedure captured here; not necessarily the first lifetime operation.',
        analysisEligibility: 'Software tests only; selected published cases with incomplete data and publication bias.'
      });
      for (const collection of ['surgeries', 'followups']) {
        for (const entry of item[collection]) {
          const { id, ...data } = entry;
          transaction.create(ref.collection(collection).doc(id), { ...data, sourceDoi: source.doi, sourceCase: item.sourceCase });
        }
      }
      return true;
    });
    created ? added++ : skipped++;
    // Check the stored record after the import, without reading any other patients.
    const saved = await ref.get();
    if (saved.data()?.userId !== targetUid || saved.data()?.sourceDoi !== source.doi) throw new Error(`Source/owner mismatch: ${item.id}`);
    for (const collection of ['surgeries', 'followups']) {
      const children = await ref.collection(collection).get();
      if (children.size < item[collection].length) throw new Error(`Missing clinical events: ${item.id}`);
    }
  }
  console.log(JSON.stringify({ projectId, added, skipped, verified: ids.length }));
  await app.delete();
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

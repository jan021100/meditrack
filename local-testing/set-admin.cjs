// Emulator-only bootstrap: never load production credentials or accept a cloud project.
const uid = process.argv[2];
if (!uid || process.argv.length !== 3) throw new Error('Usage: node local-testing/set-admin.cjs LOCAL_TEST_UID');
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const app = initializeApp({ projectId: 'demo-meditrack' });
(async () => {
  const auth = getAuth(app);
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...user.customClaims, role: 'admin' });
  console.log('Local test administrator ready. Sign out and back in to refresh the claim.');
  await app.delete();
})().catch(() => { console.error('Local test administrator could not be set. Check the emulator and test UID.'); process.exitCode = 1; });

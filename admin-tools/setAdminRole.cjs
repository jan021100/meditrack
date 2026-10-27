// Explicit UID avoids accidentally repeating an old privileged operation.
const uid = process.argv[2];
if (!uid || process.argv.length !== 3) throw new Error('Usage: node admin-tools/setAdminRole.cjs USER_UID');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
initializeApp({ credential: cert(require('./serviceAccountKey.json')) });
(async () => {
  const auth = getAuth();
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...user.customClaims, role: 'admin' });
  console.log('Administrator claim updated for the explicitly selected account.');
})().catch(() => { console.error('Administrator claim could not be updated.'); process.exitCode = 1; });

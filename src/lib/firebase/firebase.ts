// All Firebase access starts here, before any page can read or write data.
import { browser, dev } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { syncDraftIdentity } from '../stores/caseStore';

// Local development always uses a separate, nonexistent cloud project.
// If an emulator is stopped, requests fail; they never fall back to real patients.
export const isLocalTest = dev || (browser && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname));
const app = initializeApp(isLocalTest ? {
  apiKey: 'demo-meditrack-key',
  authDomain: 'demo-meditrack.firebaseapp.com',
  projectId: 'demo-meditrack'
} : firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (isLocalTest) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Route invalidation does not clear module stores. Bind transient clinical data to Auth itself.
if (browser) onAuthStateChanged(auth, user => syncDraftIdentity(user?.uid ?? null));

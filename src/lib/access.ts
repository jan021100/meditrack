import { getAuth, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore, type Firestore } from 'firebase/firestore';

/** Authentication claims, never editable profile fields, define access everywhere. */
export async function getAccess(user: User | null = getAuth().currentUser, db: Firestore = getFirestore()) {
  if (!user) throw new Error('Please sign in.');
  const token = await user.getIdTokenResult();
  const isAdmin = token.claims.role === 'admin';
  // Approval is separate from editable profiles and does not grant an administrator role.
  const isApproved = isAdmin || (await getDoc(doc(db, 'memberships', user.uid))).data()?.approved === true;
  return { user, isAdmin, isApproved };
}

/** UI guard only; Firestore rules must independently enforce the same boundary. */
export async function requireClinicalEditor() {
  const access = await getAccess();
  if (access.isAdmin) throw new Error('Administrators have read-only access to clinical records.');
  if (!access.isApproved) throw new Error('Your account must be approved by the study team.');
  return access.user;
}

// Call only in an admin view. Missing legacy profiles retain the recorded UID.
export async function authorLabel(db: Firestore, uid: unknown): Promise<string> {
  if (typeof uid !== 'string' || !uid) return 'Recorder not documented';
  const profile = await getDoc(doc(db, 'users', uid));
  if (!profile.exists()) return `Profile unavailable · ${uid}`;
  const data = profile.data();
  const name = [data.title, data.firstName, data.lastName].filter(value => typeof value === 'string' && value.trim()).join(' ');
  return [name || data.email || uid, data.workplace].filter(Boolean).join(' · ');
}

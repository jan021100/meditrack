import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Registers a user with email and password.
 * Returns the full userCredential object (needed to access user.uid).
 */
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore with default role 'user'
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    email,
    role: 'user',
    createdAt: new Date()
  });

  return userCredential; // <-- changed from "user" to full userCredential
}

/**
 * Logs in an existing user.
 */
export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Gets user data from Firestore using UID.
 */
export async function getUserData(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) return userDoc.data();
  return null;
}
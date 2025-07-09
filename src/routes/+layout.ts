// src/routes/+layout.ts
import type { LayoutLoad } from './$types';
import { auth } from '$lib/firebase/firebase';
import { getUserData } from '$lib/firebase/auth';

export const load: LayoutLoad = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (user) {
        const userData = await getUserData(user.uid);
        resolve({
          user: {
            uid: user.uid,
            email: user.email,
            role: userData?.role ?? 'user'
          }
        });
      } else {
        resolve({ user: null });
      }
    });
  });
};
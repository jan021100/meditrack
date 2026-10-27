// src/routes/+layout.ts
import type { LayoutLoad } from './$types';
import { auth } from '#lib/firebase/firebase.ts';
import { getAccess } from '#lib/access.ts';
import { redirect } from '@sveltejs/kit';
import { browser, dev } from '$app/env';

type UserData = {
  uid: string;
  email: string | null;
  role: string;
  approved: boolean;
};

export const load = (async ({ url }) => {
  return new Promise<{ user: UserData | null }>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      try {
        if (user) {
          const access = await getAccess(user);
          const accountPages = ['/', '/login', '/register', '/pending', '/profile', '/settings', '/reset-password'];
          if (!access.isApproved && !accountPages.includes(url.pathname)) redirect(303, '/pending');
          resolve({
            user: {
              uid: user.uid,
              email: user.email,
              role: access.isAdmin ? 'admin' : 'user',
              approved: access.isApproved
            }
          });
        } else {
          // Auth persistence is browser-side; never redirect a restored session during SSR.
          const publicPages = ['/', '/login', '/register', '/reset-password'];
          if (browser && !publicPages.includes(url.pathname) && !(dev && url.pathname === '/dev/ui')) redirect(303, '/login');
          resolve({ user: null });
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}) satisfies LayoutLoad;

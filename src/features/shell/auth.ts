import { router, type Href } from 'expo-router';

import { KARIM, useSession } from '@/stores/session';

/** requireAccount(action, resumeRoute): opens the gate; after sign-in the action resumes. */
export function requireAccount(action: string, resume: string) {
  if (useSession.getState().user) return true;
  router.push(`/auth/gate?action=${action}&resume=${encodeURIComponent(resume)}` as Href);
  return false;
}

export function completeSignIn(resume?: string) {
  useSession.getState().signIn(KARIM);
  router.dismissAll();
  if (resume) setTimeout(() => router.push(resume as Href), 60);
}

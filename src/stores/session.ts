import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

export type User = { id: string; firstName: string; fullName: string; email: string };

type PendingAction = { action: string; resume: string } | null;

type SessionState = {
  user: User | null;
  pending: PendingAction;
  signIn: (user: User) => void;
  signOut: () => void;
  setPending: (p: PendingAction) => void;
};

export const KARIM: User = { id: 'usr_karim', firstName: 'Karim', fullName: 'Karim Haddad', email: 'karim.haddad@example.com' };

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      pending: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      setPending: (pending) => set({ pending }),
    }),
    { name: 'movo.session', storage: persistStorage, partialize: (s) => ({ user: s.user }) },
  ),
);

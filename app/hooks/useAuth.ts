import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types/user';

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Comment out auth initialization for development

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    useAuth.getState().setUser({
      id: session.user.id,
      email: session.user.email,
    });
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    useAuth.getState().setUser({
      id: session.user.id,
      email: session.user.email,
    });
  } else {
    useAuth.getState().setUser(null);
  }
});

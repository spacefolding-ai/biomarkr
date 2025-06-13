import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types/user';

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Temporary development user
const DEV_USER: User = {
  id: 'dev-user-123',
  email: 'dev@example.com'
};

export const useAuth = create<AuthState>((set) => ({
  // Always return the dev user in development
  user: DEV_USER,
  setUser: (user) => set({ user: DEV_USER }), // Always set to dev user
}));

// Comment out auth initialization for development
/*
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
*/ 
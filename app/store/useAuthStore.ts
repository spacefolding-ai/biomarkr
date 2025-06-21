// store/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../services/supabaseClient";
import { User } from "../types/user";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      loading: true,
      initAuth: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ session, user: session?.user ?? null, loading: false });
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            set({ session, user: session?.user ?? null });
          }
        );

        return () => {
          listener.subscription.unsubscribe();
        };
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

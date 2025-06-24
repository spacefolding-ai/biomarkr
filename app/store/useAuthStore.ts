// store/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { handleLogout } from "../services/auth";
import { supabase } from "../supabase/supabaseClient";
import { User } from "../types/user";
import { attemptBiometricLogin } from "../utils/attemptBiometricLogin";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initAuth: () => void;
  initBiometricLogin: () => void;
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
      // TODO: Work in progress
      initBiometricLogin: async () => {
        const success = await attemptBiometricLogin();
        if (success) {
          // ✅ Log in the user OR restore session OR fetch user
          const { data, error } = await supabase.auth.getSession();
          if (data.session) {
            set({ session: data.session, user: data.session.user });
          }
        } else {
          console.log("Biometric auth failed or was cancelled.");
        }
      },
      logout: async () => {
        await handleLogout();
        set({ session: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

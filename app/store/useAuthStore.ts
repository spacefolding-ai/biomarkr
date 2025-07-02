// store/auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  clearCorruptedSession,
  handleAuthError,
  handleLogout,
} from "../services/auth";
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
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,

      clearSession: async () => {
        console.log("🧹 Clearing invalid session data");
        await clearCorruptedSession();
        set({ session: null, user: null, loading: false });
      },

      initAuth: async () => {
        try {
          console.log("🔐 Initializing authentication...");

          // Try to get the current session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("❌ Error getting session:", error);

            // Use the utility function to handle auth errors
            const handled = await handleAuthError(error);
            if (handled) {
              set({ session: null, user: null, loading: false });
              return;
            }
          }

          if (session) {
            console.log("✅ Valid session found, user authenticated");
            set({ session, user: session.user, loading: false });
          } else {
            console.log("ℹ️ No session found, user not authenticated");
            set({ session: null, user: null, loading: false });
          }
        } catch (error) {
          console.error("❌ Error during auth initialization:", error);
          await handleAuthError(error);
          set({ session: null, user: null, loading: false });
        }

        // Set up auth state change listener
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 Auth state changed: ${event}`);

            if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
              if (event === "TOKEN_REFRESHED" && !session) {
                console.log("🚨 Token refresh failed, clearing session");
                await get().clearSession();
                return;
              }
            }

            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              if (session) {
                console.log(
                  "✅ User signed in or token refreshed successfully"
                );
                set({ session, user: session.user, loading: false });
              }
            } else if (event === "SIGNED_OUT") {
              console.log("👋 User signed out");
              set({ session: null, user: null, loading: false });
            }
          }
        );

        return () => {
          listener.subscription.unsubscribe();
        };
      },

      // TODO: Work in progress
      initBiometricLogin: async () => {
        try {
          const success = await attemptBiometricLogin();
          if (success) {
            // ✅ Log in the user OR restore session OR fetch user
            const { data, error } = await supabase.auth.getSession();

            if (error) {
              console.error(
                "❌ Error getting session during biometric login:",
                error
              );
              await handleAuthError(error);
              return;
            }

            if (data.session) {
              set({ session: data.session, user: data.session.user });
            }
          }
        } catch (error) {
          console.error("❌ Biometric auth error:", error);
          await handleAuthError(error);
          // Biometric auth failed or was cancelled - this is normal
        }
      },

      logout: async () => {
        console.log("👋 Logging out user");
        try {
          await handleLogout();
        } catch (error) {
          console.error("❌ Error during logout:", error);
        }
        set({ session: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user ID, not the full session (sessions can become stale)
      partialize: (state) => ({
        user: state.user
          ? { id: state.user.id, email: state.user.email }
          : null,
      }),
    }
  )
);

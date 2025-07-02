import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export async function clearCorruptedSession() {
  console.log("🧹 Clearing corrupted session data...");

  try {
    // Clear Supabase session
    await supabase.auth.signOut();

    // Clear AsyncStorage data
    await AsyncStorage.removeItem("auth-storage");

    // Clear any other auth-related storage
    await AsyncStorage.removeItem("supabase.auth.token");

    console.log("✅ Session data cleared successfully");

    Toast.show({
      type: "info",
      text1: "Session expired",
      text2: "Please sign in again",
    });
  } catch (error) {
    console.error("❌ Error clearing session:", error);

    // Force clear AsyncStorage even if Supabase fails
    try {
      await AsyncStorage.multiRemove([
        "auth-storage",
        "supabase.auth.token",
        "sb-localhost-auth-token",
      ]);
    } catch (storageError) {
      console.error("❌ Error clearing storage:", storageError);
    }
  }
}

export async function handleAuthError(error: any) {
  console.error("🚨 Authentication error:", error);

  // Check if it's a refresh token error
  if (
    error?.message?.includes("Invalid Refresh Token") ||
    error?.message?.includes("Refresh Token Not Found") ||
    error?.message?.includes("refresh_token_not_found")
  ) {
    console.log("🔄 Detected invalid refresh token, clearing session...");
    await clearCorruptedSession();
    return true; // Indicates we handled the error
  }

  return false; // Indicates we didn't handle the error
}

export async function signInWithGoogle(navigation: NavigationProp<any>) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "biomarkr",
    preferLocalhost: true,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
    },
  });

  if (error) {
    await handleAuthError(error);
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type === "success") {
    const url = new URL(result.url);
    const accessToken = url.hash.match(/access_token=([^&]*)/)[1];
    const refreshToken = url.hash.match(/refresh_token=([^&]*)/)[1];
    const expiresIn = parseInt(url.hash.match(/expires_in=([^&]*)/)[1], 10);

    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    Toast.show({
      type: "success",
      text1: "Login with Google succeeded",
    });
    navigation.navigate("Main");
  } else {
    Toast.show({
      type: "info",
      text1: "OAuth canceled",
    });
  }
}

export async function handleSignUp(email: string, password: string) {
  // Signup via Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const handled = await handleAuthError(error);
    if (!handled) throw error;
  }

  // No immediate user profile insertion
  return data.user;
}

export async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password.trim(),
  });

  if (error) {
    const handled = await handleAuthError(error);
    if (!handled) throw error;
  }

  return data.user;
}

export async function handleLogout() {
  // Sign out the user
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("❌ Error during logout:", error);
    // Still clear local session even if signOut fails
    await clearCorruptedSession();
  }
}

export async function signInWithOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${Constants.expoConfig.scheme}://`,
    },
  });

  if (error) {
    await handleAuthError(error);
    throw error;
  }

  if (data.url) {
    await WebBrowser.openAuthSessionAsync(
      data.url,
      `${Constants.expoConfig.scheme}://`
    );
  }
}

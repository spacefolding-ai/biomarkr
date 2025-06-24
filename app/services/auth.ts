import { NavigationProp } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

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
    console.error("OAuth error:", error);
    return;
  }

  console.log("Opening auth session with URL:", data.url);

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
  if (error) throw error;

  // No immediate user profile insertion
  return data.user;
}

export async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password.trim(),
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function handleLogout() {
  // Sign out the user
  await supabase.auth.signOut();
}

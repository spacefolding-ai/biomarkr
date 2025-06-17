import { supabase } from "./supabaseClient";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Toast from "react-native-toast-message";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(navigation: NavigationProp<any>) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "healthiq",
    preferLocalhost: false,
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

  // ✅ You now must manually open the URL:
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type === "success") {
    console.log("OAuth success");
    Toast.show({
      type: "success",
      text1: "Login with Google succeeded",
    });
    navigation.navigate("Main");
  } else {
    console.log("OAuth canceled");
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

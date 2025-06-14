import { supabase } from './supabaseClient';

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

  const user = data.user;
  if (!user) throw new Error("User not found after login");

  const { data: sessionData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = sessionData.user?.id;
  if (!userId) throw new Error("Session user is missing");

  await insertUserProfile(email, userId);

  return user;
}

async function insertUserProfile(email: string, userId: string) {
  await supabase.from('users').insert({
    id: userId,
    email,
    full_name: "",
  });
} 
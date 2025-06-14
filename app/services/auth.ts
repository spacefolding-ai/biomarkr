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

  // Extract auth_user_id after successful login
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) throw new Error("auth_user_id missing");

  // Insert user profile after successful login
  await insertUserProfile(email); // Pass empty string for fullName which can be updated later

  return user;
}

async function insertUserProfile(email: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) throw sessionError;
  
  const auth_user_id = sessionData.user?.id;
  if (!auth_user_id) throw new Error("Session user missing");
  
  await supabase.from('users').insert({
    auth_user_id: auth_user_id,
    email: email,
    full_name: "",
  });
} 
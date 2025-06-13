import { supabase } from './supabaseClient';

export async function handleSignUp(email: string, password: string, fullName: string) {
  // Signup via Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw error;
  }

  // Upsert full_name into public.users
  const userId = data.user?.id;

  if (userId) {
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        auth_user_id: userId,
        email: email,
        full_name: fullName,
      }, { onConflict: 'auth_user_id' });

    if (upsertError) {
      throw upsertError;
    }
  }

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
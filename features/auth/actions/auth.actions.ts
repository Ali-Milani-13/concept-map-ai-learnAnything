'use server'

import { createClient } from '@supabase/supabase-js';
import { getEncryptedSession } from "@/lib/session";

// Initialize a stateless, server-only Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function authenticateUser(isLogin: boolean, email: string, password: string) {
  let authResult;

  if (isLogin) {
    authResult = await supabase.auth.signInWithPassword({ email, password });
  } else {
    authResult = await supabase.auth.signUp({ email, password });
  }

  const { data, error } = authResult;

  if (error) {
    return { error: error.message };
  }

  // If we got a session token, ENCRYPT it and save it to the Iron Session
  if (data.session) {
    const session = await getEncryptedSession();
    
    // FIX: Safely cast the user and handle the null vs undefined mismatch
    session.user = data.user ? (data.user as unknown as Record<string, unknown>) : undefined;
    
    session.access_token = data.session.access_token;
    session.refresh_token = data.session.refresh_token;
    await session.save();
  }

  return { 
    success: true, 
    user: data.user, 
    hasSession: !!data.session 
  };
}

export async function logoutUser() {
  const session = await getEncryptedSession();
  session.destroy();
  return { success: true };
}
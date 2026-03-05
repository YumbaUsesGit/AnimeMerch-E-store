import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that we have the required credentials
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL in environment variables')
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY in environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export individual functions for easier testing
export const signIn = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const signOut = () => {
  return supabase.auth.signOut()
}

export const getSession = () => {
  return supabase.auth.getSession()
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

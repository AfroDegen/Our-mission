// auth-example.js
// Client-side (browser) example using @supabase/supabase-js v2
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://eqxhragrozsulcvrhthp.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SW6TAUDJ8AxpXWBCefSzRw_1oOY-QEq'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sign up with email & password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

// Sign in with email & password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// Listen for auth state changes
export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((event, session) => cb(event, session))
}

// Server-side admin example (Node) - use only with SUPABASE_SECRET_KEY
// const { createClient } = require('@supabase/supabase-js')
// const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
// // Create user (admin)
// const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: 'x@x.com', password: 'pass' })

// Verify JWTs server-side: use SUPABASE_JWKS_URL to fetch keys and verify tokens (e.g., using jwks-rsa + jsonwebtoken)

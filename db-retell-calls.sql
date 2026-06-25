-- SQL to create `retell_calls` table for Supabase
-- Run this in Supabase SQL editor

-- Enable pgcrypto for gen_random_uuid (Supabase supports this)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.retell_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  phone text,
  name text,
  email text,
  message text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Optional index for session_id
CREATE INDEX IF NOT EXISTS idx_retell_calls_session_id ON public.retell_calls(session_id);

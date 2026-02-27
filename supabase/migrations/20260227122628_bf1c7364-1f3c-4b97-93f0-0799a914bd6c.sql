
-- Create registration_status table for tracking incomplete registrations
CREATE TABLE public.registration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text NOT NULL,
  document text,
  sponsor_name text,
  sponsor_id text,
  continue_token uuid NOT NULL DEFAULT gen_random_uuid(),
  franchise_selected boolean NOT NULL DEFAULT false,
  payment_completed boolean NOT NULL DEFAULT false,
  recovery_email_sent boolean NOT NULL DEFAULT false,
  recovery_email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registration_status ENABLE ROW LEVEL SECURITY;

-- Users can insert their own registration status
CREATE POLICY "Users can insert own registration status"
  ON public.registration_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own registration status
CREATE POLICY "Users can update own registration status"
  ON public.registration_status FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own registration status
CREATE POLICY "Users can view own registration status"
  ON public.registration_status FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_registration_status_updated_at
  BEFORE UPDATE ON public.registration_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable pg_cron and pg_net for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

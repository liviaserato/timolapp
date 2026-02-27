ALTER TABLE public.registration_status
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'pt',
  ADD COLUMN IF NOT EXISTS whatsapp_recovery_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_recovery_sent_at timestamptz;
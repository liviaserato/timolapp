ALTER TABLE public.registration_status
  ADD COLUMN IF NOT EXISTS sponsor_notified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_notified_at timestamp with time zone;
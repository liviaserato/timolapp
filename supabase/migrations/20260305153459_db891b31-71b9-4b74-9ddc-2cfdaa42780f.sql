-- Create table to track login failures and temporary lockouts
CREATE TABLE IF NOT EXISTS public.login_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT login_security_failed_attempts_non_negative CHECK (failed_attempts >= 0)
);

-- Ensure usernames are tracked case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS login_security_username_lower_idx
ON public.login_security (LOWER(username));

-- Helpful lookup index for active locks
CREATE INDEX IF NOT EXISTS login_security_locked_until_idx
ON public.login_security (locked_until);

-- Lock down direct client access
ALTER TABLE public.login_security ENABLE ROW LEVEL SECURITY;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_login_security_updated_at ON public.login_security;
CREATE TRIGGER update_login_security_updated_at
BEFORE UPDATE ON public.login_security
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
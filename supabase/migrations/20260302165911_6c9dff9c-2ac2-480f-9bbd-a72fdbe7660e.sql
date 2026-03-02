
CREATE TABLE public.password_reset_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_identifier text NOT NULL,
  email text NOT NULL,
  pin text NOT NULL,
  reset_token uuid DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_pins ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only edge functions with service role access this table

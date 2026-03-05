-- Add explicit deny-all policies for login_security to satisfy security linting while keeping the table backend-only
CREATE POLICY "No direct select access to login_security"
ON public.login_security
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "No direct insert access to login_security"
ON public.login_security
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No direct update access to login_security"
ON public.login_security
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct delete access to login_security"
ON public.login_security
FOR DELETE
TO anon, authenticated
USING (false);
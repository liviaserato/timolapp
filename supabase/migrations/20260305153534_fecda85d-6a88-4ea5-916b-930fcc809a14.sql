-- Add explicit backend-only policies for password_reset_pins
CREATE POLICY "No direct select access to password_reset_pins"
ON public.password_reset_pins
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "No direct insert access to password_reset_pins"
ON public.password_reset_pins
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No direct update access to password_reset_pins"
ON public.password_reset_pins
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct delete access to password_reset_pins"
ON public.password_reset_pins
FOR DELETE
TO anon, authenticated
USING (false);
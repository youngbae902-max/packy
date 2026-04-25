CREATE POLICY "Anyone can view public profiles"
ON public.profiles
FOR SELECT
USING (true);
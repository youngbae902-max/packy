REVOKE SELECT (wallet_balance, recovery_keyword) ON public.profiles FROM authenticated, anon;

CREATE OR REPLACE VIEW public.profiles_private
WITH (security_invoker = off) AS
SELECT p.user_id, p.wallet_balance, p.recovery_keyword
FROM public.profiles p
WHERE p.user_id = auth.uid() OR public.is_admin();

REVOKE ALL ON public.profiles_private FROM anon;
GRANT SELECT ON public.profiles_private TO authenticated;
GRANT SELECT ON public.profiles_private TO service_role;
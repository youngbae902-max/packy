DROP VIEW IF EXISTS public.profiles_private;

CREATE OR REPLACE FUNCTION public.my_private_profile()
RETURNS TABLE (wallet_balance numeric, recovery_keyword text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.wallet_balance, p.recovery_keyword
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_private_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_private_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_wallets()
RETURNS TABLE (user_id uuid, wallet_balance numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.wallet_balance
  FROM public.profiles p
  WHERE public.is_admin();
$$;

REVOKE ALL ON FUNCTION public.admin_list_wallets() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_wallets() TO authenticated;
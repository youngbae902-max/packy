-- Wallet transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins insert transactions"
ON public.wallet_transactions FOR INSERT
WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id, created_at DESC);

-- Function: admin adjusts balance with transaction record
CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(
  target_user_id UUID,
  amount_delta NUMERIC,
  reason TEXT DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance NUMERIC;
  tx_type TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF amount_delta = 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  tx_type := CASE WHEN amount_delta > 0 THEN 'credit' ELSE 'debit' END;

  UPDATE public.profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + amount_delta,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING wallet_balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  INSERT INTO public.wallet_transactions (user_id, amount, type, description, created_by)
  VALUES (target_user_id, ABS(amount_delta), tx_type, reason, auth.uid());

  RETURN new_balance;
END;
$$;

-- cart_items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pack_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart select" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own cart insert" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cart delete" ON public.cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- pack_purchases
CREATE TABLE public.pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  price_paid NUMERIC NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pack_id)
);
GRANT SELECT, INSERT ON public.pack_purchases TO authenticated;
GRANT ALL ON public.pack_purchases TO service_role;
ALTER TABLE public.pack_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchases select" ON public.pack_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- purchase_cart RPC
CREATE OR REPLACE FUNCTION public.purchase_cart()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  total NUMERIC := 0;
  balance NUMERIC := 0;
  new_balance NUMERIC;
  item RECORD;
BEGIN
  IF uid IS NULL THEN RETURN json_build_object('success', false, 'error', 'not_authenticated'); END IF;

  SELECT COALESCE(SUM(COALESCE(p.price, 0)), 0) INTO total
  FROM public.cart_items ci
  JOIN public.packs p ON p.id = ci.pack_id
  WHERE ci.user_id = uid;

  SELECT COALESCE(wallet_balance, 0) INTO balance FROM public.profiles WHERE user_id = uid;

  IF total > balance THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_balance', 'total', total, 'balance', balance);
  END IF;

  FOR item IN
    SELECT ci.pack_id, COALESCE(p.price, 0) AS price
    FROM public.cart_items ci
    JOIN public.packs p ON p.id = ci.pack_id
    WHERE ci.user_id = uid
  LOOP
    INSERT INTO public.pack_purchases (user_id, pack_id, price_paid)
    VALUES (uid, item.pack_id, item.price)
    ON CONFLICT (user_id, pack_id) DO NOTHING;
  END LOOP;

  DELETE FROM public.cart_items WHERE user_id = uid;

  IF total > 0 THEN
    UPDATE public.profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) - total,
        updated_at = now()
    WHERE user_id = uid
    RETURNING wallet_balance INTO new_balance;

    INSERT INTO public.wallet_transactions (user_id, amount, type, description, created_by)
    VALUES (uid, total, 'debit', 'Compra de packs', uid);
  ELSE
    new_balance := balance;
  END IF;

  RETURN json_build_object('success', true, 'total', total, 'new_balance', new_balance);
END;
$$;

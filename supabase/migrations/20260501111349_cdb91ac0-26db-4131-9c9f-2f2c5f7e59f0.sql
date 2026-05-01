
-- ============= ADMIN BADGES =============
CREATE TABLE IF NOT EXISTS public.admin_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active admin badges" ON public.admin_badges;
CREATE POLICY "Anyone can view active admin badges" ON public.admin_badges
FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage admin badges" ON public.admin_badges;
CREATE POLICY "Admins manage admin badges" ON public.admin_badges
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============= USER ADMIN BADGES (atribuídos) =============
CREATE TABLE IF NOT EXISTS public.user_admin_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.admin_badges(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID,
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_admin_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view user admin badges" ON public.user_admin_badges;
CREATE POLICY "Anyone can view user admin badges" ON public.user_admin_badges
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins grant user badges" ON public.user_admin_badges;
CREATE POLICY "Admins grant user badges" ON public.user_admin_badges
FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins or self can revoke user badges" ON public.user_admin_badges;
CREATE POLICY "Admins or self can revoke user badges" ON public.user_admin_badges
FOR DELETE USING (public.is_admin() OR auth.uid() = user_id);

-- ============= PROFILE EXTENSIONS =============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_badges_in_bio BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_badges_in_thought BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_decoration_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_decoration_position JSONB,
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saved_themes JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ============= APP WALLET SETTINGS (ícone saldo) =============
-- usa app_settings existente; apenas garantimos chaves padrão pode ser inserido pelo client

-- ============= STORAGE: emojis bucket policies (reforço) =============
DROP POLICY IF EXISTS "Public can view emoji files" ON storage.objects;
CREATE POLICY "Public can view emoji files" ON storage.objects
FOR SELECT USING (bucket_id = 'emojis');

DROP POLICY IF EXISTS "Admins can upload emoji files" ON storage.objects;
CREATE POLICY "Admins can upload emoji files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update emoji files" ON storage.objects;
CREATE POLICY "Admins can update emoji files" ON storage.objects
FOR UPDATE USING (bucket_id = 'emojis' AND public.is_admin())
WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete emoji files" ON storage.objects;
CREATE POLICY "Admins can delete emoji files" ON storage.objects
FOR DELETE USING (bucket_id = 'emojis' AND public.is_admin());

-- ============= STORAGE: bucket badges =============
INSERT INTO storage.buckets (id, name, public)
VALUES ('badges', 'badges', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view badge files" ON storage.objects;
CREATE POLICY "Public can view badge files" ON storage.objects
FOR SELECT USING (bucket_id = 'badges');

DROP POLICY IF EXISTS "Admins manage badge files" ON storage.objects;
CREATE POLICY "Admins manage badge files" ON storage.objects
FOR ALL USING (bucket_id = 'badges' AND public.is_admin())
WITH CHECK (bucket_id = 'badges' AND public.is_admin());

-- ============= STORAGE: bucket decorations (decoração de perfil) =============
INSERT INTO storage.buckets (id, name, public)
VALUES ('decorations', 'decorations', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view decoration files" ON storage.objects;
CREATE POLICY "Public can view decoration files" ON storage.objects
FOR SELECT USING (bucket_id = 'decorations');

DROP POLICY IF EXISTS "Admins manage decoration files" ON storage.objects;
CREATE POLICY "Admins manage decoration files" ON storage.objects
FOR ALL USING (bucket_id = 'decorations' AND public.is_admin())
WITH CHECK (bucket_id = 'decorations' AND public.is_admin());

-- ============= TABELA decorations (catalogo) =============
CREATE TABLE IF NOT EXISTS public.profile_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_decorations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view decorations" ON public.profile_decorations;
CREATE POLICY "Anyone can view decorations" ON public.profile_decorations
FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage decorations" ON public.profile_decorations;
CREATE POLICY "Admins manage decorations" ON public.profile_decorations
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============= função para set wallet (apenas admin) =============
CREATE OR REPLACE FUNCTION public.admin_set_wallet_balance(target_user_id UUID, new_balance NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN false; END IF;
  UPDATE public.profiles SET wallet_balance = new_balance, updated_at = now() WHERE user_id = target_user_id;
  RETURN FOUND;
END;
$$;

-- ============= função: login por @ retorna email =============
CREATE OR REPLACE FUNCTION public.email_for_username(uname TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  uid UUID;
  em TEXT;
BEGIN
  SELECT user_id INTO uid FROM public.profiles WHERE LOWER(username) = LOWER(TRIM(uname)) LIMIT 1;
  IF uid IS NULL THEN RETURN NULL; END IF;
  SELECT email INTO em FROM auth.users WHERE id = uid;
  RETURN em;
END;
$$;

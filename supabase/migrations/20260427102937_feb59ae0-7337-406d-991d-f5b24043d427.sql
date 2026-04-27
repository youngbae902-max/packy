ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_badge_bg_color text DEFAULT '#0F2B1A',
  ADD COLUMN IF NOT EXISTS verified_badge_text_color text DEFAULT '#16A249',
  ADD COLUMN IF NOT EXISTS admin_badge_bg_color text DEFAULT '#082D0F',
  ADD COLUMN IF NOT EXISTS admin_badge_border_color text DEFAULT '#085A18',
  ADD COLUMN IF NOT EXISTS admin_badge_text_color text DEFAULT '#05BD2A';

DROP POLICY IF EXISTS "Admins can insert custom emojis" ON public.custom_emojis;
DROP POLICY IF EXISTS "Admins can update custom emojis" ON public.custom_emojis;
DROP POLICY IF EXISTS "Admins can delete custom emojis" ON public.custom_emojis;
DROP POLICY IF EXISTS "Anyone can view active custom emojis" ON public.custom_emojis;

CREATE POLICY "Admins can insert custom emojis"
ON public.custom_emojis
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update custom emojis"
ON public.custom_emojis
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete custom emojis"
ON public.custom_emojis
FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Anyone can view active custom emojis"
ON public.custom_emojis
FOR SELECT
TO public
USING ((is_active = true) OR public.is_admin());

DROP POLICY IF EXISTS "Admins can upload emoji files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update emoji files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete emoji files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view emoji files" ON storage.objects;

CREATE POLICY "Anyone can view emoji files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'emojis');

CREATE POLICY "Admins can upload emoji files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

CREATE POLICY "Admins can update emoji files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'emojis' AND public.is_admin())
WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

CREATE POLICY "Admins can delete emoji files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'emojis' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.change_my_password(new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF LENGTH(COALESCE(new_password, '')) < 6 THEN
    RETURN false;
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = current_user_id;

  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_user_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  requester_username text;
BEGIN
  SELECT LOWER(TRIM(username)) INTO requester_username
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF requester_username IS DISTINCT FROM 'goat' THEN
    RETURN false;
  END IF;

  IF target_user_id = auth.uid() THEN
    RETURN false;
  END IF;

  IF LENGTH(COALESCE(new_password, '')) < 6 THEN
    RETURN false;
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_password_with_keyword(account_email text, keyword text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  target_user_id uuid;
  stored_keyword text;
BEGIN
  IF LENGTH(COALESCE(new_password, '')) < 6 THEN
    RETURN false;
  END IF;

  SELECT au.id, p.recovery_keyword INTO target_user_id, stored_keyword
  FROM auth.users au
  JOIN public.profiles p ON p.user_id = au.id
  WHERE LOWER(au.email) = LOWER(TRIM(account_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF NULLIF(TRIM(COALESCE(stored_keyword, '')), '') IS NULL THEN
    RETURN false;
  END IF;

  IF LOWER(TRIM(stored_keyword)) IS DISTINCT FROM LOWER(TRIM(COALESCE(keyword, ''))) THEN
    RETURN false;
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  RETURN true;
END;
$function$;
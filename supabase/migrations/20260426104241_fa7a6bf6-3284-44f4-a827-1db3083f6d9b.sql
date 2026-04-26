CREATE OR REPLACE FUNCTION public.reset_password_with_keyword(account_email text, keyword text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_login(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_username text;
  target_email text;
BEGIN
  SELECT username INTO requester_username
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF requester_username IS DISTINCT FROM 'goat' THEN
    RETURN NULL;
  END IF;

  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  RETURN target_email;
END;
$$;
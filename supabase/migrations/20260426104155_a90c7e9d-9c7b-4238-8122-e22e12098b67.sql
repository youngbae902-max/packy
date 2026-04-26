ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_mode text NOT NULL DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS recovery_keyword text;

CREATE OR REPLACE FUNCTION public.validate_profile_required_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NULLIF(TRIM(COALESCE(NEW.username, '')), '') IS NULL THEN
    RAISE EXCEPTION 'username_required';
  END IF;

  IF NULLIF(TRIM(COALESCE(NEW.artist_name, '')), '') IS NULL THEN
    RAISE EXCEPTION 'artist_name_required';
  END IF;

  IF NULLIF(TRIM(COALESCE(NEW.avatar_url, '')), '') IS NULL THEN
    RAISE EXCEPTION 'avatar_required';
  END IF;

  IF NEW.theme_mode NOT IN ('dark', 'light') THEN
    RAISE EXCEPTION 'invalid_theme_mode';
  END IF;

  IF TG_OP = 'UPDATE' AND auth.uid() IS DISTINCT FROM NEW.user_id THEN
    NEW.recovery_keyword = OLD.recovery_keyword;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_required_fields_trigger ON public.profiles;
CREATE TRIGGER validate_profile_required_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_required_fields();

CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_user_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_username text;
BEGIN
  SELECT username INTO requester_username
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
$$;
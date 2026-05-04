-- Fix validation trigger: only block updates that explicitly try to set required fields to empty values.
-- Previously this trigger ran on every UPDATE and blocked new users (with empty username/artist_name/avatar)
-- from uploading photos, saving colors, applying decorations, etc.
CREATE OR REPLACE FUNCTION public.validate_profile_required_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only validate username if it is being changed AND the new value is empty.
  IF (TG_OP = 'INSERT' OR NEW.username IS DISTINCT FROM OLD.username)
     AND OLD.username IS NOT NULL
     AND NULLIF(TRIM(COALESCE(NEW.username, '')), '') IS NULL THEN
    RAISE EXCEPTION 'username_required';
  END IF;

  IF (TG_OP = 'INSERT' OR NEW.artist_name IS DISTINCT FROM OLD.artist_name)
     AND OLD.artist_name IS NOT NULL
     AND NULLIF(TRIM(COALESCE(NEW.artist_name, '')), '') IS NULL THEN
    RAISE EXCEPTION 'artist_name_required';
  END IF;

  IF (TG_OP = 'INSERT' OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url)
     AND OLD.avatar_url IS NOT NULL
     AND NULLIF(TRIM(COALESCE(NEW.avatar_url, '')), '') IS NULL THEN
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
$function$;

-- Enable realtime updates for wallet & profiles so balance updates instantly.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallet_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
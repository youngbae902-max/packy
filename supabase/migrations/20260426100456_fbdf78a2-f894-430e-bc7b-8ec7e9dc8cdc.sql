ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_accent_color TEXT,
ADD COLUMN IF NOT EXISTS online_accent_color TEXT;

CREATE TABLE IF NOT EXISTS public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  cover_url TEXT,
  icon_name TEXT DEFAULT 'file',
  placement TEXT NOT NULL DEFAULT 'home',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update profiles'
  ) THEN
    CREATE POLICY "Admins can update profiles"
    ON public.profiles
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_pages' AND policyname = 'Anyone can view active custom pages'
  ) THEN
    CREATE POLICY "Anyone can view active custom pages"
    ON public.custom_pages
    FOR SELECT
    USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_pages' AND policyname = 'Admins can view all custom pages'
  ) THEN
    CREATE POLICY "Admins can view all custom pages"
    ON public.custom_pages
    FOR SELECT
    USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_pages' AND policyname = 'Admins can insert custom pages'
  ) THEN
    CREATE POLICY "Admins can insert custom pages"
    ON public.custom_pages
    FOR INSERT
    WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_pages' AND policyname = 'Admins can update custom pages'
  ) THEN
    CREATE POLICY "Admins can update custom pages"
    ON public.custom_pages
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'custom_pages' AND policyname = 'Admins can delete custom pages'
  ) THEN
    CREATE POLICY "Admins can delete custom pages"
    ON public.custom_pages
    FOR DELETE
    USING (is_admin());
  END IF;
END $$;

CREATE OR REPLACE TRIGGER update_custom_pages_updated_at
BEFORE UPDATE ON public.custom_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RETURN false;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = target_user_id 
    AND LOWER(email) = 'youngbae902@gmail.com'
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.pack_comments WHERE user_id = target_user_id;
  DELETE FROM public.pack_reposts WHERE user_id = target_user_id;
  DELETE FROM public.user_follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  DELETE FROM public.pack_downloads WHERE user_id = target_user_id;
  DELETE FROM public.pack_favorites WHERE user_id = target_user_id;
  DELETE FROM public.pack_likes WHERE user_id = target_user_id;
  DELETE FROM public.user_inbox WHERE user_id = target_user_id;
  DELETE FROM public.wishlists WHERE user_id = target_user_id;
  DELETE FROM public.user_badges WHERE user_id = target_user_id;
  DELETE FROM public.album_links WHERE album_id IN (SELECT id FROM public.albums WHERE created_by = target_user_id);
  DELETE FROM public.album_packs WHERE album_id IN (SELECT id FROM public.albums WHERE created_by = target_user_id);
  DELETE FROM public.albums WHERE created_by = target_user_id;
  DELETE FROM public.packs WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_my_account()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = current_user_id 
    AND LOWER(email) = 'youngbae902@gmail.com'
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.pack_comments WHERE user_id = current_user_id;
  DELETE FROM public.pack_reposts WHERE user_id = current_user_id;
  DELETE FROM public.user_follows WHERE follower_id = current_user_id OR following_id = current_user_id;
  DELETE FROM public.pack_downloads WHERE user_id = current_user_id;
  DELETE FROM public.pack_favorites WHERE user_id = current_user_id;
  DELETE FROM public.pack_likes WHERE user_id = current_user_id;
  DELETE FROM public.user_inbox WHERE user_id = current_user_id;
  DELETE FROM public.wishlists WHERE user_id = current_user_id;
  DELETE FROM public.user_badges WHERE user_id = current_user_id;
  DELETE FROM public.album_links WHERE album_id IN (SELECT id FROM public.albums WHERE created_by = current_user_id);
  DELETE FROM public.album_packs WHERE album_id IN (SELECT id FROM public.albums WHERE created_by = current_user_id);
  DELETE FROM public.albums WHERE created_by = current_user_id;
  DELETE FROM public.packs WHERE user_id = current_user_id;
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE user_id = current_user_id;
  
  RETURN true;
END;
$function$;
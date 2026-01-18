-- Enable user deletion for inbox and wishlists
-- Add policies for users to delete their own inbox messages and wishlists

-- User Inbox: Allow users to delete their own messages
CREATE POLICY "Users can delete own inbox messages" 
ON public.user_inbox 
FOR DELETE 
USING (auth.uid() = user_id);

-- Wishlists: Allow users to delete their own wishlist items
CREATE POLICY "Users can delete own wishlists" 
ON public.wishlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add Spotify badge to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_spotify_badge BOOLEAN DEFAULT false;

-- Create events/announcements table for admin to post on home page
CREATE TABLE IF NOT EXISTS public.site_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('youtube', 'instagram', 'whatsapp', 'text', 'text_link')),
  title TEXT NOT NULL,
  content TEXT,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events" 
ON public.site_events 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all events" 
ON public.site_events 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert events" 
ON public.site_events 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update events" 
ON public.site_events 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete events" 
ON public.site_events 
FOR DELETE 
USING (is_admin());

-- Add soft delete (trash) column to packs, acapellas
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.acapellas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add album links table for external links in albums
CREATE TABLE IF NOT EXISTS public.album_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  link_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.album_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view album links" 
ON public.album_links 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage album links" 
ON public.album_links 
FOR ALL
USING (is_admin());

-- Function to send gift to all users
CREATE OR REPLACE FUNCTION public.send_gift_to_all(gift_pack_id UUID, gift_message TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_count INTEGER := 0;
BEGIN
  IF NOT is_admin() THEN
    RETURN 0;
  END IF;
  
  INSERT INTO public.user_inbox (user_id, type, title, message, pack_id)
  SELECT 
    p.user_id,
    'gift',
    'Você recebeu um presente do adm pai, se diverte!',
    COALESCE(gift_message, 'O admin enviou um pack especial para você!'),
    gift_pack_id
  FROM public.profiles p
  WHERE p.user_id != auth.uid();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Also unlock packs for all users
  INSERT INTO public.pack_downloads (user_id, pack_id)
  SELECT p.user_id, gift_pack_id
  FROM public.profiles p
  WHERE p.user_id != auth.uid()
  ON CONFLICT DO NOTHING;
  
  RETURN affected_count;
END;
$$;

-- Function to delete user account
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Don't allow deletion of main admin
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = current_user_id 
    AND LOWER(email) = 'youngbae902@gmail.com'
  ) THEN
    RETURN false;
  END IF;
  
  -- Delete all user data
  DELETE FROM public.pack_downloads WHERE user_id = current_user_id;
  DELETE FROM public.pack_favorites WHERE user_id = current_user_id;
  DELETE FROM public.pack_likes WHERE user_id = current_user_id;
  DELETE FROM public.user_inbox WHERE user_id = current_user_id;
  DELETE FROM public.wishlists WHERE user_id = current_user_id;
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE user_id = current_user_id;
  
  RETURN true;
END;
$$;

-- Function to delete user account (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN false;
  END IF;
  
  -- Don't allow deletion of main admin
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = target_user_id 
    AND LOWER(email) = 'youngbae902@gmail.com'
  ) THEN
    RETURN false;
  END IF;
  
  -- Delete all user data
  DELETE FROM public.pack_downloads WHERE user_id = target_user_id;
  DELETE FROM public.pack_favorites WHERE user_id = target_user_id;
  DELETE FROM public.pack_likes WHERE user_id = target_user_id;
  DELETE FROM public.user_inbox WHERE user_id = target_user_id;
  DELETE FROM public.wishlists WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Protect main admin from role changes
CREATE OR REPLACE FUNCTION public.protect_main_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  main_admin_id UUID;
BEGIN
  -- Get main admin user_id
  SELECT id INTO main_admin_id 
  FROM auth.users 
  WHERE LOWER(email) = 'youngbae902@gmail.com';
  
  IF main_admin_id IS NOT NULL THEN
    -- Prevent deletion of main admin role
    IF TG_OP = 'DELETE' AND OLD.user_id = main_admin_id AND OLD.role = 'admin' THEN
      RAISE EXCEPTION 'Cannot remove admin role from main admin';
    END IF;
    
    -- Prevent update of main admin role
    IF TG_OP = 'UPDATE' AND OLD.user_id = main_admin_id AND OLD.role = 'admin' THEN
      RAISE EXCEPTION 'Cannot modify main admin role';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_main_admin_trigger ON public.user_roles;
CREATE TRIGGER protect_main_admin_trigger
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_main_admin();

-- Add trigger to protect main admin profile
CREATE OR REPLACE FUNCTION public.protect_main_admin_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  main_admin_id UUID;
BEGIN
  SELECT id INTO main_admin_id 
  FROM auth.users 
  WHERE LOWER(email) = 'youngbae902@gmail.com';
  
  IF main_admin_id IS NOT NULL AND OLD.user_id = main_admin_id THEN
    -- Only allow the main admin to update their own profile
    IF auth.uid() != main_admin_id THEN
      IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Cannot delete main admin profile';
      END IF;
      -- Allow only certain updates by other admins
      IF TG_OP = 'UPDATE' AND (NEW.is_banned = true) THEN
        RAISE EXCEPTION 'Cannot ban main admin';
      END IF;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_main_admin_profile_trigger ON public.profiles;
CREATE TRIGGER protect_main_admin_profile_trigger
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_main_admin_profile();
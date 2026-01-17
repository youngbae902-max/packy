-- Add new columns to profiles for username system, ban status, and online presence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username_changes_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_username_change_date date,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Create albums table
CREATE TABLE public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_url text,
  description text,
  style text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create album_packs junction table
CREATE TABLE public.album_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
  pack_id uuid REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(album_id, pack_id)
);

-- Create wishlist table for user requests
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_text text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  admin_response text,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone
);

-- Create user_inbox for notifications and gifts
CREATE TABLE public.user_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('notification', 'gift', 'wishlist_response')),
  title text NOT NULL,
  message text,
  pack_id uuid REFERENCES public.packs(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inbox ENABLE ROW LEVEL SECURITY;

-- Albums policies (public read, admin write)
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Admins can insert albums" ON public.albums FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update albums" ON public.albums FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete albums" ON public.albums FOR DELETE USING (is_admin());

-- Album packs policies
CREATE POLICY "Anyone can view album packs" ON public.album_packs FOR SELECT USING (true);
CREATE POLICY "Admins can manage album packs" ON public.album_packs FOR ALL USING (is_admin());

-- Wishlist policies
CREATE POLICY "Users can view own wishlists" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert wishlists" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all wishlists" ON public.wishlists FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update wishlists" ON public.wishlists FOR UPDATE USING (is_admin());

-- User inbox policies
CREATE POLICY "Users can view own inbox" ON public.user_inbox FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox" ON public.user_inbox FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert inbox messages" ON public.user_inbox FOR INSERT WITH CHECK (is_admin());

-- Function to check and update username
CREATE OR REPLACE FUNCTION public.update_username(new_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_changes integer;
  last_change_date date;
  username_exists boolean;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Não autenticado');
  END IF;
  
  -- Check if username already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE username = new_username AND user_id != current_user_id
  ) INTO username_exists;
  
  IF username_exists THEN
    RETURN json_build_object('success', false, 'error', 'Este @ já está em uso');
  END IF;
  
  -- Get current changes count and date
  SELECT username_changes_today, last_username_change_date 
  INTO current_changes, last_change_date
  FROM public.profiles WHERE user_id = current_user_id;
  
  -- Reset counter if it's a new day
  IF last_change_date IS NULL OR last_change_date < CURRENT_DATE THEN
    current_changes := 0;
  END IF;
  
  -- Check if user has exceeded daily limit
  IF current_changes >= 3 THEN
    RETURN json_build_object('success', false, 'error', 'Você já alterou seu @ 3 vezes hoje');
  END IF;
  
  -- Update username
  UPDATE public.profiles 
  SET username = new_username,
      username_changes_today = current_changes + 1,
      last_username_change_date = CURRENT_DATE,
      updated_at = now()
  WHERE user_id = current_user_id;
  
  RETURN json_build_object('success', true, 'remaining_changes', 2 - current_changes);
END;
$$;

-- Function to ban/unban user (admin only)
CREATE OR REPLACE FUNCTION public.set_user_ban_status(target_user_id uuid, ban_status boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles 
  SET is_banned = ban_status, updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Function to update online status
CREATE OR REPLACE FUNCTION public.update_online_status(online_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_online = online_status, last_seen = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Function to send gift to user (admin only)
CREATE OR REPLACE FUNCTION public.send_gift(target_user_id uuid, gift_pack_id uuid, gift_message text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN false;
  END IF;
  
  -- Add to inbox
  INSERT INTO public.user_inbox (user_id, type, title, message, pack_id)
  VALUES (
    target_user_id, 
    'gift', 
    'Você recebeu um presente do adm pai, se diverte!',
    COALESCE(gift_message, 'O admin enviou um pack especial para você!'),
    gift_pack_id
  );
  
  -- Also unlock the pack for the user
  INSERT INTO public.pack_downloads (user_id, pack_id)
  VALUES (target_user_id, gift_pack_id)
  ON CONFLICT DO NOTHING;
  
  RETURN true;
END;
$$;

-- Add trigger for albums updated_at
CREATE TRIGGER update_albums_updated_at
BEFORE UPDATE ON public.albums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add policy for admins to view all profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());
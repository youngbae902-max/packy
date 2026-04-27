DROP POLICY IF EXISTS "Anyone can view emoji files" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.change_my_password(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.change_my_password(text) FROM public;
GRANT EXECUTE ON FUNCTION public.change_my_password(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text) TO authenticated;
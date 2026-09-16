UPDATE public.user_roles r
SET role = 'admin'
FROM auth.users u
WHERE u.id = r.user_id AND u.email = 'info@centreforgreendevelopment.org';
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
  page_path IS NOT NULL
  AND length(page_path) BETWEEN 1 AND 2048
  AND (visitor_id IS NULL OR length(visitor_id) <= 256)
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
  AND (referrer IS NULL OR length(referrer) <= 2048)
  AND (country IS NULL OR length(country) <= 128)
);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND (name IS NULL OR length(name) <= 200)
);

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_content_manager(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_content_manager(UUID) TO service_role;
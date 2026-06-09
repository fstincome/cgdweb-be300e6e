
-- site_settings
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
CREATE POLICY "Authenticated can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (true);

-- partners
DROP POLICY IF EXISTS "Admins can insert partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can update partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can delete partners" ON public.partners;
CREATE POLICY "Authenticated can insert partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update partners" ON public.partners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete partners" ON public.partners FOR DELETE TO authenticated USING (true);

-- team_members
DROP POLICY IF EXISTS "Admins can insert team" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team" ON public.team_members;
CREATE POLICY "Authenticated can insert team" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update team" ON public.team_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete team" ON public.team_members FOR DELETE TO authenticated USING (true);

-- menu_items
DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can view all menu items" ON public.menu_items;
CREATE POLICY "Authenticated can view all menu items" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (true);

-- programs
DROP POLICY IF EXISTS "Content managers can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Content managers can update programs" ON public.programs;
DROP POLICY IF EXISTS "Content managers can delete programs" ON public.programs;
CREATE POLICY "Authenticated can insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update programs" ON public.programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete programs" ON public.programs FOR DELETE TO authenticated USING (true);

-- projects
DROP POLICY IF EXISTS "Content managers can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Content managers can update projects" ON public.projects;
DROP POLICY IF EXISTS "Content managers can delete projects" ON public.projects;
CREATE POLICY "Authenticated can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete projects" ON public.projects FOR DELETE TO authenticated USING (true);

-- pages
DROP POLICY IF EXISTS "Content managers can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Content managers can update pages" ON public.pages;
DROP POLICY IF EXISTS "Content managers can delete pages" ON public.pages;
DROP POLICY IF EXISTS "Content managers can view all pages" ON public.pages;
CREATE POLICY "Authenticated can view all pages" ON public.pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update pages" ON public.pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete pages" ON public.pages FOR DELETE TO authenticated USING (true);

-- categories
DROP POLICY IF EXISTS "Content managers can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Content managers can update categories" ON public.categories;
DROP POLICY IF EXISTS "Content managers can delete categories" ON public.categories;
CREATE POLICY "Authenticated can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update categories" ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- articles
DROP POLICY IF EXISTS "Content managers can update all articles" ON public.articles;
DROP POLICY IF EXISTS "Content managers can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Content managers can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can view own articles" ON public.articles;
CREATE POLICY "Authenticated can view all articles" ON public.articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update articles" ON public.articles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete articles" ON public.articles FOR DELETE TO authenticated USING (true);

-- testimonials
DROP POLICY IF EXISTS "Content managers can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Content managers can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Content managers can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Content managers can view all testimonials" ON public.testimonials;
CREATE POLICY "Authenticated can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

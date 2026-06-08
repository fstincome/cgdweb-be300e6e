DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor', 'author', 'visitor');
  END IF;
END $$;

GRANT USAGE ON TYPE public.app_role TO authenticated, service_role;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'visitor',
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  role_en TEXT,
  bio TEXT,
  bio_en TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  content TEXT,
  content_en TEXT,
  slug TEXT UNIQUE,
  slug_en TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  meta_title TEXT,
  meta_title_en TEXT,
  meta_description TEXT,
  meta_description_en TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  visitor_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT, DELETE ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  description_en TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_fr JSONB,
  value_en JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_fr TEXT NOT NULL,
  quote_en TEXT,
  name TEXT NOT NULL,
  role_fr TEXT,
  role_en TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  body TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_fr TEXT NOT NULL,
  label_en TEXT,
  path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_external BOOLEAN NOT NULL DEFAULT false,
  highlight BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_content_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Content managers can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.is_content_manager(auth.uid())) WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Team viewable by everyone" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert team" ON public.team_members FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update team" ON public.team_members FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete team" ON public.team_members FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Programs viewable by everyone" ON public.programs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Content managers can insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can update programs" ON public.programs FOR UPDATE TO authenticated USING (public.is_content_manager(auth.uid())) WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete programs" ON public.programs FOR DELETE TO authenticated USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Content managers can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_content_manager(auth.uid())) WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Published articles viewable by everyone" ON public.articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Authors can view own articles" ON public.articles FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Content managers can view all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_content_manager(auth.uid()));
CREATE POLICY "Authors can create articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own articles" ON public.articles FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Content managers can update all articles" ON public.articles FOR UPDATE TO authenticated USING (public.is_content_manager(auth.uid())) WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete articles" ON public.articles FOR DELETE TO authenticated USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Published pages viewable by everyone" ON public.pages FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Content managers can view all pages" ON public.pages FOR SELECT TO authenticated USING (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can update pages" ON public.pages FOR UPDATE TO authenticated USING (public.is_content_manager(auth.uid())) WITH CHECK (public.is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete pages" ON public.pages FOR DELETE TO authenticated USING (public.is_content_manager(auth.uid()));

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete page views" ON public.page_views FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can read partners" ON public.partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update partners" ON public.partners FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete partners" ON public.partners FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Published testimonials viewable by everyone" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Approved comments viewable by everyone" ON public.comments FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Admins can view all comments" ON public.comments FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can submit comments" ON public.comments FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "Admins can update comments" ON public.comments FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Menu items viewable by everyone" ON public.menu_items FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "Admins can view all menu items" ON public.menu_items FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_articles_published ON public.articles (published, publish_date DESC);
CREATE INDEX idx_articles_category_id ON public.articles (category_id);
CREATE UNIQUE INDEX idx_articles_slug_en_unique ON public.articles (slug_en) WHERE slug_en IS NOT NULL;
CREATE INDEX idx_projects_program_id ON public.projects (program_id);
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views (page_path);
CREATE INDEX idx_comments_content ON public.comments (content_type, content_id, created_at);
CREATE INDEX idx_comments_parent_id ON public.comments (parent_id);
CREATE INDEX idx_menu_items_order ON public.menu_items (display_order);

CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Admins can delete uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND public.is_admin(auth.uid()));

INSERT INTO public.site_settings (key, description, value_fr, value_en) VALUES
('home.hero', 'Diaporama du hero (titre, sous-titre, image)',
  '{"slides":[
    {"title":"Promouvoir la transparence","subtitle":"Pour une gouvernance redevable au Burundi","image":"https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"},
    {"title":"Littératie économique","subtitle":"Donner aux citoyens les clés de compréhension","image":"https://lh3.googleusercontent.com/d/1_2LqoCzdX4DzAWXazdG-7Q8WntSAXQ4o"},
    {"title":"Développement durable","subtitle":"Construire un avenir équilibré pour tous","image":"https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"},
    {"title":"Communauté engagée","subtitle":"Ensemble pour le changement","image":"https://lh3.googleusercontent.com/d/1_2LqoCzdX4DzAWXazdG-7Q8WntSAXQ4o"}
  ],"cta_primary":"Découvrir nos programmes","cta_secondary":"Faire un don"}'::jsonb,
  '{"slides":[
    {"title":"Promoting transparency","subtitle":"For accountable governance in Burundi","image":"https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"},
    {"title":"Economic literacy","subtitle":"Empowering citizens with understanding","image":"https://lh3.googleusercontent.com/d/1_2LqoCzdX4DzAWXazdG-7Q8WntSAXQ4o"},
    {"title":"Sustainable development","subtitle":"Building a balanced future for all","image":"https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"},
    {"title":"Engaged community","subtitle":"Together for change","image":"https://lh3.googleusercontent.com/d/1_2LqoCzdX4DzAWXazdG-7Q8WntSAXQ4o"}
  ],"cta_primary":"Discover our programs","cta_secondary":"Donate"}'::jsonb),
('home.stats', 'Statistiques affichées sur la page d''accueil',
  '{"items":[
    {"icon":"Users","value":"5,000+","label":"Bénéficiaires"},
    {"icon":"BookOpen","value":"120+","label":"Articles publiés"},
    {"icon":"Target","value":"25+","label":"Projets réalisés"},
    {"icon":"Globe","value":"10+","label":"Partenaires"}
  ]}'::jsonb,
  '{"items":[
    {"icon":"Users","value":"5,000+","label":"Beneficiaries"},
    {"icon":"BookOpen","value":"120+","label":"Articles published"},
    {"icon":"Target","value":"25+","label":"Projects delivered"},
    {"icon":"Globe","value":"10+","label":"Partners"}
  ]}'::jsonb),
('home.pillars', 'Section piliers fondamentaux',
  '{"badge":"Notre mission","title":"Nos piliers fondamentaux","subtitle":"Nous œuvrons pour un Burundi plus transparent, éduqué et durable à travers trois axes stratégiques.","items":[
    {"icon":"Shield","title":"Transparence","desc":"Promouvoir la redevabilité et la bonne gouvernance dans les institutions publiques."},
    {"icon":"Lightbulb","title":"Littératie économique","desc":"Donner aux citoyens les connaissances pour des décisions éclairées."},
    {"icon":"Users","title":"Communauté","desc":"Construire une société où liberté et durabilité se renforcent mutuellement."}
  ]}'::jsonb,
  '{"badge":"Our mission","title":"Our core pillars","subtitle":"We work for a more transparent, educated and sustainable Burundi through three strategic axes.","items":[
    {"icon":"Shield","title":"Transparency","desc":"Promoting accountability and good governance in public institutions."},
    {"icon":"Lightbulb","title":"Economic literacy","desc":"Giving citizens the knowledge for informed decisions."},
    {"icon":"Users","title":"Community","desc":"Building a society where freedom and sustainability reinforce each other."}
  ]}'::jsonb),
('home.cta_banner', 'Bannière CTA au milieu de la page',
  '{"title":"Ensemble, construisons un avenir durable pour le Burundi","subtitle":"Votre soutien fait la différence. Rejoignez notre communauté de changement.","button":"Faire un don","link":"/donate"}'::jsonb,
  '{"title":"Together, let''s build a sustainable future for Burundi","subtitle":"Your support makes the difference. Join our community of change.","button":"Donate","link":"/donate"}'::jsonb),
('home.final_cta', 'Section CTA finale',
  '{"title":"Prêt à agir ?","subtitle":"Contactez-nous pour devenir partenaire ou bénévole.","button":"Nous contacter","link":"/contact"}'::jsonb,
  '{"title":"Ready to act?","subtitle":"Contact us to become a partner or volunteer.","button":"Contact us","link":"/contact"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.testimonials (quote_fr, quote_en, name, role_fr, role_en, display_order) VALUES
('Green Think Hub m''a ouvert les yeux sur la gestion transparente des finances publiques. Leur programme de littératie économique est transformateur.', 'Green Think Hub opened my eyes to transparent management of public finances. Their economic literacy program is transformative.', 'Jean-Pierre N.', 'Entrepreneur, Bujumbura', 'Entrepreneur, Bujumbura', 1),
('Grâce à leurs formations, notre communauté comprend désormais l''importance de la redevabilité. Un travail essentiel pour le Burundi.', 'Thanks to their training, our community now understands the importance of accountability. Essential work for Burundi.', 'Marie-Claire H.', 'Enseignante, Gitega', 'Teacher, Gitega', 2),
('Leur approche inclusive et leur engagement envers le développement durable font de Green Think Hub un partenaire de confiance.', 'Their inclusive approach and commitment to sustainable development make Green Think Hub a trusted partner.', 'Dr. Patrick M.', 'Chercheur, Université du Burundi', 'Researcher, University of Burundi', 3),
('Les ateliers sur la gouvernance locale ont transformé notre façon de dialoguer avec les autorités.', 'Workshops on local governance transformed how we engage with authorities.', 'Aline K.', 'Activiste communautaire, Ngozi', 'Community activist, Ngozi', 4),
('En tant que journaliste, les ressources de Green Think Hub m''aident à produire des enquêtes plus rigoureuses.', 'As a journalist, Green Think Hub resources help me produce more rigorous investigations.', 'Fabrice B.', 'Journaliste indépendant', 'Independent journalist', 5);

INSERT INTO public.menu_items (label_fr, label_en, path, display_order, highlight) VALUES
('Accueil', 'Home', '/', 1, false),
('À propos', 'About', '/about', 2, false),
('Programmes', 'Programs', '/programs', 3, false),
('Projets', 'Projects', '/projects', 4, false),
('Nos Articles', 'Our Articles', '/blog', 5, false),
('Équipe', 'Team', '/team', 6, false),
('Contact', 'Contact', '/contact', 7, false),
('Partenaires', 'Partners', '/partners', 8, false),
('Faire un don', 'Donate', '/donate', 9, true);
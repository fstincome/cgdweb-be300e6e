-- ============ NEW TABLES ============

-- site_settings: key/value store with JSON value supporting FR + EN
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_fr JSONB,
  value_en JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_fr TEXT NOT NULL,
  quote_en TEXT,
  name TEXT NOT NULL,
  role_fr TEXT,
  role_en TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published testimonials viewable by everyone"
  ON public.testimonials FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all testimonials"
  ON public.testimonials FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADD EN COLUMNS ============

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
  ADD COLUMN IF NOT EXISTS slug_en TEXT;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS role_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_en TEXT;

-- ============ SEED HOMEPAGE CONTENT ============

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
  '{"title":"Ready to act?","subtitle":"Contact us to become a partner or volunteer.","button":"Contact us","link":"/contact"}'::jsonb);

-- Seed testimonials
INSERT INTO public.testimonials (quote_fr, quote_en, name, role_fr, role_en, display_order) VALUES
('Green Think Hub m''a ouvert les yeux sur la gestion transparente des finances publiques. Leur programme de littératie économique est transformateur.',
 'Green Think Hub opened my eyes to transparent management of public finances. Their economic literacy program is transformative.',
 'Jean-Pierre N.', 'Entrepreneur, Bujumbura', 'Entrepreneur, Bujumbura', 1),
('Grâce à leurs formations, notre communauté comprend désormais l''importance de la redevabilité. Un travail essentiel pour le Burundi.',
 'Thanks to their training, our community now understands the importance of accountability. Essential work for Burundi.',
 'Marie-Claire H.', 'Enseignante, Gitega', 'Teacher, Gitega', 2),
('Leur approche inclusive et leur engagement envers le développement durable font de Green Think Hub un partenaire de confiance.',
 'Their inclusive approach and commitment to sustainable development make Green Think Hub a trusted partner.',
 'Dr. Patrick M.', 'Chercheur, Université du Burundi', 'Researcher, University of Burundi', 3),
('Les ateliers sur la gouvernance locale ont transformé notre façon de dialoguer avec les autorités.',
 'Workshops on local governance transformed how we engage with authorities.',
 'Aline K.', 'Activiste communautaire, Ngozi', 'Community activist, Ngozi', 4),
('En tant que journaliste, les ressources de Green Think Hub m''aident à produire des enquêtes plus rigoureuses.',
 'As a journalist, Green Think Hub resources help me produce more rigorous investigations.',
 'Fabrice B.', 'Journaliste indépendant', 'Independent journalist', 5);
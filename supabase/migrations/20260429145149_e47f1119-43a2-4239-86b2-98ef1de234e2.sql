CREATE TABLE public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label_fr text NOT NULL,
  label_en text,
  path text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  is_external boolean NOT NULL DEFAULT false,
  highlight boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items viewable by everyone"
ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Admins can insert menu items"
ON public.menu_items FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update menu items"
ON public.menu_items FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete menu items"
ON public.menu_items FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
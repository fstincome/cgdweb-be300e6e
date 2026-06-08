-- Add phone to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Create pages table
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  image_url text,
  published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages viewable by everyone" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Content managers can insert pages" ON public.pages FOR INSERT WITH CHECK (is_content_manager(auth.uid()));
CREATE POLICY "Content managers can update pages" ON public.pages FOR UPDATE USING (is_content_manager(auth.uid()));
CREATE POLICY "Content managers can delete pages" ON public.pages FOR DELETE USING (is_content_manager(auth.uid()));
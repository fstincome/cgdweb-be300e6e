UPDATE public.articles
SET slug = 'gitega-25-jeunes-entrepreneurs-formes-aux-odd'
WHERE slug IS NULL OR btrim(slug) = '';
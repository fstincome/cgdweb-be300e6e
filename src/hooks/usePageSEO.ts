import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "./useSEO";
import { tField } from "@/lib/i18nField";

interface PageSEO {
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  seo_title: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  seo_description_en: string | null;
  og_image: string | null;
  image_url: string | null;
}

/**
 * Load SEO metadata for a page by slug and apply it to <head>.
 * SEO fields (seo_title, seo_description, og_image) override page title/description/image_url.
 * Pass `fallback` for values used until DB row arrives (or if slug not found).
 */
export function usePageSEO(
  slug: string,
  fallback?: { title?: string; description?: string; ogImage?: string },
) {
  const { lang } = useLanguage();
  const [row, setRow] = useState<PageSEO | null>(null);

  useEffect(() => {
    supabase
      .from("pages")
      .select("title, title_en, description, description_en, seo_title, seo_title_en, seo_description, seo_description_en, og_image, image_url")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => { if (data) setRow(data as PageSEO); });
  }, [slug]);

  const title =
    (row && (tField(row, "seo_title", lang) || tField(row, "title", lang))) ||
    fallback?.title ||
    "";
  const description =
    (row && (tField(row, "seo_description", lang) || tField(row, "description", lang))) ||
    fallback?.description ||
    "";
  const ogImage = row?.og_image || row?.image_url || fallback?.ogImage;

  useSEO({ title, description: description?.slice(0, 160), ogImage: ogImage || undefined });
}

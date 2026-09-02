import { useSiteSettings } from "@/hooks/useSiteSettings";

export interface BannerConfig {
  label?: string;
  image?: string;
}

/**
 * Retourne le libellé du fil d'Ariane et l'image de bannière configurés
 * dans le dashboard (/admin/site → section « Bannières & fil d'Ariane »).
 */
export function usePageBanner(slug: string): BannerConfig {
  const { get } = useSiteSettings();
  const all = get<Record<string, BannerConfig>>("site.banners");
  return all?.[slug] ?? {};
}

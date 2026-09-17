export interface BreadcrumbPageConfig {
  slug: string;
  path: string;
  labelFr: string;
  labelEn: string;
}

export const BREADCRUMB_PAGES: BreadcrumbPageConfig[] = [
  { slug: "about", path: "/about", labelFr: "À propos", labelEn: "About" },
  { slug: "contact", path: "/contact", labelFr: "Contact", labelEn: "Contact" },
  { slug: "team", path: "/team", labelFr: "Équipe", labelEn: "Team" },
  { slug: "partners", path: "/partners", labelFr: "Partenaires", labelEn: "Partners" },
  { slug: "programs", path: "/programs", labelFr: "Programmes", labelEn: "Programs" },
  { slug: "projects", path: "/projects", labelFr: "Projets", labelEn: "Projects" },
  { slug: "blog", path: "/blog", labelFr: "Blog", labelEn: "Blog" },
  { slug: "category", path: "/category", labelFr: "Catégories d’articles", labelEn: "Article categories" },
  { slug: "donate", path: "/donate", labelFr: "Don", labelEn: "Donate" },
];
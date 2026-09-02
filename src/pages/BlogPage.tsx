import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowRight, User, Search } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { usePageSEO } from "@/hooks/usePageSEO";
import { tField } from "@/lib/i18nField";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageBanner } from "@/hooks/usePageBanner";

interface Article {
  id: string;
  title: string;
  title_en: string | null;
  slug: string | null;
  image_url: string | null;
  publish_date: string | null;
  created_at: string;
  author_id: string | null;
  category: { name: string; name_en: string | null } | null;
}

interface AuthorMap {
  [userId: string]: { display_name: string | null; avatar_url: string | null };
}

const ITEMS_PER_PAGE = 9;

export default function BlogPage() {
  const banner = usePageBanner("blog");
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<AuthorMap>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, title_en, slug, image_url, publish_date, created_at, author_id, category:categories(name, name_en)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (data) {
          setArticles(data as unknown as Article[]);
          const authorIds = [...new Set(data.map((a: any) => a.author_id).filter(Boolean))];
          if (authorIds.length > 0) {
            const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", authorIds);
            if (profiles) {
              const map: AuthorMap = {};
              profiles.forEach((p: any) => { map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
              setAuthors(map);
            }
          }
        }
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase();
    return articles.filter((a) => {
      const title = tField(a, "title", lang).toLowerCase();
      const cat = a.category ? tField(a.category, "name", lang).toLowerCase() : "";
      return title.includes(q) || cat.includes(q);
    });
  }, [articles, search, lang]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  usePageSEO("blog", { title: t("nav.blog"), description: lang === "en" ? "Discover our articles on governance, economy and sustainable development." : "Découvrez nos articles sur la gouvernance, l'économie et le développement durable." });

  const { get } = useSiteSettings();
  const blogIntro = get<{ intro: string }>("page.blog")?.intro || "";

  return (
    <div>
      <PageBanner title={t("nav.blog")} imageUrl={banner.image} breadcrumbs={[{ label: banner.label || t("nav.blog") }]} />
      <div className="container py-12 space-y-8">
        {blogIntro && <p className="text-muted-foreground text-center max-w-2xl mx-auto">{blogIntro}</p>}
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Search an article…" : "Rechercher un article…"}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">{lang === "en" ? "No article found." : "Aucun article trouvé."}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((a, i) => {
            const author = a.author_id ? authors[a.author_id] : null;
            const catName = a.category ? tField(a.category, "name", lang) : "";
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={a.image_url || "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3">
                    {catName && <span className="text-xs font-medium text-primary">{catName}</span>}
                    <h3 className="font-display font-semibold text-foreground line-clamp-2">{tField(a, "title", lang)}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {author && (
                        <>
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {author.avatar_url ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-primary" />}
                          </div>
                          <span>{author.display_name || "—"}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{new Date(a.publish_date || a.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span>
                    </div>
                    <Link to={`/blog/${a.slug || a.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      {t("general.readmore")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${p === page ? "bg-primary text-primary-foreground" : "border border-input bg-background text-foreground hover:bg-muted"}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

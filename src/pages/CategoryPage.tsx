import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import PageBanner from "@/components/PageBanner";
import { ArrowRight, User } from "lucide-react";
import { tField } from "@/lib/i18nField";
import { usePageBanner } from "@/hooks/usePageBanner";

const TEST_IMG = "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ";

interface Article {
  id: string;
  title: string;
  title_en: string | null;
  slug: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string | null;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const banner = usePageBanner("category");
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [authors, setAuthors] = useState<Record<string, { display_name: string | null; avatar_url: string | null }>>({});

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const decoded = decodeURIComponent(slug);
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, name_en")
        .or(`name.eq.${decoded},name_en.eq.${decoded}`)
        .maybeSingle();
      if (!cat) return;
      setCategoryName(tField(cat, "name", lang));
      const { data } = await supabase.from("articles").select("id, title, title_en, slug, image_url, created_at, author_id").eq("category_id", cat.id).eq("published", true).order("created_at", { ascending: false });
      if (data) {
        setArticles(data as Article[]);
        const ids = [...new Set(data.map(a => a.author_id).filter(Boolean))] as string[];
        if (ids.length) {
          const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids);
          if (profiles) {
            const map: typeof authors = {};
            profiles.forEach((p: any) => { map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
            setAuthors(map);
          }
        }
      }
    })();
  }, [slug, lang]);

  return (
    <div>
      <PageBanner title={categoryName || (lang === "en" ? "Category" : "Catégorie")} imageUrl={banner.image} breadcrumbs={[{ label: t("nav.blog"), to: "/blog" }, { label: categoryName }]} />
      <section className="py-16">
        <div className="container">
          {articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">{lang === "en" ? "No article in this category." : "Aucun article dans cette catégorie."}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map(a => {
                const author = a.author_id ? authors[a.author_id] : null;
                return (
                  <div key={a.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={a.image_url || TEST_IMG} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-3">
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
                        <span>{new Date(a.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span>
                      </div>
                      <Link to={`/blog/${a.slug || a.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        {t("general.readmore")} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

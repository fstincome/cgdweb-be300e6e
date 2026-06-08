import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Facebook, Twitter, Link as LinkIcon, User } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import CommentSection from "@/components/CommentSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { tField } from "@/lib/i18nField";

interface Article {
  id: string;
  title: string;
  title_en: string | null;
  content: string | null;
  content_en: string | null;
  meta_title: string | null;
  meta_title_en: string | null;
  meta_description: string | null;
  meta_description_en: string | null;
  image_url: string | null;
  publish_date: string | null;
  created_at: string;
  author_id: string | null;
  category: { name: string; name_en: string | null } | null;
}

interface AuthorProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [showShare, setShowShare] = useState(false);

  const title = article ? tField(article, "title", lang) : undefined;
  const content = article ? tField(article, "content", lang) : "";
  const metaDesc = article ? (tField(article, "meta_description", lang) || content?.replace(/<[^>]*>/g, "").slice(0, 155)) : undefined;
  const metaTitle = article ? tField(article, "meta_title", lang) : undefined;

  useSEO({
    title: metaTitle || title,
    description: metaDesc,
    ogImage: article?.image_url || undefined,
  });

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, title_en, content, content_en, meta_title, meta_title_en, meta_description, meta_description_en, image_url, publish_date, created_at, author_id, category:categories(name, name_en)")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data }) => {
        if (data) {
          setArticle(data as unknown as Article);
          if (data.author_id) {
            supabase.from("profiles").select("display_name, avatar_url").eq("user_id", data.author_id).single().then(({ data: p }) => {
              if (p) setAuthor(p);
            });
          }
        }
      });
  }, [slug]);

  if (!article) return <div className="py-20 text-center text-muted-foreground">{lang === "en" ? "Loading..." : "Chargement..."}</div>;

  const shareUrl = window.location.href;
  const shareTitle = encodeURIComponent(title || "");
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); setShowShare(false); };
  const catName = article.category ? tField(article.category, "name", lang) : "";

  return (
    <div>
      <PageBanner
        title={title || ""}
        imageUrl={article.image_url}
        breadcrumbs={[
          { label: t("nav.blog"), to: "/blog" },
          ...(catName ? [{ label: catName }] : []),
          { label: title || "" },
        ]}
      />
      <div className="container py-12 space-y-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {author && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {author.avatar_url ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-sm font-medium text-foreground">{author.display_name || "—"}</span>
                <span className="text-muted-foreground">·</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(article.publish_date || article.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="relative">
            <button onClick={() => setShowShare(!showShare)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Share2 className="h-4 w-4" /> {lang === "en" ? "Share" : "Partager"}
            </button>
            {showShare && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 z-10 flex gap-1">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted transition-colors"><Facebook className="h-4 w-4 text-blue-600" /></a>
                <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted transition-colors"><Twitter className="h-4 w-4 text-sky-500" /></a>
                <button onClick={copyLink} className="p-2 rounded-md hover:bg-muted transition-colors"><LinkIcon className="h-4 w-4 text-muted-foreground" /></button>
              </div>
            )}
          </div>
        </div>
        <div
          className="prose prose-sm max-w-none text-foreground font-serif leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
        <CommentSection contentType="article" contentId={article.id} />
      </div>
    </div>
  );
}

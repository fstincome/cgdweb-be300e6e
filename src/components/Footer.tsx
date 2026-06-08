import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpeg";

interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

export default function Footer() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from("categories").select("id, name");
      if (!cats || cats.length === 0) return;

      const { data: articles } = await supabase.from("articles").select("category_id").eq("published", true);
      if (!articles) return;

      const countMap: Record<string, number> = {};
      articles.forEach(a => {
        if (a.category_id) countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
      });

      const withCount = cats.map(c => ({ id: c.id, name: c.name, count: countMap[c.id] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
      setCategories(withCount);
    })();
  }, []);

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CGD" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-display font-bold text-lg">Centre for Green Development</p>
              <p className="text-sm opacity-80 italic">{t("footer.tagline")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wider opacity-70">Quick Links</h4>
          <nav className="flex flex-col gap-1.5 text-sm">
            <Link to="/about" className="opacity-80 hover:opacity-100 transition-opacity">{t("nav.about")}</Link>
            <Link to="/programs" className="opacity-80 hover:opacity-100 transition-opacity">{t("nav.programs")}</Link>
            <Link to="/team" className="opacity-80 hover:opacity-100 transition-opacity">{t("nav.team")}</Link>
            <Link to="/contact" className="opacity-80 hover:opacity-100 transition-opacity">{t("nav.contact")}</Link>
            <Link to="/donate" className="opacity-80 hover:opacity-100 transition-opacity">{t("donate.title")}</Link>
          </nav>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wider opacity-70">Archives</h4>
          <nav className="flex flex-col gap-1.5 text-sm">
            {categories.map(c => (
              <Link key={c.id} to={`/category/${encodeURIComponent(c.name)}`} className="opacity-80 hover:opacity-100 transition-opacity flex items-center justify-between">
                <span>{c.name}</span>
                <span className="bg-primary/10 text-primary text-xs font-medium px-1.5 py-0.5 rounded-full">{c.count}</span>
              </Link>
            ))}
            {categories.length === 0 && <span className="opacity-50 text-xs">Aucune catégorie</span>}
          </nav>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm uppercase tracking-wider opacity-70">{t("contact.title")}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 opacity-80">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Gitega-Burundi, Nyamugari Quarter</span>
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <Phone className="h-4 w-4 shrink-0" />
              <span>+257 68 336 228</span>
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <Mail className="h-4 w-4 shrink-0" />
              <span>info@centreforgreendevelopment.org</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/20 py-4">
        <div className="container text-center text-xs opacity-60 space-y-1">
          <p>© {new Date().getFullYear()} Centre for Green Development. {t("footer.rights")}</p>
          <p>Made with ❤️ by <a href="https://sightnetwork.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">Sight Africa</a></p>
        </div>
      </div>
    </footer>
  );
}

import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import PageBanner from "@/components/PageBanner";
import { useSEO } from "@/hooks/useSEO";
import { tField } from "@/lib/i18nField";

interface Project { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; status: string | null; }

export default function ProjectsPage() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);

  useSEO({ title: t("nav.projects"), description: lang === "en" ? "Explore our green and community development projects." : "Explorez nos projets de développement vert et communautaire." });

  useEffect(() => {
    supabase.from("projects").select("id, title, title_en, description, description_en, image_url, status").order("created_at", { ascending: false }).then(({ data }) => { if (data) setProjects(data as Project[]); });
  }, []);

  return (
    <div>
      <PageBanner title={t("nav.projects")} breadcrumbs={[{ label: t("nav.projects") }]} />
      <div className="container py-12 space-y-8">
        {projects.length === 0 && <p className="text-center text-muted-foreground py-8">{lang === "en" ? "No project yet." : "Aucun projet pour le moment."}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/projects/${p.id}`} className="block border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden"><img src={p.image_url || "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"} alt="" className="w-full h-full object-cover" /></div>
                <div className="p-4 space-y-2">
                  {p.status && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{p.status}</span>}
                  <h3 className="font-display font-semibold text-foreground line-clamp-2">{tField(p, "title", lang)}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tField(p, "description", lang)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import PageBanner from "@/components/PageBanner";
import { usePageSEO } from "@/hooks/usePageSEO";
import { tField } from "@/lib/i18nField";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageBanner } from "@/hooks/usePageBanner";

interface Program { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; }

export default function ProgramsPage() {
  const banner = usePageBanner("programs");
  const { t, lang } = useLanguage();
  const { get } = useSiteSettings();
  const intro = get<{ intro: string }>("page.programs")?.intro || "";
  const [programs, setPrograms] = useState<Program[]>([]);

  usePageSEO("programs", { title: t("programs.title"), description: intro });

  useEffect(() => {
    supabase.from("programs").select("id, title, title_en, description, description_en, image_url").order("created_at", { ascending: false }).then(({ data }) => { if (data) setPrograms(data as Program[]); });
  }, []);

  return (
    <div>
      <PageBanner title={t("programs.title")} imageUrl={banner.image} breadcrumbs={[{ label: banner.label || t("programs.title") }]} />
      <div className="container py-12 space-y-8">
        {intro && <p className="text-muted-foreground text-center max-w-2xl mx-auto">{intro}</p>}
        {programs.length === 0 && <p className="text-center text-muted-foreground py-8">{lang === "en" ? "No program yet." : "Aucun programme pour le moment."}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/programs/${p.id}`} className="block border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted overflow-hidden"><img src={p.image_url || "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ"} alt="" className="w-full h-full object-cover" /></div>
                <div className="p-4 space-y-2">
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

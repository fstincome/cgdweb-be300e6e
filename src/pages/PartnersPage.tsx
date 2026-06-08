import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import PageBanner from "@/components/PageBanner";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { tField } from "@/lib/i18nField";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  description_en: string | null;
}

export default function PartnersPage() {
  const { t, lang } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);

  useSEO({ title: t("nav.partners"), description: lang === "en" ? "Our partners and collaborators for sustainable development." : "Nos partenaires et collaborateurs pour le développement durable." });

  useEffect(() => {
    supabase.from("partners").select("id, name, logo_url, website, description, description_en").order("display_order").then(({ data }) => { if (data) setPartners(data as Partner[]); });
  }, []);

  return (
    <div>
      <PageBanner title={t("nav.partners")} />
      <section className="py-20">
        <div className="container">
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">{t("partners.intro")}</p>
          {partners.length === 0 ? (
            <p className="text-center text-muted-foreground">{lang === "en" ? "No partner yet." : "Aucun partenaire pour le moment."}</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p, i) => {
                const desc = tField(p, "description", lang);
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="h-20 w-20 object-contain rounded-md" />
                    ) : (
                      <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">{p.name[0]}</div>
                    )}
                    <h3 className="font-display font-semibold text-lg text-card-foreground">{p.name}</h3>
                    {desc && <p className="text-sm text-muted-foreground line-clamp-3">{desc}</p>}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        {lang === "en" ? "Visit" : "Visiter"} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

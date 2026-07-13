import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import PageBanner from "@/components/PageBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePageSEO } from "@/hooks/usePageSEO";
import { tField } from "@/lib/i18nField";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TEST_IMG = "https://lh3.googleusercontent.com/d/1_2LqoCzdX4DzAWXazdG-7Q8WntSAXQ4o";

interface TeamMember { id: string; name: string; role: string | null; role_en: string | null; bio: string | null; bio_en: string | null; image_url: string | null; }

export default function TeamPage() {
  const { t, lang } = useLanguage();
  const { get } = useSiteSettings();
  const intro = get<{ intro: string }>("page.team")?.intro || "";
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  usePageSEO("team", { title: t("team.title"), description: intro || (lang === "en" ? "Meet the team." : "Rencontrez l'équipe.") });

  useEffect(() => {
    supabase.from("team_members").select("id, name, role, role_en, bio, bio_en, image_url").order("display_order").then(({ data }) => { if (data) setMembers(data as TeamMember[]); });
  }, []);

  return (
    <div>
      <PageBanner title={t("team.title")} breadcrumbs={[{ label: t("team.title") }]} />
      <div className="container py-12 space-y-10">
        {intro && <p className="text-muted-foreground text-center max-w-2xl mx-auto">{intro}</p>}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member, i) => {
            const role = tField(member, "role", lang) || (lang === "en" ? "Staff Member" : "Membre");
            return (
              <motion.div key={member.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-border rounded-lg p-5 text-center space-y-3 hover:shadow-md transition-shadow">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto overflow-hidden">
                  <img src={member.image_url || TEST_IMG} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{member.name}</p>
                  <p className="text-primary text-sm font-medium">{role}</p>
                </div>
                <button onClick={() => setSelected(member)} className="text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-md transition-colors">
                  {lang === "fr" ? "Voir bio" : "See bio"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="h-28 w-28 rounded-full overflow-hidden bg-muted">
                    <img src={selected.image_url || TEST_IMG} alt={selected.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="text-center">
                    <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                    <p className="text-primary text-sm font-medium mt-1">{tField(selected, "role", lang) || (lang === "en" ? "Staff Member" : "Membre")}</p>
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed pt-2">
                {tField(selected, "bio", lang) || (lang === "en" ? "No biography available." : "Aucune biographie disponible.")}
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

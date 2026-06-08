import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Eye, BookOpen, Compass, Heart } from "lucide-react";
import { motion } from "framer-motion";
import PageBanner from "@/components/PageBanner";
import { useSEO } from "@/hooks/useSEO";

export default function AboutPage() {
  const { t } = useLanguage();

  useSEO({ title: t("about.title"), description: "Découvrez la mission, la vision et les valeurs du Centre for Green Development." });

  const sections = [
    { icon: Target, titleKey: "about.mission.title", textKey: "about.mission.text" },
    { icon: Eye, titleKey: "about.vision.title", textKey: "about.vision.text" },
  ];

  return (
    <div>
      <PageBanner title={t("about.title")} breadcrumbs={[{ label: t("about.title") }]} />
      <div className="container py-12 space-y-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((item, i) => (
            <motion.div key={item.titleKey} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">{t(item.titleKey)}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed font-serif">{t(item.textKey)}</p>
            </motion.div>
          ))}
        </div>

        {/* Our History */}
        <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
            <h2 className="font-display font-bold text-2xl text-foreground">{t("about.history.title")}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-lg overflow-hidden">
              <img src="https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ" alt="" className="w-full h-64 object-cover rounded-lg" />
            </div>
            <p className="text-muted-foreground leading-relaxed font-serif">{t("about.history.text")}</p>
          </div>
        </motion.section>

        {/* Our Approach */}
        <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><Compass className="h-5 w-5 text-primary" /></div>
            <h2 className="font-display font-bold text-2xl text-foreground">{t("about.approach.title")}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: t("about.approach.research"), desc: t("about.approach.research.desc") },
              { title: t("about.approach.advocacy"), desc: t("about.approach.advocacy.desc") },
              { title: t("about.approach.community"), desc: t("about.approach.community.desc") },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-muted rounded-lg p-5 space-y-2">
                <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Values */}
        <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><Heart className="h-5 w-5 text-primary" /></div>
            <h2 className="font-display font-bold text-2xl text-foreground">{t("about.values.title")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: t("about.values.integrity"), desc: t("about.values.integrity.desc") },
              { title: t("about.values.sustainability"), desc: t("about.values.sustainability.desc") },
              { title: t("about.values.innovation"), desc: t("about.values.innovation.desc") },
              { title: t("about.values.inclusion"), desc: t("about.values.inclusion.desc") },
            ].map((val, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="border border-border rounded-lg p-5 text-center space-y-2">
                <h3 className="font-display font-semibold text-primary">{val.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

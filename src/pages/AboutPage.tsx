import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Eye, BookOpen, Compass, Heart } from "lucide-react";
import { motion } from "framer-motion";
import PageBanner from "@/components/PageBanner";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK = {
  mission: { title: "Notre mission", text: "" },
  vision: { title: "Notre vision", text: "" },
  history: { title: "Notre histoire", text: "", image: "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ" },
  approach: { title: "Notre approche", items: [] as any[] },
  values: { title: "Nos valeurs", items: [] as any[] },
};

export default function AboutPage() {
  const { t } = useLanguage();
  const { get } = useSiteSettings();
  const data: typeof FALLBACK = { ...FALLBACK, ...(get<typeof FALLBACK>("about.page") || {}) };

  usePageSEO("about", { title: t("about.title"), description: data.mission?.text?.slice(0, 160) || "Centre for Green Development." });

  const blocks = [
    { icon: Target, ...data.mission },
    { icon: Eye, ...data.vision },
  ];

  return (
    <div>
      <PageBanner title={t("about.title")} breadcrumbs={[{ label: t("about.title") }]} />
      <div className="container py-12 space-y-16">
        <div className="grid md:grid-cols-2 gap-8">
          {blocks.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><item.icon className="h-5 w-5 text-primary" /></div>
              <h2 className="font-display font-bold text-xl text-foreground">{item.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed font-serif">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {data.history?.text && (
          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
              <h2 className="font-display font-bold text-2xl text-foreground">{data.history.title}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg overflow-hidden">
                <img src={data.history.image || FALLBACK.history.image} alt="" className="w-full h-64 object-cover rounded-lg" />
              </div>
              <p className="text-muted-foreground leading-relaxed font-serif">{data.history.text}</p>
            </div>
          </motion.section>
        )}

        {data.approach?.items?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><Compass className="h-5 w-5 text-primary" /></div>
              <h2 className="font-display font-bold text-2xl text-foreground">{data.approach.title}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {data.approach.items.map((item: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-muted rounded-lg p-5 space-y-2">
                  <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {data.values?.items?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center"><Heart className="h-5 w-5 text-primary" /></div>
              <h2 className="font-display font-bold text-2xl text-foreground">{data.values.title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.values.items.map((val: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="border border-border rounded-lg p-5 text-center space-y-2">
                  <h3 className="font-display font-semibold text-primary">{val.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

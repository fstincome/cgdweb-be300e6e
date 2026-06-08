import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { tField } from "@/lib/i18nField";

interface TestimonialRow {
  id: string;
  quote_fr: string;
  quote_en: string | null;
  name: string;
  role_fr: string | null;
  role_en: string | null;
  avatar_url: string | null;
}

interface Props {
  sectionVariants: Variants;
}

export default function TestimonialsCarousel({ sectionVariants }: Props) {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, quote_fr, quote_en, name, role_fr, role_en, avatar_url")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => { if (data) setItems(data as TestimonialRow[]); });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (items.length === 0 ? 0 : (c + 1) % items.length));
  }, [items.length]);
  const prev = useCallback(() => {
    setCurrent((c) => (items.length === 0 ? 0 : (c - 1 + items.length) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (items.length === 0) return null;
  const t0 = items[current];
  const quote = tField(t0, "quote", lang);
  const role = tField(t0, "role", lang);

  return (
    <motion.section
      className="py-24 bg-muted"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
    >
      <div className="container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">{t("home.section.testimonials.kicker")}</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{t("home.section.testimonials")}</h2>
          <p className="text-muted-foreground">{t("home.section.testimonials.sub")}</p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="min-h-[220px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={t0.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border rounded-xl p-10 space-y-6 relative overflow-hidden text-center"
              >
                <div className="absolute top-4 right-6 text-7xl font-serif text-primary/10 leading-none select-none">"</div>
                <p className="text-muted-foreground leading-relaxed italic relative z-10 text-base md:text-lg">"{quote}"</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                    {t0.avatar_url ? <img src={t0.avatar_url} alt="" className="h-full w-full object-cover" /> : t0.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-display font-semibold text-sm text-foreground">{t0.name}</p>
                    {role && <p className="text-xs text-muted-foreground">{role}</p>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Prev"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex justify-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-primary" : "w-2.5 bg-border hover:bg-primary/40"}`}
                aria-label={`Go to ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

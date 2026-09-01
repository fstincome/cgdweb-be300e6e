import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight, User, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { tField } from "@/lib/i18nField";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

const TEST_IMG = "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ";

interface Article { id: string; title: string; title_en: string | null; slug: string | null; image_url: string | null; created_at: string; author_id: string | null; category: { name: string; name_en: string | null } | null; }
interface AuthorMap { [userId: string]: { display_name: string | null; avatar_url: string | null }; }
interface Program { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; }
interface Project { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; status: string | null; }
interface Partner { id: string; name: string; logo_url: string | null; website: string | null; }

interface HeroSlide { title: string; subtitle: string; image: string; }
interface HeroData { slides: HeroSlide[]; cta_primary: string; cta_secondary: string; }
interface StatItem { icon: string; value: string; label: string; }
interface PillarItem { icon: string; title: string; desc: string; }
interface PillarsData { badge: string; title: string; subtitle: string; items: PillarItem[]; }
interface CtaData { title: string; subtitle: string; button: string; link: string; }

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as any)[name] || Icons.Circle;
  return <C className={className} />;
}

function AnimatedCounter({ value, label, icon, delay }: { value: string; label: string; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center"
      >
        <Icon name={icon} className="h-7 w-7 text-primary" />
      </motion.div>
      <motion.span
        className="text-4xl md:text-5xl font-display font-bold text-primary"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3, type: "spring" }}
      >
        {value}
      </motion.span>
      <span className="text-sm text-muted-foreground font-medium text-center">{label}</span>
    </motion.div>
  );
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  const settings = useSiteSettings();

  const hero = settings.get<HeroData>("home.hero");
  const stats = settings.get<{ items: StatItem[] }>("home.stats");
  const pillars = settings.get<PillarsData>("home.pillars");
  const ctaBanner = settings.get<CtaData>("home.cta_banner");
  const finalCta = settings.get<CtaData>("home.final_cta");

  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<AuthorMap>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const articlesRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    supabase.from("articles").select("id, title, title_en, slug, image_url, created_at, author_id, category:categories(name, name_en)").eq("published", true).order("created_at", { ascending: false }).limit(3).then(async ({ data }) => {
      if (data) {
        setArticles(data as unknown as Article[]);
        const authorIds = [...new Set(data.map((a: any) => a.author_id).filter(Boolean))];
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", authorIds);
          if (profiles) {
            const map: AuthorMap = {};
            profiles.forEach((p: any) => { map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
            setAuthors(map);
          }
        }
      }
    });
    supabase.from("programs").select("id, title, title_en, description, description_en, image_url").order("created_at", { ascending: false }).limit(3).then(({ data }) => { if (data) setPrograms(data as Program[]); });
    supabase.from("projects").select("id, title, title_en, description, description_en, image_url, status").order("created_at", { ascending: false }).limit(3).then(({ data }) => { if (data) setProjects(data as Project[]); });
    supabase.from("partners").select("id, name, logo_url, website").order("display_order").limit(12).then(({ data }) => { if (data) setPartners(data as Partner[]); });
  }, []);

  useEffect(() => {
    const len = hero?.slides?.length ?? 0;
    if (len < 2) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % len), 5000);
    return () => clearInterval(timer);
  }, [hero?.slides?.length]);

  useEffect(() => {
    const el = articlesRef.current;
    if (!el || articles.length === 0) return;
    const timer = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: 340, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(timer);
  }, [articles]);

  usePageSEO("home", {
    title: lang === "en" ? "Home" : "Accueil",
    description: lang === "en"
      ? "Green Think Hub - Promoting transparency, economic literacy and sustainable development in Burundi."
      : "Green Think Hub - Promouvoir la transparence, la littératie économique et le développement durable au Burundi.",
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
  const staggerItem = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  };

  const slide = hero?.slides?.[currentSlide];
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      {hero && slide && (
        <section ref={heroRef} className="relative overflow-hidden h-[600px] md:h-[700px] lg:h-[80vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1 }}
              style={{ y: heroY }}
            />
          </AnimatePresence>
          <motion.div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/75 to-secondary/90" style={{ opacity: heroOpacity }} />
          <div className="container relative h-full flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.7 }}
                className="max-w-2xl space-y-6"
              >
                <motion.div initial={{ width: 0 }} animate={{ width: 80 }} transition={{ delay: 0.3, duration: 0.5 }} className="h-1 bg-primary rounded-full" />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-secondary-foreground leading-tight">{slide.title}</h1>
                <p className="text-secondary-foreground/80 text-lg md:text-xl leading-relaxed">{slide.subtitle}</p>
                <div className="flex flex-wrap gap-3 pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/programs" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold text-sm rounded-md shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      {hero.cta_primary} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-secondary-foreground/30 text-secondary-foreground font-display font-semibold text-sm rounded-md backdrop-blur-sm hover:bg-secondary-foreground/10 transition-all">
                      <Heart className="h-4 w-4" /> {hero.cta_secondary}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
            {hero.slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className="group relative h-3 overflow-hidden rounded-full transition-all duration-500" style={{ width: i === currentSlide ? 40 : 12 }}>
                <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${i === currentSlide ? "bg-primary" : "bg-secondary-foreground/30 group-hover:bg-secondary-foreground/50"}`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      {stats?.items && stats.items.length > 0 && (
        <section className="py-16 bg-card border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.items.map((s, i) => (
                <AnimatedCounter key={i} icon={s.icon} value={s.value} label={s.label} delay={i * 0.15} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Pillars ── */}
      {pillars && (
        <motion.section className="py-24 bg-muted" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}>
          <div className="container space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">{pillars.badge}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{pillars.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{pillars.subtitle}</p>
            </div>
            <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {pillars.items.map((item, i) => (
                <motion.div key={i} variants={staggerItem} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="bg-card border border-border rounded-xl p-8 space-y-4 relative overflow-hidden group">
                  <div className="relative">
                    <motion.div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center" whileHover={{ rotate: 10 }}>
                      <Icon name={item.icon} className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-display font-semibold text-xl text-card-foreground mt-4">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ── Programs ── */}
      {programs.length > 0 && (
        <motion.section className="py-24" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionVariants}>
          <div className="container space-y-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">{t("home.section.programs.kicker")}</span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{t("home.section.programs")}</h2>
              </div>
              <Link to="/programs" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">{t("home.section.viewall")} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {programs.map((p) => (
                <motion.div key={p.id} variants={staggerItem} whileHover={{ y: -6 }}>
                  <Link to={`/programs/${p.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={p.image_url || TEST_IMG} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="font-display font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{tField(p, "title", lang)}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tField(p, "description", lang)}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary pt-1">
                        {t("general.learnmore")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ── CTA Banner ── */}
      {ctaBanner && (
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary-foreground)) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            animate={{ x: [0, 40], y: [0, 40] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
          <div className="container relative text-center space-y-8">
            <motion.h2 className="font-display font-bold text-3xl md:text-5xl text-primary-foreground max-w-3xl mx-auto leading-tight" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              {ctaBanner.title}
            </motion.h2>
            <motion.p className="text-primary-foreground/80 text-lg max-w-xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}>
              {ctaBanner.subtitle}
            </motion.p>
            <motion.div className="flex flex-wrap justify-center gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to={ctaBanner.link || "/donate"} className="inline-flex items-center gap-2 px-8 py-4 bg-primary-foreground text-primary font-display font-semibold rounded-md shadow-lg hover:shadow-xl transition-all">
                  <Heart className="h-4 w-4" /> {ctaBanner.button}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <motion.section className="py-24 bg-muted" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionVariants}>
          <div className="container space-y-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">{t("home.section.projects.kicker")}</span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{t("home.section.projects")}</h2>
              </div>
              <Link to="/projects" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">{t("home.section.viewall")} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {projects.map((p) => (
                <motion.div key={p.id} variants={staggerItem} whileHover={{ y: -6 }}>
                  <Link to={`/projects/${p.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={p.image_url || TEST_IMG} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 space-y-2">
                      {p.status && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{p.status}</span>}
                      <h3 className="font-display font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{tField(p, "title", lang)}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tField(p, "description", lang)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ── Latest Articles ── */}
      {articles.length > 0 && (
        <motion.section className="py-24" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionVariants}>
          <div className="container space-y-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">{t("home.section.articles.kicker")}</span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{t("home.section.articles")}</h2>
              </div>
              <Link to="/blog" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">{t("home.section.viewall")} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {articles.map((a) => {
                const author = a.author_id ? authors[a.author_id] : null;
                const catName = a.category ? tField(a.category, "name", lang) : "";
                return (
                  <motion.div key={a.id} variants={staggerItem} whileHover={{ y: -6 }}>
                    <Link to={`/blog/${a.slug || a.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img src={a.image_url || TEST_IMG} alt={tField(a, "title", lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5 space-y-3">
                        {catName && <span className="text-xs font-semibold text-primary uppercase tracking-wider">{catName}</span>}
                        <h3 className="font-display font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{tField(a, "title", lang)}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {author && (
                            <>
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                {author.avatar_url ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-primary" />}
                              </div>
                              <span>{author.display_name || "—"}</span>
                              <span>·</span>
                            </>
                          )}
                          <span>{new Date(a.created_at).toLocaleDateString(dateLocale)}</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          {t("general.readmore")} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ── Testimonials ── */}
      <TestimonialsCarousel sectionVariants={sectionVariants} />

      {/* ── Partners ── */}
      {partners.length > 0 && (
        <motion.section className="py-24" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionVariants}>
          <div className="container space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">{t("home.section.partners.kicker")}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{t("nav.partners")}</h2>
            </div>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {partners.map((p) => (
                <motion.a key={p.id} href={p.website || "#"} target={p.website ? "_blank" : undefined} rel="noopener noreferrer" variants={staggerItem} whileHover={{ y: -4, scale: 1.03 }} className="bg-card border border-border rounded-xl p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="h-16 w-16 object-contain" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">{p.name[0]}</div>
                  )}
                  <span className="text-xs font-medium text-card-foreground text-center line-clamp-2">{p.name}</span>
                </motion.a>
              ))}
            </motion.div>
            <div className="text-center">
              <Link to="/partners" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                {t("home.section.viewall")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Final CTA ── */}
      {finalCta && (
        <motion.section className="py-24 bg-muted" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="container text-center space-y-8 max-w-3xl mx-auto">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200 }} className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">{finalCta.title}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{finalCta.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link to={finalCta.link || "/contact"} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-md shadow-lg shadow-primary/25 transition-all">
                {finalCta.button} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}

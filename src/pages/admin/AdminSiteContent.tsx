import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import { Loader2, Save } from "lucide-react";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

const SECTIONS: { key: string; label: string; kind: "intro" | "footer" | "topbar" | "banners" }[] = [
  { key: "page.team", label: "Intro — Équipe", kind: "intro" },
  { key: "page.partners", label: "Intro — Partenaires", kind: "intro" },
  { key: "page.programs", label: "Intro — Programmes", kind: "intro" },
  { key: "page.projects", label: "Intro — Projets", kind: "intro" },
  { key: "page.blog", label: "Intro — Blog", kind: "intro" },
  { key: "site.banners", label: "Bannières & fil d'Ariane", kind: "banners" },
  { key: "site.footer", label: "Pied de page (Footer)", kind: "footer" },
  { key: "site.topbar", label: "Barre supérieure (TopBar)", kind: "topbar" },
];

const BANNER_PAGES: { slug: string; label: string }[] = [
  { slug: "about", label: "À propos" },
  { slug: "contact", label: "Contact" },
  { slug: "team", label: "Équipe" },
  { slug: "partners", label: "Partenaires" },
  { slug: "programs", label: "Programmes" },
  { slug: "projects", label: "Projets" },
  { slug: "blog", label: "Blog" },
  { slug: "donate", label: "Don" },
];


interface Row { id: string; key: string; value_fr: any; value_en: any }

export default function AdminSiteContent() {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").in("key", SECTIONS.map(s => s.key)).then(({ data }) => {
      const map: Record<string, Row> = {};
      (data || []).forEach((r: any) => { map[r.key] = r; });
      setRows(map); setLoading(false);
    });
  }, []);

  const setValue = (key: string, lang: "fr" | "en", val: any) =>
    setRows((r) => ({ ...r, [key]: { ...r[key], [`value_${lang}`]: val } }));

  const save = async (key: string) => {
    setSaving(key);
    const r = rows[key];
    const { error } = await supabase.from("site_settings").update({ value_fr: r.value_fr, value_en: r.value_en }).eq("id", r.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré"); reloadSiteSettings();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Contenu du site</h1>
        <p className="text-sm text-muted-foreground mt-1">Intros des pages de listing, Footer et TopBar.</p>
      </div>

      {SECTIONS.map(({ key, label, kind }) => {
        const row = rows[key];
        if (!row) return null;
        return (
          <section key={key} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-card-foreground">{label}</h2>
              <button onClick={() => save(key)} disabled={saving === key} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50">
                {saving === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
              </button>
            </div>
            {kind === "banners" ? (
              <BannersEditor
                fr={row.value_fr || {}}
                en={row.value_en || {}}
                onChange={(fr, en) => { setValue(key, "fr", fr); setValue(key, "en", en); }}
              />
            ) : (
              <LangTabs
                fr={<KindEditor kind={kind} value={row.value_fr || {}} onChange={(v) => setValue(key, "fr", v)} />}
                en={<KindEditor kind={kind} value={row.value_en || {}} onChange={(v) => setValue(key, "en", v)} />}
              />
            )}

          </section>
        );
      })}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function KindEditor({ kind, value, onChange }: { kind: "intro" | "footer" | "topbar"; value: any; onChange: (v: any) => void }) {
  const set = (patch: any) => onChange({ ...value, ...patch });
  const setSocial = (k: string, v: string) => onChange({ ...value, socials: { ...(value.socials || {}), [k]: v } });

  if (kind === "intro") {
    return <Labeled label="Texte d'introduction"><textarea rows={3} className={inputCls + " resize-none"} value={value.intro || ""} onChange={(e) => set({ intro: e.target.value })} /></Labeled>;
  }
  if (kind === "footer") {
    return (
      <div className="space-y-3">
        <Labeled label="Tagline (sous le logo)"><input className={inputCls} value={value.tagline || ""} onChange={(e) => set({ tagline: e.target.value })} /></Labeled>
        <Labeled label="Adresse"><input className={inputCls} value={value.address || ""} onChange={(e) => set({ address: e.target.value })} /></Labeled>
        <Labeled label="Téléphone"><input className={inputCls} value={value.phone || ""} onChange={(e) => set({ phone: e.target.value })} /></Labeled>
        <Labeled label="Email"><input className={inputCls} value={value.email || ""} onChange={(e) => set({ email: e.target.value })} /></Labeled>
        <Labeled label="Mention de droits"><input className={inputCls} value={value.rights || ""} onChange={(e) => set({ rights: e.target.value })} /></Labeled>
      </div>
    );
  }
  // topbar
  const s = value.socials || {};
  return (
    <div className="space-y-3">
      <Labeled label="Téléphone"><input className={inputCls} value={value.phone || ""} onChange={(e) => set({ phone: e.target.value })} /></Labeled>
      <Labeled label="Email"><input className={inputCls} value={value.email || ""} onChange={(e) => set({ email: e.target.value })} /></Labeled>
      <div className="grid sm:grid-cols-2 gap-3 pt-2">
        <Labeled label="Facebook"><input className={inputCls} value={s.facebook || ""} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="https://facebook.com/..." /></Labeled>
        <Labeled label="Twitter / X"><input className={inputCls} value={s.twitter || ""} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="https://twitter.com/..." /></Labeled>
        <Labeled label="LinkedIn"><input className={inputCls} value={s.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/..." /></Labeled>
        <Labeled label="YouTube"><input className={inputCls} value={s.youtube || ""} onChange={(e) => setSocial("youtube", e.target.value)} placeholder="https://youtube.com/..." /></Labeled>
      </div>
      <p className="text-xs text-muted-foreground">Laissez vide pour masquer l'icône d'un réseau social.</p>
    </div>
  );
}

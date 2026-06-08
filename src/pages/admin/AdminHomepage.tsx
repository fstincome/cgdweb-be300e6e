import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import ImageUpload from "@/components/ImageUpload";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";

interface Setting {
  id: string;
  key: string;
  description: string | null;
  value_fr: any;
  value_en: any;
}

const KEYS = ["home.hero", "home.stats", "home.pillars", "home.cta_banner", "home.final_cta"] as const;

const LABELS: Record<string, string> = {
  "home.hero": "Hero (diaporama)",
  "home.stats": "Statistiques",
  "home.pillars": "Piliers fondamentaux",
  "home.cta_banner": "Bannière CTA milieu de page",
  "home.final_cta": "CTA final",
};

export default function AdminHomepage() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").in("key", KEYS as unknown as string[]);
    if (data) {
      const map: Record<string, Setting> = {};
      data.forEach((s) => { map[s.key] = s as Setting; });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateValue = (key: string, lang: "fr" | "en", newValue: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [`value_${lang}`]: newValue },
    }));
  };

  const save = async (key: string) => {
    setSaving(key);
    const s = settings[key];
    const { error } = await supabase.from("site_settings").update({
      value_fr: s.value_fr,
      value_en: s.value_en,
    }).eq("id", s.id);
    setSaving(null);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Enregistré");
    reloadSiteSettings();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Page d'accueil</h1>
        <p className="text-sm text-muted-foreground mt-1">Modifiez les sections de la page d'accueil pour chaque langue.</p>
      </div>

      {KEYS.map((key) => {
        const s = settings[key];
        if (!s) return null;
        return (
          <section key={key} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-card-foreground">{LABELS[key]}</h2>
              <button
                onClick={() => save(key)}
                disabled={saving === key}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {saving === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>

            <LangTabs
              fr={<SectionEditor sectionKey={key} value={s.value_fr} onChange={(v) => updateValue(key, "fr", v)} />}
              en={<SectionEditor sectionKey={key} value={s.value_en} onChange={(v) => updateValue(key, "en", v)} />}
            />
          </section>
        );
      })}
    </div>
  );
}

// ---- Editors per section type ----

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

function SectionEditor({ sectionKey, value, onChange }: { sectionKey: string; value: any; onChange: (v: any) => void }) {
  const v = value || {};
  if (sectionKey === "home.hero") return <HeroEditor value={v} onChange={onChange} />;
  if (sectionKey === "home.stats") return <StatsEditor value={v} onChange={onChange} />;
  if (sectionKey === "home.pillars") return <PillarsEditor value={v} onChange={onChange} />;
  return <CtaEditor value={v} onChange={onChange} />;
}

function HeroEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const slides = value.slides || [];
  const updateSlide = (i: number, patch: any) => {
    const next = [...slides];
    next[i] = { ...next[i], ...patch };
    onChange({ ...value, slides: next });
  };
  const addSlide = () => onChange({ ...value, slides: [...slides, { title: "", subtitle: "", image: "" }] });
  const removeSlide = (i: number) => onChange({ ...value, slides: slides.filter((_: any, j: number) => j !== i) });

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Bouton CTA principal">
          <input className={inputCls} value={value.cta_primary || ""} onChange={(e) => onChange({ ...value, cta_primary: e.target.value })} />
        </Field>
        <Field label="Bouton CTA secondaire">
          <input className={inputCls} value={value.cta_secondary || ""} onChange={(e) => onChange({ ...value, cta_secondary: e.target.value })} />
        </Field>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Diapositives ({slides.length})</p>
        {slides.map((s: any, i: number) => (
          <div key={i} className="border border-border rounded-md p-4 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Diapo #{i + 1}</span>
              <button onClick={() => removeSlide(i)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <Field label="Titre"><input className={inputCls} value={s.title || ""} onChange={(e) => updateSlide(i, { title: e.target.value })} /></Field>
            <Field label="Sous-titre"><textarea className={inputCls + " resize-none"} rows={2} value={s.subtitle || ""} onChange={(e) => updateSlide(i, { subtitle: e.target.value })} /></Field>
            <Field label="Image">
              <ImageUpload value={s.image || ""} onChange={(url) => updateSlide(i, { image: url })} folder="home/hero" />
            </Field>
          </div>
        ))}
        <button onClick={addSlide} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter une diapositive</button>
      </div>
    </div>
  );
}

function StatsEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const items = value.items || [];
  const update = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...value, items: next });
  };
  const add = () => onChange({ ...value, items: [...items, { icon: "Users", value: "", label: "" }] });
  const remove = (i: number) => onChange({ ...value, items: items.filter((_: any, j: number) => j !== i) });
  return (
    <div className="space-y-3">
      {items.map((s: any, i: number) => (
        <div key={i} className="border border-border rounded-md p-3 grid md:grid-cols-4 gap-2 items-end bg-background">
          <Field label="Icône (lucide)"><input className={inputCls} value={s.icon || ""} onChange={(e) => update(i, { icon: e.target.value })} placeholder="Users" /></Field>
          <Field label="Valeur"><input className={inputCls} value={s.value || ""} onChange={(e) => update(i, { value: e.target.value })} placeholder="5,000+" /></Field>
          <Field label="Libellé"><input className={inputCls} value={s.label || ""} onChange={(e) => update(i, { label: e.target.value })} /></Field>
          <button onClick={() => remove(i)} className="p-2 rounded hover:bg-destructive/10 text-destructive justify-self-end"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter une stat</button>
      <p className="text-xs text-muted-foreground">Icônes disponibles : Users, BookOpen, Target, Globe, Heart, Lightbulb, Shield, etc. (noms <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide</a>)</p>
    </div>
  );
}

function PillarsEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const items = value.items || [];
  const update = (i: number, patch: any) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...value, items: next });
  };
  const add = () => onChange({ ...value, items: [...items, { icon: "Shield", title: "", desc: "" }] });
  const remove = (i: number) => onChange({ ...value, items: items.filter((_: any, j: number) => j !== i) });
  return (
    <div className="space-y-3">
      <Field label="Badge"><input className={inputCls} value={value.badge || ""} onChange={(e) => onChange({ ...value, badge: e.target.value })} /></Field>
      <Field label="Titre"><input className={inputCls} value={value.title || ""} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="Sous-titre"><textarea rows={2} className={inputCls + " resize-none"} value={value.subtitle || ""} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} /></Field>
      <div className="space-y-2 pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Piliers</p>
        {items.map((s: any, i: number) => (
          <div key={i} className="border border-border rounded-md p-3 space-y-2 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              <button onClick={() => remove(i)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              <Field label="Icône"><input className={inputCls} value={s.icon || ""} onChange={(e) => update(i, { icon: e.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="Titre"><input className={inputCls} value={s.title || ""} onChange={(e) => update(i, { title: e.target.value })} /></Field></div>
            </div>
            <Field label="Description"><textarea rows={2} className={inputCls + " resize-none"} value={s.desc || ""} onChange={(e) => update(i, { desc: e.target.value })} /></Field>
          </div>
        ))}
        <button onClick={add} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter un pilier</button>
      </div>
    </div>
  );
}

function CtaEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Titre"><input className={inputCls} value={value.title || ""} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="Sous-titre"><textarea rows={2} className={inputCls + " resize-none"} value={value.subtitle || ""} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} /></Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Texte du bouton"><input className={inputCls} value={value.button || ""} onChange={(e) => onChange({ ...value, button: e.target.value })} /></Field>
        <Field label="Lien du bouton"><input className={inputCls} value={value.link || ""} onChange={(e) => onChange({ ...value, link: e.target.value })} placeholder="/donate" /></Field>
      </div>
    </div>
  );
}

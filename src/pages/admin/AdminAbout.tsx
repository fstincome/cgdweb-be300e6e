import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import ImageUpload from "@/components/ImageUpload";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

interface Setting { id: string; key: string; value_fr: any; value_en: any }

export default function AdminAbout() {
  const [row, setRow] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("key", "about.page").maybeSingle().then(({ data }) => {
      setRow(data as any); setLoading(false);
    });
  }, []);

  const update = (lang: "fr" | "en", v: any) =>
    setRow((r) => (r ? { ...r, [`value_${lang}`]: v } : r));

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ value_fr: row.value_fr, value_en: row.value_en }).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    reloadSiteSettings();
  };

  if (loading || !row) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Page À propos</h1>
          <p className="text-sm text-muted-foreground mt-1">Modifiez les textes et images de la page /about.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
        </button>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <LangTabs
          fr={<Editor value={row.value_fr || {}} onChange={(v) => update("fr", v)} />}
          en={<Editor value={row.value_en || {}} onChange={(v) => update("en", v)} />}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Editor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const v = value || {};
  const setPath = (path: string[], val: any) => {
    const next = JSON.parse(JSON.stringify(v));
    let o = next;
    for (let i = 0; i < path.length - 1; i++) { o[path[i]] = o[path[i]] || {}; o = o[path[i]]; }
    o[path[path.length - 1]] = val;
    onChange(next);
  };

  const items = (key: "approach" | "values") => (v[key]?.items || []) as any[];
  const setItems = (key: "approach" | "values", arr: any[]) => setPath([key, "items"], arr);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-display font-semibold">Mission</h3>
        <Field label="Titre"><input className={inputCls} value={v.mission?.title || ""} onChange={(e) => setPath(["mission", "title"], e.target.value)} /></Field>
        <Field label="Texte"><textarea rows={3} className={inputCls + " resize-none"} value={v.mission?.text || ""} onChange={(e) => setPath(["mission", "text"], e.target.value)} /></Field>
      </section>
      <section className="space-y-3">
        <h3 className="font-display font-semibold">Vision</h3>
        <Field label="Titre"><input className={inputCls} value={v.vision?.title || ""} onChange={(e) => setPath(["vision", "title"], e.target.value)} /></Field>
        <Field label="Texte"><textarea rows={3} className={inputCls + " resize-none"} value={v.vision?.text || ""} onChange={(e) => setPath(["vision", "text"], e.target.value)} /></Field>
      </section>
      <section className="space-y-3">
        <h3 className="font-display font-semibold">Notre histoire</h3>
        <Field label="Titre"><input className={inputCls} value={v.history?.title || ""} onChange={(e) => setPath(["history", "title"], e.target.value)} /></Field>
        <Field label="Texte"><textarea rows={4} className={inputCls + " resize-none"} value={v.history?.text || ""} onChange={(e) => setPath(["history", "text"], e.target.value)} /></Field>
        <Field label="Image"><ImageUpload value={v.history?.image || ""} onChange={(url) => setPath(["history", "image"], url)} folder="about" /></Field>
      </section>

      {(["approach", "values"] as const).map((sec) => (
        <section key={sec} className="space-y-3">
          <h3 className="font-display font-semibold capitalize">{sec === "approach" ? "Notre approche" : "Nos valeurs"}</h3>
          <Field label="Titre"><input className={inputCls} value={v[sec]?.title || ""} onChange={(e) => setPath([sec, "title"], e.target.value)} /></Field>
          <div className="space-y-2">
            {items(sec).map((it, i) => (
              <div key={i} className="border border-border rounded-md p-3 bg-background space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                  <button onClick={() => setItems(sec, items(sec).filter((_, j) => j !== i))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
                <Field label="Titre"><input className={inputCls} value={it.title || ""} onChange={(e) => { const a = [...items(sec)]; a[i] = { ...a[i], title: e.target.value }; setItems(sec, a); }} /></Field>
                <Field label="Description"><textarea rows={2} className={inputCls + " resize-none"} value={it.desc || ""} onChange={(e) => { const a = [...items(sec)]; a[i] = { ...a[i], desc: e.target.value }; setItems(sec, a); }} /></Field>
              </div>
            ))}
            <button onClick={() => setItems(sec, [...items(sec), { title: "", desc: "" }])} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter</button>
          </div>
        </section>
      ))}
    </div>
  );
}

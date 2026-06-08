import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import { Loader2, Save } from "lucide-react";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";

const inputCls =
  "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminContact() {
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("key", "contact.page").maybeSingle().then(({ data }) => {
      setRow(data); setLoading(false);
    });
  }, []);

  const update = (lang: "fr" | "en", patch: any) =>
    setRow((r: any) => ({ ...r, [`value_${lang}`]: { ...(r[`value_${lang}`] || {}), ...patch } }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ value_fr: row.value_fr, value_en: row.value_en }).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Enregistré"); reloadSiteSettings();
  };

  if (loading || !row) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const renderForm = (lang: "fr" | "en") => {
    const d = row[`value_${lang}`] || {};
    return (
      <div className="space-y-3">
        <Labeled label="Intro"><textarea rows={2} className={inputCls + " resize-none"} value={d.intro || ""} onChange={(e) => update(lang, { intro: e.target.value })} /></Labeled>
        <Labeled label="Adresse"><input className={inputCls} value={d.address || ""} onChange={(e) => update(lang, { address: e.target.value })} /></Labeled>
        <Labeled label="Téléphone"><input className={inputCls} value={d.phone || ""} onChange={(e) => update(lang, { phone: e.target.value })} /></Labeled>
        <Labeled label="Email"><input className={inputCls} value={d.email || ""} onChange={(e) => update(lang, { email: e.target.value })} /></Labeled>
        <Labeled label="Horaires"><input className={inputCls} value={d.hours || ""} onChange={(e) => update(lang, { hours: e.target.value })} /></Labeled>
        <Labeled label="Carte (URL embed Google Maps, optionnel)"><input className={inputCls} value={d.map_embed || ""} onChange={(e) => update(lang, { map_embed: e.target.value })} /></Labeled>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Page Contact</h1>
          <p className="text-sm text-muted-foreground mt-1">Coordonnées affichées sur /contact.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
        </button>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <LangTabs fr={renderForm("fr")} en={renderForm("en")} />
      </div>
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

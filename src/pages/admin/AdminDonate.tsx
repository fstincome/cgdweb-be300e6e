import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";

const KEY = "donate.page";
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

interface Setting {
  id: string;
  key: string;
  value_fr: any;
  value_en: any;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AdminDonate() {
  const [s, setS] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").eq("key", KEY).maybeSingle();
    setS(data as Setting | null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (lang: "fr" | "en", v: any) => {
    if (!s) return;
    setS({ ...s, [`value_${lang}`]: v });
  };

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      value_fr: s.value_fr, value_en: s.value_en,
    }).eq("id", s.id);
    setSaving(false);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Enregistré");
    reloadSiteSettings();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!s) return <div className="text-muted-foreground">Aucune donnée trouvée.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Page Don</h1>
          <p className="text-sm text-muted-foreground mt-1">Modifiez le contenu de la page de don pour chaque langue.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
      </div>

      <section className="bg-card border border-border rounded-lg p-6">
        <LangTabs
          fr={<Editor value={s.value_fr || {}} onChange={(v) => update("fr", v)} />}
          en={<Editor value={s.value_en || {}} onChange={(v) => update("en", v)} />}
        />
      </section>
    </div>
  );
}

function Editor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const accounts = value.accounts || [];
  const others = value.other_methods || [];

  const setField = (k: string, v: any) => onChange({ ...value, [k]: v });

  const updateAcc = (i: number, patch: any) => {
    const next = [...accounts]; next[i] = { ...next[i], ...patch };
    onChange({ ...value, accounts: next });
  };
  const addAcc = () => onChange({ ...value, accounts: [...accounts, { bank: "", holder: "", iban: "", swift: "", currency: "", accountNumber: "" }] });
  const removeAcc = (i: number) => onChange({ ...value, accounts: accounts.filter((_: any, j: number) => j !== i) });

  const updateOther = (i: number, patch: any) => {
    const next = [...others]; next[i] = { ...next[i], ...patch };
    onChange({ ...value, other_methods: next });
  };
  const addOther = () => onChange({ ...value, other_methods: [...others, { icon: "CreditCard", title: "", desc: "" }] });
  const removeOther = (i: number) => onChange({ ...value, other_methods: others.filter((_: any, j: number) => j !== i) });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Introduction</p>
        <Field label="Titre"><input className={inputCls} value={value.intro_title || ""} onChange={(e) => setField("intro_title", e.target.value)} /></Field>
        <Field label="Texte"><textarea rows={3} className={inputCls + " resize-none"} value={value.intro_text || ""} onChange={(e) => setField("intro_text", e.target.value)} /></Field>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Libellé « Titulaire »"><input className={inputCls} value={value.holder_label || ""} onChange={(e) => setField("holder_label", e.target.value)} /></Field>
        <Field label="Libellé « Numéro de compte »"><input className={inputCls} value={value.account_label || ""} onChange={(e) => setField("account_label", e.target.value)} /></Field>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Comptes bancaires</p>
        {accounts.map((a: any, i: number) => (
          <div key={i} className="border border-border rounded-md p-4 space-y-2 bg-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Compte #{i + 1}</span>
              <button onClick={() => removeAcc(i)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <Field label="Banque"><input className={inputCls} value={a.bank || ""} onChange={(e) => updateAcc(i, { bank: e.target.value })} /></Field>
              <Field label="Titulaire"><input className={inputCls} value={a.holder || ""} onChange={(e) => updateAcc(i, { holder: e.target.value })} /></Field>
              <Field label="IBAN"><input className={inputCls} value={a.iban || ""} onChange={(e) => updateAcc(i, { iban: e.target.value })} /></Field>
              <Field label="SWIFT/BIC"><input className={inputCls} value={a.swift || ""} onChange={(e) => updateAcc(i, { swift: e.target.value })} /></Field>
              <Field label="Devise"><input className={inputCls} value={a.currency || ""} onChange={(e) => updateAcc(i, { currency: e.target.value })} placeholder="BIF / USD / EUR" /></Field>
              <Field label="Numéro de compte"><input className={inputCls} value={a.accountNumber || ""} onChange={(e) => updateAcc(i, { accountNumber: e.target.value })} /></Field>
            </div>
          </div>
        ))}
        <button onClick={addAcc} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter un compte</button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Autres moyens de donner</p>
        <Field label="Titre de la section"><input className={inputCls} value={value.other_title || ""} onChange={(e) => setField("other_title", e.target.value)} /></Field>
        {others.map((m: any, i: number) => (
          <div key={i} className="border border-border rounded-md p-3 grid md:grid-cols-4 gap-2 items-end bg-background">
            <Field label="Icône (lucide)"><input className={inputCls} value={m.icon || ""} onChange={(e) => updateOther(i, { icon: e.target.value })} placeholder="CreditCard" /></Field>
            <Field label="Titre"><input className={inputCls} value={m.title || ""} onChange={(e) => updateOther(i, { title: e.target.value })} /></Field>
            <Field label="Description"><input className={inputCls} value={m.desc || ""} onChange={(e) => updateOther(i, { desc: e.target.value })} /></Field>
            <button onClick={() => removeOther(i)} className="p-2 rounded hover:bg-destructive/10 text-destructive justify-self-end"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={addOther} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-border rounded-md hover:bg-muted text-muted-foreground"><Plus className="h-4 w-4" /> Ajouter un moyen</button>
        <p className="text-xs text-muted-foreground">Icônes Lucide: CreditCard, Globe, Building2, Heart, Smartphone, etc.</p>
      </div>

      <div>
        <Field label="Message de remerciement"><textarea rows={3} className={inputCls + " resize-none"} value={value.thanks || ""} onChange={(e) => setField("thanks", e.target.value)} /></Field>
      </div>
    </div>
  );
}

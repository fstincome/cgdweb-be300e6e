import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import LangTabs from "@/components/admin/LangTabs";
import ImageUpload from "@/components/ImageUpload";

interface PageItem {
  id: string;
  title: string;
  title_en: string | null;
  slug: string | null;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  published: boolean | null;
  seo_title: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  seo_description_en: string | null;
  og_image: string | null;
}

const empty = {
  title: "", title_en: "", slug: "", description: "", description_en: "",
  image_url: "", published: true,
  seo_title: "", seo_title_en: "", seo_description: "", seo_description_en: "", og_image: "",
};
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminPages() {
  const [items, setItems] = useState<PageItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as PageItem[]);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) await supabase.from("pages").update(form as any).eq("id", editing.id);
    else await supabase.from("pages").insert(form as any);
    setShowForm(false); setEditing(null); setForm(empty); load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cette page ?")) { await supabase.from("pages").delete().eq("id", id); load(); }
  };

  const startEdit = (p: PageItem) => {
    setEditing(p);
    setForm({
      title: p.title,
      title_en: p.title_en || "",
      slug: p.slug || "",
      description: p.description || "",
      description_en: p.description_en || "",
      image_url: p.image_url || "",
      published: p.published ?? true,
      seo_title: p.seo_title || "",
      seo_title_en: p.seo_title_en || "",
      seo_description: p.seo_description || "",
      seo_description_en: p.seo_description_en || "",
      og_image: p.og_image || "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Pages</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouvelle page</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (ex: notre-histoire)" className={inputCls} />
            <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="pages" />
            <LangTabs
              fr={<div className="space-y-3"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className={inputCls} /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contenu (HTML supporté)" rows={8} className={inputCls + " resize-none"} /></div>}
              en={<div className="space-y-3"><input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Title" className={inputCls} /><textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder="Content (HTML supported)" rows={8} className={inputCls + " resize-none"} /></div>}
            />
            <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publié</label>
          </div>

          {/* SEO / Open Graph */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">SEO & Open Graph</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Personnalise l'aperçu dans Google et sur les réseaux sociaux. Si vide, le titre et la description de la page sont utilisés.
            </p>
            <LangTabs
              fr={
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Titre SEO ({form.seo_title.length}/60)</label>
                    <input maxLength={70} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="Titre affiché dans Google (max ~60 caractères)" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Meta description ({form.seo_description.length}/160)</label>
                    <textarea maxLength={200} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder="Description affichée dans Google (max ~160 caractères)" rows={3} className={inputCls + " resize-none"} />
                  </div>
                </div>
              }
              en={
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">SEO Title ({form.seo_title_en.length}/60)</label>
                    <input maxLength={70} value={form.seo_title_en} onChange={(e) => setForm({ ...form, seo_title_en: e.target.value })} placeholder="Title shown in Google (max ~60 chars)" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Meta description ({form.seo_description_en.length}/160)</label>
                    <textarea maxLength={200} value={form.seo_description_en} onChange={(e) => setForm({ ...form, seo_description_en: e.target.value })} placeholder="Description shown in Google (max ~160 chars)" rows={3} className={inputCls + " resize-none"} />
                  </div>
                </div>
              }
            />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Image Open Graph (aperçu réseaux sociaux — 1200×630 recommandé)</label>
              <ImageUpload value={form.og_image} onChange={(url) => setForm({ ...form, og_image: url })} folder="pages/og" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground">Titre</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">SEO</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 text-card-foreground font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.slug || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.seo_title || p.seo_description ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.seo_title || p.seo_description ? "Personnalisé" : "Défaut"}
                  </span>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.published ? "Publié" : "Brouillon"}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucune page.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

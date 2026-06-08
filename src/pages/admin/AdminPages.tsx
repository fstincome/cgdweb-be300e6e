import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import LangTabs from "@/components/admin/LangTabs";
import ImageUpload from "@/components/ImageUpload";

interface PageItem { id: string; title: string; title_en: string | null; slug: string | null; description: string | null; description_en: string | null; image_url: string | null; published: boolean | null; }

const empty = { title: "", title_en: "", slug: "", description: "", description_en: "", image_url: "", published: true };
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Pages</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouvelle page</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (ex: notre-histoire)" className={inputCls} />
          <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="pages" />
          <LangTabs
            fr={<div className="space-y-3"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className={inputCls} /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contenu (HTML supporté)" rows={8} className={inputCls + " resize-none"} /></div>}
            en={<div className="space-y-3"><input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Title" className={inputCls} /><textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder="Content (HTML supported)" rows={8} className={inputCls + " resize-none"} /></div>}
          />
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publié</label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground">Titre</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 text-card-foreground font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.slug || "—"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.published ? "Publié" : "Brouillon"}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => { setEditing(p); setForm({ title: p.title, title_en: p.title_en || "", slug: p.slug || "", description: p.description || "", description_en: p.description_en || "", image_url: p.image_url || "", published: p.published ?? true }); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucune page.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

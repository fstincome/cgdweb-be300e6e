import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import LangTabs from "@/components/admin/LangTabs";

interface Program { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; }

const empty = { title: "", title_en: "", description: "", description_en: "", image_url: "" };
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminPrograms() {
  const [items, setItems] = useState<Program[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Program[]);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) await supabase.from("programs").update(form).eq("id", editing.id);
    else await supabase.from("programs").insert(form);
    setShowForm(false); setEditing(null); setForm(empty); load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) { await supabase.from("programs").delete().eq("id", id); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Programmes</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouveau</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="programs" />
          <LangTabs
            fr={<div className="space-y-3"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className={inputCls} /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className={inputCls + " resize-none"} /></div>}
            en={<div className="space-y-3"><input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Title" className={inputCls} /><textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder="Description" rows={4} className={inputCls + " resize-none"} /></div>}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground w-20">Image</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Titre</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="h-14 w-20 object-cover rounded border border-border" />
                  ) : (
                    <div className="h-14 w-20 rounded border border-dashed border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                  )}
                </td>
                <td className="px-4 py-3 text-card-foreground font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{p.description || "—"}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => { setEditing(p); setForm({ title: p.title, title_en: p.title_en || "", description: p.description || "", description_en: p.description_en || "", image_url: p.image_url || "" }); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucun programme.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

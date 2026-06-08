import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import LangTabs from "@/components/admin/LangTabs";

interface Category { id: string; name: string; name_en: string | null; description: string | null; description_en: string | null; }

const empty = { name: "", name_en: "", description: "", description_en: "" };
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);

  const fetch = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data as Category[]);
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (editing) await supabase.from("categories").update(form).eq("id", editing.id);
    else await supabase.from("categories").insert(form);
    setShowForm(false); setEditing(null); setForm(empty); fetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) { await supabase.from("categories").delete().eq("id", id); fetch(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Catégories</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouvelle</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <LangTabs
            fr={<div className="space-y-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom" className={inputCls} /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className={inputCls + " resize-none"} /></div>}
            en={<div className="space-y-3"><input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="Name" className={inputCls} /><textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder="Description" rows={3} className={inputCls + " resize-none"} /></div>}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 text-card-foreground font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description || "—"}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, name_en: c.name_en || "", description: c.description || "", description_en: c.description_en || "" }); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Aucune catégorie.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

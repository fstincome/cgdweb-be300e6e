import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import LangTabs from "@/components/admin/LangTabs";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  description_en: string | null;
  display_order: number | null;
}

interface Form {
  name: string;
  logo_url: string;
  website: string;
  description: string;
  description_en: string;
  display_order: number;
}

const empty: Form = { name: "", logo_url: "", website: "", description: "", description_en: "", display_order: 0 };

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("partners").select("*").order("display_order");
    if (data) setPartners(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      logo_url: form.logo_url || null,
      website: form.website || null,
      description: form.description || null,
      description_en: form.description_en || null,
      display_order: form.display_order,
    };
    if (editing) {
      await supabase.from("partners").update(payload).eq("id", editing);
      toast.success("Partenaire mis à jour");
    } else {
      await supabase.from("partners").insert(payload);
      toast.success("Partenaire ajouté");
    }
    setSaving(false);
    setOpen(false);
    setEditing(null);
    setForm(empty);
    load();
  };

  const handleEdit = (p: Partner) => {
    setEditing(p.id);
    setForm({ name: p.name, logo_url: p.logo_url || "", website: p.website || "", description: p.description || "", description_en: p.description_en || "", display_order: p.display_order || 0 });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    await supabase.from("partners").delete().eq("id", id);
    toast.success("Partenaire supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Partenaires</h1>
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Logo</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Website</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ordre</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {p.logo_url ? <img src={p.logo_url} alt="" className="h-10 w-10 rounded object-contain" /> : <div className="h-10 w-10 rounded bg-muted" />}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{p.website || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.display_order}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun partenaire</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-card-foreground">{editing ? "Modifier" : "Ajouter"} un partenaire</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nom *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Logo</label>
                <ImageUpload value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} folder="partners" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Website</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <LangTabs
                fr={<div><label className="block text-sm font-medium text-card-foreground mb-1">Description (FR)</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>}
                en={<div><label className="block text-sm font-medium text-card-foreground mb-1">Description (EN)</label><textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>}
              />
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Ordre d'affichage</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90 disabled:opacity-50">{saving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

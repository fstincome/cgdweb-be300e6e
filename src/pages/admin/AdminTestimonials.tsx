import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LangTabs from "@/components/admin/LangTabs";
import ImageUpload from "@/components/ImageUpload";

interface Testimonial {
  id: string;
  quote_fr: string;
  quote_en: string | null;
  name: string;
  role_fr: string | null;
  role_en: string | null;
  avatar_url: string | null;
  display_order: number | null;
  published: boolean | null;
}

interface Form {
  quote_fr: string; quote_en: string;
  name: string;
  role_fr: string; role_en: string;
  avatar_url: string;
  display_order: number;
  published: boolean;
}

const empty: Form = { quote_fr: "", quote_en: "", name: "", role_fr: "", role_en: "", avatar_url: "", display_order: 0, published: true };

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    if (data) setItems(data as Testimonial[]);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.quote_fr.trim() || !form.name.trim()) {
      toast.error("Citation (FR) et nom requis");
      return;
    }
    setSaving(true);
    const payload = {
      quote_fr: form.quote_fr,
      quote_en: form.quote_en || null,
      name: form.name,
      role_fr: form.role_fr || null,
      role_en: form.role_en || null,
      avatar_url: form.avatar_url || null,
      display_order: form.display_order,
      published: form.published,
    };
    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Témoignage mis à jour");
    } else {
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Témoignage ajouté");
    }
    setSaving(false);
    setOpen(false); setEditing(null); setForm(empty); load();
  };

  const handleEdit = (t: Testimonial) => {
    setEditing(t.id);
    setForm({
      quote_fr: t.quote_fr || "", quote_en: t.quote_en || "",
      name: t.name, role_fr: t.role_fr || "", role_en: t.role_en || "",
      avatar_url: t.avatar_url || "",
      display_order: t.display_order || 0,
      published: t.published ?? true,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Témoignages</h1>
        <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:opacity-90">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Auteur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Citation (FR)</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ordre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {t.avatar_url ? <img src={t.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{t.name[0]}</div>}
                    <div>
                      <div>{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role_fr || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-md">{t.quote_fr}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.display_order}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.published ? "Publié" : "Brouillon"}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun témoignage</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-card-foreground">{editing ? "Modifier" : "Ajouter"} un témoignage</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nom *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Photo (avatar)</label>
                <ImageUpload value={form.avatar_url} onChange={(url) => setForm({ ...form, avatar_url: url })} folder="testimonials" />
              </div>
            </div>

            <LangTabs
              fr={
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Citation *</label>
                    <textarea value={form.quote_fr} onChange={(e) => setForm({ ...form, quote_fr: e.target.value })} rows={3} className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Rôle / Fonction</label>
                    <input value={form.role_fr} onChange={(e) => setForm({ ...form, role_fr: e.target.value })} className={inputCls} placeholder="Entrepreneur, Bujumbura" />
                  </div>
                </div>
              }
              en={
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Quote</label>
                    <textarea value={form.quote_en} onChange={(e) => setForm({ ...form, quote_en: e.target.value })} rows={3} className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Role</label>
                    <input value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} className={inputCls} />
                  </div>
                </div>
              }
            />

            <div className="grid md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Ordre d'affichage</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground py-2">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Publié
              </label>
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

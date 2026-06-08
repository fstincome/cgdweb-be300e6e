import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import LangTabs from "@/components/admin/LangTabs";

interface TeamMember { id: string; name: string; role: string | null; role_en: string | null; bio: string | null; bio_en: string | null; image_url: string | null; }

const empty = { name: "", role: "", role_en: "", bio: "", bio_en: "", image_url: "" };
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminTeam() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("team_members").select("id, name, role, role_en, bio, bio_en, image_url").order("display_order");
    if (data) setItems(data as TeamMember[]);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) await supabase.from("team_members").update(form).eq("id", editing.id);
    else await supabase.from("team_members").insert(form);
    setShowForm(false); setEditing(null); setForm(empty); load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) { await supabase.from("team_members").delete().eq("id", id); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Membres de l'équipe</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouveau</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom complet" className={inputCls} />
          <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="team" />
          <LangTabs
            fr={<div className="space-y-3"><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Rôle" className={inputCls} /><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Biographie" rows={3} className={inputCls + " resize-none"} /></div>}
            en={<div className="space-y-3"><input value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} placeholder="Role" className={inputCls} /><textarea value={form.bio_en} onChange={(e) => setForm({ ...form, bio_en: e.target.value })} placeholder="Biography" rows={3} className={inputCls + " resize-none"} /></div>}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground">Photo</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Rôle</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3"><div className="h-10 w-10 rounded-full overflow-hidden bg-muted">{m.image_url ? <img src={m.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-primary/10" />}</div></td>
                <td className="px-4 py-3 text-card-foreground font-medium">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.role || "—"}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => { setEditing(m); setForm({ name: m.name, role: m.role || "", role_en: m.role_en || "", bio: m.bio || "", bio_en: m.bio_en || "", image_url: m.image_url || "" }); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucun membre.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

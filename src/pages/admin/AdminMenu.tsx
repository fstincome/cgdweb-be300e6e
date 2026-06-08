import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, X } from "lucide-react";
import LangTabs from "@/components/admin/LangTabs";
import { reloadMenuItems } from "@/hooks/useMenuItems";

interface MenuItem {
  id: string;
  label_fr: string;
  label_en: string | null;
  path: string;
  display_order: number;
  enabled: boolean;
  is_external: boolean;
  highlight: boolean;
}

const empty: Omit<MenuItem, "id"> = {
  label_fr: "",
  label_en: "",
  path: "/",
  display_order: 0,
  enabled: true,
  is_external: false,
  highlight: false,
};

export default function AdminMenu() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, "id">>(empty);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setItems((data as MenuItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm({ ...empty, display_order: (items.at(-1)?.display_order ?? 0) + 1 });
    setShowForm(true);
  }

  function startEdit(it: MenuItem) {
    setEditing(it);
    setForm({
      label_fr: it.label_fr,
      label_en: it.label_en ?? "",
      path: it.path,
      display_order: it.display_order,
      enabled: it.enabled,
      is_external: it.is_external,
      highlight: it.highlight,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.label_fr.trim() || !form.path.trim()) {
      toast({ title: "Champs requis", description: "Libellé FR et chemin obligatoires", variant: "destructive" });
      return;
    }
    const payload = { ...form, label_en: form.label_en?.trim() || null };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Modifié" : "Ajouté" });
    setShowForm(false);
    setEditing(null);
    await load();
    await reloadMenuItems();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet élément du menu ?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await load();
    await reloadMenuItems();
  }

  async function toggleEnabled(it: MenuItem) {
    const { error } = await supabase.from("menu_items").update({ enabled: !it.enabled }).eq("id", it.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await load();
    await reloadMenuItems();
  }

  async function move(it: MenuItem, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === it.id);
    const swap = items[idx + dir];
    if (!swap) return;
    await supabase.from("menu_items").update({ display_order: swap.display_order }).eq("id", it.id);
    await supabase.from("menu_items").update({ display_order: it.display_order }).eq("id", swap.id);
    await load();
    await reloadMenuItems();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Menu de navigation</h1>
          <p className="text-sm text-muted-foreground">Ajoute, modifie, réordonne ou désactive les liens du menu principal.</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4" />Nouveau lien</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          <h2 className="font-semibold">{editing ? "Modifier le lien" : "Nouveau lien"}</h2>

          <LangTabs
            fr={
              <div className="space-y-2">
                <Label>Libellé (FR) *</Label>
                <Input value={form.label_fr} onChange={(e) => setForm({ ...form, label_fr: e.target.value })} placeholder="Accueil" />
              </div>
            }
            en={
              <div className="space-y-2">
                <Label>Label (EN)</Label>
                <Input value={form.label_en ?? ""} onChange={(e) => setForm({ ...form, label_en: e.target.value })} placeholder="Home" />
              </div>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chemin / URL *</Label>
              <Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/about" />
              <p className="text-xs text-muted-foreground">Interne : <code>/about</code> · Externe : <code>https://...</code></p>
            </div>
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2"><Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} /><span className="text-sm">Activé</span></label>
            <label className="flex items-center gap-2"><Switch checked={form.is_external} onCheckedChange={(v) => setForm({ ...form, is_external: v })} /><span className="text-sm">Lien externe</span></label>
            <label className="flex items-center gap-2"><Switch checked={form.highlight} onCheckedChange={(v) => setForm({ ...form, highlight: v })} /><span className="text-sm">Mettre en avant (style bouton)</span></label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>{editing ? "Enregistrer" : "Créer"}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Aucun lien dans le menu.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Ordre</th>
                <th className="text-left p-3">Libellé FR</th>
                <th className="text-left p-3">Label EN</th>
                <th className="text-left p-3">Chemin</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-muted-foreground">{it.display_order}</span>
                      <button disabled={idx === 0} onClick={() => move(it, -1)} className="p-1 disabled:opacity-30 hover:bg-muted rounded"><ArrowUp className="h-3 w-3" /></button>
                      <button disabled={idx === items.length - 1} onClick={() => move(it, 1)} className="p-1 disabled:opacity-30 hover:bg-muted rounded"><ArrowDown className="h-3 w-3" /></button>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{it.label_fr}{it.highlight && <span className="ml-2 text-xs text-primary">★</span>}</td>
                  <td className="p-3 text-muted-foreground">{it.label_en || "—"}</td>
                  <td className="p-3 font-mono text-xs">{it.path}{it.is_external && <span className="ml-1 text-muted-foreground">↗</span>}</td>
                  <td className="p-3">
                    <Switch checked={it.enabled} onCheckedChange={() => toggleEnabled(it)} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(it)} className="p-2 hover:bg-muted rounded"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(it.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

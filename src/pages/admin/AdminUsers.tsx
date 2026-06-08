import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserWithRole {
  user_id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

interface UserForm {
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  password: string;
  role: string;
}

const emptyForm: UserForm = { display_name: "", email: "", phone: "", avatar_url: "", password: "", role: "visitor" };

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserWithRole | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [showPw, setShowPw] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("user_id, email, display_name, phone, avatar_url");
    if (data) {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string>();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role));
      setUsers(data.map((p: any) => ({
        user_id: p.user_id,
        email: p.email || "",
        display_name: p.display_name,
        phone: p.phone,
        avatar_url: p.avatar_url,
        role: roleMap.get(p.user_id) || "visitor",
      })));
    }
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId: string, newRole: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (newRole !== "visitor") {
      await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    }
  };

  const handleSave = async () => {
    if (editing) {
      // Update profile
      await supabase.from("profiles").update({
        display_name: form.display_name,
        phone: form.phone,
        avatar_url: form.avatar_url || null,
      }).eq("user_id", editing.user_id);
      // Update role
      await updateRole(editing.user_id, form.role);
      toast.success("Utilisateur mis à jour");
    } else {
      // Create new user via signup
      if (!form.email || !form.password) {
        toast.error("Email et mot de passe requis");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { display_name: form.display_name } },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(r => setTimeout(r, 1000));
        await supabase.from("profiles").update({
          phone: form.phone,
          avatar_url: form.avatar_url || null,
        }).eq("user_id", data.user.id);
        if (form.role !== "visitor") {
          await updateRole(data.user.id, form.role);
        }
      }
      toast.success("Utilisateur créé");
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (u: UserWithRole) => {
    setEditing(u);
    setForm({
      display_name: u.display_name || "",
      email: u.email,
      phone: u.phone || "",
      avatar_url: u.avatar_url || "",
      password: "",
      role: u.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("user_id", userId);
    toast.success("Profil supprimé");
    load();
  };

  if (!isAdmin) return <div className="text-center text-muted-foreground py-12">You don't have permission to manage users.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Gestion des utilisateurs</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Nouveau
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Téléphone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rôle</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-card-foreground font-medium">{u.display_name || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{u.role}</span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => handleEdit(u)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(u.user_id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom complet</label>
                <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Téléphone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50" />
            </div>
            {!editing && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mot de passe</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 pr-10 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Photo de profil (URL)</label>
              <input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-all">Enregistrer</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted transition-colors">Annuler</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import PageBanner from "@/components/PageBanner";

interface Profile {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio?: string | null;
}

export default function ProfilePage() {
  const { user, roles } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ display_name: "", phone: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, email, phone, avatar_url").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data as Profile);
        setForm({ display_name: data.display_name || "", phone: (data as any).phone || "", avatar_url: data.avatar_url || "" });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      display_name: form.display_name,
      phone: form.phone,
      avatar_url: form.avatar_url,
    }).eq("user_id", user.id);
    setSaving(false);
  };

  if (!user) return <div className="py-20 text-center text-muted-foreground">Veuillez vous connecter.</div>;

  return (
    <div>
      <PageBanner title="Mon Profil" breadcrumbs={[{ label: "Mon Profil" }]} />
      <div className="container py-12 space-y-8">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              {form.avatar_url ? <img src={form.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-primary" />}
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">{profile?.display_name || user.email}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-primary font-medium capitalize">{roles[0] || "visitor"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
              <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Photo de profil (URL)</label>
              <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary text-primary-foreground font-display font-semibold text-sm rounded-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

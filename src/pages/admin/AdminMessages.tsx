import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessages() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Message[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (row: Message) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !row.is_read })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_read: !r.is_read } : r)));
  };

  const remove = async (row: Message) => {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    toast.success("Message supprimé");
  };

  const openRow = async (row: Message) => {
    setOpenId(openId === row.id ? null : row.id);
    if (!row.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", row.id);
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_read: true } : r)));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  const unread = rows.filter((r) => !r.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Messages de contact</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} message(s){unread > 0 ? ` · ${unread} non lu(s)` : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`bg-card border rounded-lg ${row.is_read ? "border-border" : "border-primary/40"}`}
            >
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => openRow(row)} className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    {row.is_read ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className={`text-sm truncate ${row.is_read ? "text-card-foreground" : "font-semibold text-card-foreground"}`}>
                      {row.name} — {row.subject || "Sans sujet"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {row.email} · {new Date(row.created_at).toLocaleString("fr-FR")}
                  </p>
                </button>
                <button
                  onClick={() => toggleRead(row)}
                  className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-card-foreground"
                >
                  {row.is_read ? "Non lu" : "Lu"}
                </button>
                <a
                  href={`mailto:${row.email}?subject=${encodeURIComponent("Re: " + (row.subject || "Votre message"))}`}
                  className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-card-foreground"
                >
                  Répondre
                </a>
                <button
                  onClick={() => remove(row)}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {openId === row.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <p className="text-sm text-card-foreground whitespace-pre-wrap mt-3">{row.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

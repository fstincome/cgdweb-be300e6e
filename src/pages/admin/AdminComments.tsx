import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  content_type: string;
  content_id: string;
  approved: boolean | null;
  created_at: string;
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const load = async () => {
    let q = supabase.from("comments").select("*").order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("approved", false);
    if (filter === "approved") q = q.eq("approved", true);
    const { data } = await q;
    if (data) setComments(data as Comment[]);
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id: string) => {
    await supabase.from("comments").update({ approved: true }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (confirm("Supprimer ce commentaire ?")) {
      await supabase.from("comments").delete().eq("id", id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Commentaires
        </h1>
        <div className="flex gap-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {f === "all" ? "Tous" : f === "pending" ? "En attente" : "Approuvés"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className={`bg-card border rounded-lg p-4 space-y-2 ${c.approved ? "border-border" : "border-yellow-500/50 bg-yellow-50/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-card-foreground">{c.author_name}</span>
                  {c.author_email && <span className="text-muted-foreground text-xs">({c.author_email})</span>}
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">{format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.approved ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-600"}`}>
                    {c.approved ? "Approuvé" : "En attente"}
                  </span>
                </div>
                <p className="text-sm text-foreground">{c.body}</p>
                <p className="text-xs text-muted-foreground">sur {c.content_type} · {c.content_id.slice(0, 8)}…</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!c.approved && (
                  <button onClick={() => approve(c.id)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Approuver">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => remove(c.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun commentaire.</p>}
      </div>
    </div>
  );
}

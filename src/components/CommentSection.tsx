import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Reply, Send } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  created_at: string;
  parent_id: string | null;
}

interface CommentSectionProps {
  contentType: string;
  contentId: string;
}

export default function CommentSection({ contentType, contentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm] = useState({ author_name: "", author_email: "", body: "" });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  useEffect(() => { load(); }, [contentType, contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.body.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      content_type: contentType,
      content_id: contentId,
      author_name: form.author_name,
      author_email: form.author_email || null,
      body: form.body,
      parent_id: replyTo,
    });
    setForm({ author_name: "", author_email: "", body: "" });
    setReplyTo(null);
    setSubmitting(false);
    load();
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}j`;
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5" /> Commentaires ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-4">
        {topLevel.map((c) => (
          <div key={c.id} className="space-y-3">
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              <button
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Reply className="h-3 w-3" /> Répondre
              </button>
            </div>
            {/* Replies */}
            {replies(c.id).map((r) => (
              <div key={r.id} className="ml-6 bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">{r.author_name}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              </div>
            ))}
            {/* Reply form */}
            {replyTo === c.id && (
              <form onSubmit={handleSubmit} className="ml-6 space-y-2">
                <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Votre nom" required className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Votre réponse..." required rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
                <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-all">Répondre</button>
              </form>
            )}
          </div>
        ))}
        {topLevel.length === 0 && <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>}
      </div>

      {/* New comment form */}
      {!replyTo && (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground">Laisser un commentaire</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Nom *" required className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} placeholder="Email (optionnel)" type="email" className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Votre commentaire..." required rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-all">
            <Send className="h-4 w-4" /> Envoyer
          </button>
        </form>
      )}
    </div>
  );
}

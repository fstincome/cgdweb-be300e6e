import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import LangTabs from "@/components/admin/LangTabs";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { toGallery } from "@/lib/gallery";
import { toast } from "@/hooks/use-toast";

interface Article { id: string; title: string; slug: string | null; published: boolean | null; created_at: string; }
interface Category { id: string; name: string; }

const empty = { title: "", title_en: "", content: "", content_en: "", slug: "", slug_en: "", published: false, meta_title: "", meta_title_en: "", meta_description: "", meta_description_en: "", image_url: "", category_id: "", gallery: [] as string[] };

const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(empty);

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles").select("id, title, slug, published, created_at").order("created_at", { ascending: false });
    if (data) setArticles(data);
  };

  useEffect(() => {
    fetchArticles();
    supabase.from("categories").select("id, name").order("name").then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const [saving, setSaving] = useState(false);

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Titre requis", description: "Veuillez saisir un titre.", variant: "destructive" }); return; }
    setSaving(true);
    const base = form.slug.trim() ? slugify(form.slug) : slugify(form.title);
    let slug = base || `article-${Date.now()}`;

    // Garantir l'unicité du slug
    const { data: existing } = await supabase.from("articles").select("id, slug").like("slug", `${slug}%`);
    const taken = (existing || []).filter((a) => a.id !== editing?.id).map((a) => a.slug);
    if (taken.includes(slug)) {
      let i = 2;
      while (taken.includes(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }

    const payload = {
      ...form,
      slug,
      slug_en: form.slug_en.trim() ? slugify(form.slug_en) : null,
      category_id: form.category_id || null,
      publish_date: form.published ? new Date().toISOString() : null,
    };

    const { error } = editing
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert({ ...payload, author_id: user?.id });

    setSaving(false);
    if (error) {
      toast({ title: "Échec de l'enregistrement", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.published ? "Article publié" : "Brouillon enregistré" });
    setShowForm(false); setEditing(null); setForm(empty); fetchArticles();
  };

  const handleEdit = async (article: Article) => {
    const { data } = await supabase.from("articles").select("*").eq("id", article.id).single();
    setEditing(article);
    setForm({
      title: data?.title || "", title_en: data?.title_en || "",
      content: data?.content || "", content_en: data?.content_en || "",
      slug: data?.slug || "", slug_en: data?.slug_en || "",
      published: data?.published || false,
      meta_title: data?.meta_title || "", meta_title_en: data?.meta_title_en || "",
      meta_description: data?.meta_description || "", meta_description_en: data?.meta_description_en || "",
      image_url: data?.image_url || "",
      category_id: data?.category_id || "",
      gallery: toGallery(data?.gallery),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cet article ?")) { await supabase.from("articles").delete().eq("id", id); fetchArticles(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Articles</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"><Plus className="h-4 w-4" /> Nouvel article</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-card-foreground">{editing ? "Modifier" : "Nouvel"} article</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Image principale</label>
              <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="articles" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Catégorie</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputCls}>
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <LangTabs
            fr={
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Titre</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-sm font-medium mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-sm font-medium mb-1">Contenu</label><RichTextEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} /></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium mb-1">Meta Titre</label><input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-sm font-medium mb-1">Meta Description</label><input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className={inputCls} /></div>
                </div>
              </div>
            }
            en={
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Title</label><input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-sm font-medium mb-1">Slug</label><input value={form.slug_en} onChange={(e) => setForm({ ...form, slug_en: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-sm font-medium mb-1">Content</label><RichTextEditor content={form.content_en} onChange={(html) => setForm({ ...form, content_en: html })} /></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium mb-1">Meta Title</label><input value={form.meta_title_en} onChange={(e) => setForm({ ...form, meta_title_en: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-sm font-medium mb-1">Meta Description</label><input value={form.meta_description_en} onChange={(e) => setForm({ ...form, meta_description_en: e.target.value })} className={inputCls} /></div>
                </div>
              </div>
            }
          />

          <GalleryEditor value={form.gallery} onChange={(gallery) => setForm({ ...form, gallery })} folder="articles" />

          <label className="flex items-center gap-2 text-sm text-card-foreground">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publié
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 border border-border text-muted-foreground text-sm rounded-md hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left px-4 py-3 font-medium text-muted-foreground">Titre</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-3 text-card-foreground font-medium">{a.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.slug || "—"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{a.published ? "Publié" : "Brouillon"}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => handleEdit(a)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucun article.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

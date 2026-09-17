import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Image as ImageIcon, Loader2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { reloadSiteSettings } from "@/hooks/useSiteSettings";
import { BREADCRUMB_PAGES } from "@/lib/pageBanners";

interface SettingRow {
  id: string;
  key: string;
  value_fr: Record<string, any> | null;
  value_en: Record<string, any> | null;
}

const SETTING_KEY = "site.banners";
const DEFAULT_IMAGE = "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ";
const inputCls = "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none";

export default function AdminBreadcrumb() {
  const [row, setRow] = useState<SettingRow | null>(null);
  const [valueFr, setValueFr] = useState<Record<string, any>>({});
  const [valueEn, setValueEn] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("id, key, value_fr, value_en")
      .eq("key", SETTING_KEY)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) {
          setRow(data as SettingRow);
          setValueFr((data.value_fr as Record<string, any>) || {});
          setValueEn((data.value_en as Record<string, any>) || {});
        }
        setLoading(false);
      });
  }, []);

  const pages = useMemo(() => BREADCRUMB_PAGES.map((page) => ({
    ...page,
    labelFr: valueFr[page.slug]?.label || page.labelFr,
    labelEn: valueEn[page.slug]?.label || page.labelEn,
    image: valueFr[page.slug]?.image || valueEn[page.slug]?.image || "",
  })), [valueFr, valueEn]);

  const updatePage = (slug: string, patch: { labelFr?: string; labelEn?: string; image?: string }) => {
    setValueFr((current) => {
      const next = { ...current, [slug]: { ...(current[slug] || {}) } };
      if (patch.labelFr !== undefined) next[slug].label = patch.labelFr;
      if (patch.image !== undefined) next[slug].image = patch.image;
      return next;
    });
    setValueEn((current) => {
      const next = { ...current, [slug]: { ...(current[slug] || {}) } };
      if (patch.labelEn !== undefined) next[slug].label = patch.labelEn;
      if (patch.image !== undefined) next[slug].image = patch.image;
      return next;
    });
  };

  const savePage = async (slug: string) => {
    setSaving(slug);
    const nextFr = { ...valueFr, [slug]: { ...(valueFr[slug] || {}) } };
    const nextEn = { ...valueEn, [slug]: { ...(valueEn[slug] || {}) } };
    const config = BREADCRUMB_PAGES.find((page) => page.slug === slug);
    if (config) {
      nextFr[slug].label = nextFr[slug].label || config.labelFr;
      nextEn[slug].label = nextEn[slug].label || config.labelEn;
    }

    if (row) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value_fr: nextFr, value_en: nextEn })
        .eq("id", row.id);
      setSaving(null);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("site_settings")
        .insert({ key: SETTING_KEY, value_fr: nextFr, value_en: nextEn, description: "Images et libellés des breadcrumbs" })
        .select("id, key, value_fr, value_en")
        .single();
      setSaving(null);
      if (error) {
        toast.error(error.message);
        return;
      }
      setRow(data as SettingRow);
    }

    setValueFr(nextFr);
    setValueEn(nextEn);
    setEditingSlug(null);
    reloadSiteSettings();
    toast.success("Breadcrumb enregistré");
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Breadcrumb</h1>
        <p className="text-sm text-muted-foreground mt-1">Modifiez l'image et le libellé du fil d'Ariane pour chaque page.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-[220px_1fr_190px] gap-4 px-4 py-3 bg-muted text-xs font-semibold text-muted-foreground uppercase">
          <span>Page</span>
          <span>Image actuelle</span>
          <span className="text-right">Action</span>
        </div>

        {pages.map((page) => {
          const isEditing = editingSlug === page.slug;
          return (
            <div key={page.slug} className="border-t border-border first:border-t-0 md:first:border-t">
              <div className="grid md:grid-cols-[220px_1fr_190px] gap-4 p-4 items-center">
                <div className="space-y-1">
                  <p className="font-display font-semibold text-card-foreground">{page.labelFr}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{page.path}</span>
                    {page.path !== "/category" && (
                      <Link to={page.path} className="inline-flex items-center gap-1 text-primary hover:underline">
                        Voir <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-20 w-32 rounded-md border border-border bg-muted overflow-hidden shrink-0">
                    {page.image ? (
                      <img src={page.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <img src={DEFAULT_IMAGE} alt="" className="h-full w-full object-cover opacity-70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-card-foreground truncate">{page.image ? "Image personnalisée" : "Image par défaut"}</p>
                    <p className="text-xs text-muted-foreground truncate">{page.labelEn}</p>
                  </div>
                </div>

                <div className="flex justify-start md:justify-end">
                  <Button type="button" variant={isEditing ? "secondary" : "outline"} onClick={() => setEditingSlug(isEditing ? null : page.slug)}>
                    {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    {isEditing ? "Fermer" : "Modifier l'image"}
                  </Button>
                </div>
              </div>

              {isEditing && (
                <div className="px-4 pb-5 md:pl-[240px] space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Libellé FR</label>
                      <input className={inputCls} value={valueFr[page.slug]?.label || ""} onChange={(e) => updatePage(page.slug, { labelFr: e.target.value })} placeholder={page.labelFr} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Libellé EN</label>
                      <input className={inputCls} value={valueEn[page.slug]?.label || ""} onChange={(e) => updatePage(page.slug, { labelEn: e.target.value })} placeholder={page.labelEn} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Image breadcrumb</label>
                    <ImageUpload value={page.image} onChange={(url) => updatePage(page.slug, { image: url })} folder="banners" />
                  </div>
                  <Button type="button" onClick={() => savePage(page.slug)} disabled={saving === page.slug}>
                    {saving === page.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
        <ImageIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p>Pour les articles, programmes et projets individuels, l'image breadcrumb vient de l'image principale de l'élément.</p>
      </div>
    </div>
  );
}
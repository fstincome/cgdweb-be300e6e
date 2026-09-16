import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/PageBanner";
import CommentSection from "@/components/CommentSection";
import { useParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { tField } from "@/lib/i18nField";
import ImageGallery from "@/components/ImageGallery";
import { toGallery } from "@/lib/gallery";

interface Program { id: string; title: string; title_en: string | null; description: string | null; description_en: string | null; image_url: string | null; gallery?: unknown; }

export default function ProgramDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [program, setProgram] = useState<Program | null>(null);

  const title = program ? tField(program, "title", lang) : "";
  const description = program ? tField(program, "description", lang) : "";

  useSEO({
    title,
    description: description?.slice(0, 155),
    ogImage: program?.image_url || undefined,
  });

  useEffect(() => {
    supabase.from("programs").select("id, title, title_en, description, description_en, image_url, gallery").eq("id", id).single().then(({ data }) => { if (data) setProgram(data as Program); });
  }, [id]);

  if (!program) return <div className="py-20 text-center text-muted-foreground">{lang === "en" ? "Loading..." : "Chargement..."}</div>;

  return (
    <div>
      <PageBanner title={title} imageUrl={program.image_url} breadcrumbs={[{ label: lang === "en" ? "Programs" : "Programmes", to: "/programs" }, { label: title }]} />
      <div className="container py-12 space-y-10">
        <p className="text-muted-foreground leading-relaxed font-serif whitespace-pre-wrap">{description}</p>
        <ImageGallery images={toGallery(program.gallery)} title={lang === "en" ? "Gallery" : "Galerie"} />
        <CommentSection contentType="program" contentId={program.id} />
      </div>
    </div>
  );
}

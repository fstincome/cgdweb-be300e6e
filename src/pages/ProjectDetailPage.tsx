import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/PageBanner";
import CommentSection from "@/components/CommentSection";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { tField } from "@/lib/i18nField";
import ImageGallery from "@/components/ImageGallery";
import { toGallery } from "@/lib/gallery";

interface Project {
  id: string;
  title: string; title_en: string | null;
  description: string | null; description_en: string | null;
  image_url: string | null; status: string | null; gallery?: unknown;
  program: { title: string; title_en: string | null } | null;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);

  const title = project ? tField(project, "title", lang) : "";
  const description = project ? tField(project, "description", lang) : "";

  useSEO({
    title,
    description: description?.slice(0, 155),
    ogImage: project?.image_url || undefined,
  });

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title, title_en, description, description_en, image_url, status, gallery, program:programs(title, title_en)")
      .eq("id", id)
      .single()
      .then(({ data }) => { if (data) setProject(data as unknown as Project); });
  }, [id]);

  if (!project) return <div className="py-20 text-center text-muted-foreground">{lang === "en" ? "Loading..." : "Chargement..."}</div>;

  const programTitle = project.program ? tField(project.program, "title", lang) : "";

  return (
    <div>
      <PageBanner title={title} imageUrl={project.image_url} breadcrumbs={[{ label: lang === "en" ? "Projects" : "Projets", to: "/projects" }, ...(programTitle ? [{ label: programTitle }] : []), { label: title }]} />
      <div className="container py-12 space-y-10">
        {project.status && <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{project.status}</span>}
        <p className="text-muted-foreground leading-relaxed font-serif whitespace-pre-wrap">{description}</p>
        <ImageGallery images={toGallery(project.gallery)} title={lang === "en" ? "Gallery" : "Galerie"} />
        <CommentSection contentType="project" contentId={project.id} />
      </div>
    </div>
  );
}

import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import PageBanner from "@/components/PageBanner";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageBanner } from "@/hooks/usePageBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FALLBACK = { intro: "", address: "", phone: "", email: "", hours: "", map_embed: "" };

export default function ContactPage() {
  const banner = usePageBanner("contact");
  const { t } = useLanguage();
  const { get } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const data = { ...FALLBACK, ...(get<typeof FALLBACK>("contact.page") || {}) };

  usePageSEO("contact", { title: t("contact.title"), description: data.intro || "Contactez le Centre for Green Development." });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) return;
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.slice(0, 100),
      email: email.slice(0, 255),
      subject: form.subject.trim().slice(0, 150) || null,
      message: message.slice(0, 1000),
    });
    setSending(false);
    if (error) {
      toast.error("Échec de l'envoi. Merci de réessayer.");
      return;
    }
    toast.success("Merci ! Votre message a bien été envoyé.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div>
      <PageBanner title={t("contact.title")} imageUrl={banner.image} breadcrumbs={[{ label: banner.label || t("contact.title") }]} />
      <div className="container py-12 space-y-10">
        {data.intro && <p className="text-center text-muted-foreground max-w-2xl mx-auto">{data.intro}</p>}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            {data.address && (
              <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" /><div><p className="font-display font-semibold text-foreground text-sm">{t("contact.address")}</p><p className="text-muted-foreground text-sm">{data.address}</p></div></div>
            )}
            {data.phone && (
              <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" /><div><p className="font-display font-semibold text-foreground text-sm">{t("contact.phone")}</p><p className="text-muted-foreground text-sm">{data.phone}</p></div></div>
            )}
            {data.email && (
              <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" /><div><p className="font-display font-semibold text-foreground text-sm">{t("contact.email")}</p><p className="text-muted-foreground text-sm">{data.email}</p></div></div>
            )}
            {data.hours && (
              <div className="flex items-start gap-3"><Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" /><div><p className="font-display font-semibold text-foreground text-sm">Horaires</p><p className="text-muted-foreground text-sm">{data.hours}</p></div></div>
            )}
            {data.map_embed && (
              <div className="rounded-lg overflow-hidden border border-border aspect-video">
                <iframe src={data.map_embed} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("contact.name")}</label>
              <input type="text" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("contact.email")}</label>
              <input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Sujet</label>
              <input type="text" maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("contact.message")}</label>
              <textarea required maxLength={1000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <button type="submit" disabled={sending} className="px-6 py-2.5 bg-primary text-primary-foreground font-display font-semibold text-sm rounded-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">{sending ? "Envoi…" : t("contact.send")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

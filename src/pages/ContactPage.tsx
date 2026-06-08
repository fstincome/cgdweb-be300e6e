import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import PageBanner from "@/components/PageBanner";
import { useSEO } from "@/hooks/useSEO";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useSEO({ title: t("contact.title"), description: "Contactez le Centre for Green Development. Adresse, téléphone et formulaire de contact." });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div>
      <PageBanner title={t("contact.title")} breadcrumbs={[{ label: t("contact.title") }]} />
      <div className="container py-12 space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">{t("contact.address")}</p>
                <p className="text-muted-foreground text-sm">Kinyota/Muyinga, RN6, ICIZANYE HOTEL, 1st floor, MUYINGA, Burundi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">{t("contact.phone")}</p>
                <p className="text-muted-foreground text-sm">+257 68 336 228</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">{t("contact.email")}</p>
                <p className="text-muted-foreground text-sm">info@centreforgreendevelopment.org</p>
              </div>
            </div>
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("contact.message")}</label>
              <textarea required maxLength={1000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-display font-semibold text-sm rounded-md hover:opacity-90 active:scale-[0.98] transition-all">{t("contact.send")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

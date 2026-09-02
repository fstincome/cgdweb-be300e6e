import { useLanguage } from "@/contexts/LanguageContext";
import PageBanner from "@/components/PageBanner";
import { Heart, Building2, CreditCard, Globe, Copy, Check, Smartphone, DollarSign, Bitcoin } from "lucide-react";
import { useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageBanner } from "@/hooks/usePageBanner";

const ICONS: Record<string, any> = { CreditCard, Globe, Building2, Heart, Smartphone, DollarSign, Bitcoin };

const FALLBACK = {
  intro_title: "",
  intro_text: "",
  holder_label: "",
  account_label: "",
  other_title: "",
  thanks: "",
  accounts: [] as any[],
  other_methods: [] as any[],
};

export default function DonatePage() {
  const banner = usePageBanner("donate");
  const { t } = useLanguage();
  const { get } = useSiteSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  usePageSEO("donate", { title: t("donate.title"), description: "Soutenez nos actions pour le développement durable au Burundi. Faites un don." });

  const data: typeof FALLBACK = { ...FALLBACK, ...(get<typeof FALLBACK>("donate.page") || {}) };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div>
      <PageBanner title={t("donate.title")} imageUrl={banner.image} breadcrumbs={[{ label: t("nav.home"), to: "/" }, { label: banner.label || t("donate.title") }]} />

      <section className="py-16">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">{data.intro_title || t("donate.intro.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{data.intro_text || t("donate.intro.text")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {data.accounts.map((acc: any, i: number) => (
              <div key={i} className="border border-border rounded-xl p-6 space-y-4 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm">{acc.bank}</h3>
                    {acc.currency && <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">{acc.currency}</span>}
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: data.holder_label || t("donate.holder"), value: acc.holder, key: `holder-${i}` },
                    { label: "IBAN", value: acc.iban, key: `iban-${i}` },
                    { label: "SWIFT/BIC", value: acc.swift, key: `swift-${i}` },
                    { label: data.account_label || t("donate.account"), value: acc.accountNumber, key: `acc-${i}` },
                  ].filter((f) => f.value).map(({ label, value, key }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground block text-xs">{label}</span>
                        <span className="text-foreground font-mono text-xs">{value}</span>
                      </div>
                      <button onClick={() => copyToClipboard(value, key)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy">
                        {copiedField === key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {data.other_methods.length > 0 && (
            <div className="border border-border rounded-xl p-8 bg-muted/50 space-y-6">
              <h3 className="font-display font-bold text-xl text-foreground text-center">{data.other_title || t("donate.other.title")}</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {data.other_methods.map((m: any, i: number) => {
                  const Icon = ICONS[m.icon] || CreditCard;
                  return (
                    <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2 text-center">
                      <Icon className="h-6 w-6 text-primary mx-auto" />
                      <h4 className="font-display font-semibold text-sm text-foreground">{m.title}</h4>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
            <p>{data.thanks || t("donate.thanks")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

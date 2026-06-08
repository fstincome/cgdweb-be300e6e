import { Mail, Phone, Clock, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK = {
  phone: "+257 68 336 228",
  email: "info@centreforgreendevelopment.org",
  socials: { facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com", youtube: "https://youtube.com" },
};

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { get } = useSiteSettings();
  const data = { ...FALLBACK, ...(get<typeof FALLBACK>("site.topbar") || {}) };
  const s: Record<string, string> = (data.socials || {}) as any;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-secondary text-secondary-foreground text-xs border-b border-border">
      <div className="container flex items-center justify-between h-8 gap-4 overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          {data.phone && (
            <span className="hidden sm:inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {data.phone}</span>
          )}
          {data.email && (
            <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> <span className="hidden md:inline">{data.email}</span><span className="md:hidden">Email</span></span>
          )}
          <span className="hidden lg:inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}{" "}
            {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Facebook className="h-3.5 w-3.5" /></a>}
          {s.twitter && <a href={s.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Twitter className="h-3.5 w-3.5" /></a>}
          {s.linkedin && <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin className="h-3.5 w-3.5" /></a>}
          {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Youtube className="h-3.5 w-3.5" /></a>}
        </div>
      </div>
    </div>
  );
}

import { Mail, Phone, Clock, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-secondary text-secondary-foreground text-xs border-b border-border">
      <div className="container flex items-center justify-between h-8 gap-4 overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Phone className="h-3 w-3" /> +257 68 336 228
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" /> <span className="hidden md:inline">info@centreforgreendevelopment.org</span><span className="md:hidden">Email</span>
          </span>
          <span className="hidden lg:inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            {" "}
            {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Twitter className="h-3.5 w-3.5" /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin className="h-3.5 w-3.5" /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Youtube className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </div>
  );
}

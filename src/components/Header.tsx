import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, User, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuItems } from "@/hooks/useMenuItems";
import logo from "@/assets/logo.jpeg";

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { items: menuItems } = useMenuItems(true);
  const labelOf = (m: { label_fr: string; label_en: string | null }) =>
    lang === "en" ? (m.label_en?.trim() || m.label_fr) : m.label_fr;
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="CGD Logo" className="h-10 w-10 rounded-full object-cover" />
          <div className="hidden sm:block">
            <span className="font-display text-sm font-bold text-foreground leading-tight block">Centre for Green Development</span>
            <span className="text-[10px] text-muted-foreground italic leading-tight">Let's bring together green revolution.</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {menuItems.map((m) => {
            const isActive = location.pathname === m.path;
            const base = "px-3 py-2 text-sm font-medium rounded-md transition-colors";
            const cls = m.highlight
              ? `${base} bg-primary text-primary-foreground hover:bg-primary/90`
              : isActive
                ? `${base} bg-primary/10 text-primary`
                : `${base} text-foreground/70 hover:text-foreground hover:bg-muted`;
            if (m.is_external) {
              return <a key={m.id} href={m.path} target="_blank" rel="noreferrer" className={cls}>{labelOf(m)}</a>;
            }
            return <Link key={m.id} to={m.path} className={cls}>{labelOf(m)}</Link>;
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* User profile link */}
          {user && (
            <Link to="/profile" className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Profile">
              <User className="h-4 w-4" />
            </Link>
          )}

          {/* Lang select */}
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "fr")}
              className="appearance-none bg-background border border-border rounded-md px-2 py-1.5 text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring pr-6"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-background p-4 space-y-1">
          {menuItems.map((m) => {
            const isActive = location.pathname === m.path;
            const cls = `block px-3 py-2 text-sm font-medium rounded-md transition-colors ${m.highlight ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"}`;
            if (m.is_external) {
              return <a key={m.id} href={m.path} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)} className={cls}>{labelOf(m)}</a>;
            }
            return <Link key={m.id} to={m.path} onClick={() => setMobileOpen(false)} className={cls}>{labelOf(m)}</Link>;
          })}
        </nav>
      )}
    </header>
  );
}

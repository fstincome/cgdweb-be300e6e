import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, FileText, FolderOpen, Users, Layers,
  BookOpen, LogOut, Menu, X, Settings, File, Handshake, MessageSquare, Home, Quote, ListOrdered,
  Sun, Moon, Globe, Heart, Info, Phone, Globe2, Images, Mail, Image
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpeg";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Page d'accueil", path: "/admin/homepage", icon: Home },
  { label: "Page À propos", path: "/admin/about", icon: Info },
  { label: "Page Contact", path: "/admin/contact", icon: Phone },
  { label: "Messages reçus", path: "/admin/messages", icon: Mail },
  { label: "Page Don", path: "/admin/donate", icon: Heart },
  { label: "Contenu du site", path: "/admin/site", icon: Globe2 },
  { label: "Breadcrumb", path: "/admin/breadcrumb", icon: Image },
  { label: "Menu de navigation", path: "/admin/menu", icon: ListOrdered },
  { label: "Témoignages", path: "/admin/testimonials", icon: Quote },
  { label: "Articles", path: "/admin/articles", icon: FileText },
  { label: "Commentaires", path: "/admin/comments", icon: MessageSquare },
  { label: "Categories", path: "/admin/categories", icon: FolderOpen },
  { label: "Programs", path: "/admin/programs", icon: BookOpen },
  { label: "Projects", path: "/admin/projects", icon: Layers },
  { label: "Pages", path: "/admin/pages", icon: File },
  { label: "Team", path: "/admin/team", icon: Users },
  { label: "Partenaires", path: "/admin/partners", icon: Handshake },
  { label: "Médiathèque", path: "/admin/media", icon: Images },
  { label: "Users", path: "/admin/users", icon: Settings },
];

export default function AdminLayout() {
  const { user, signOut, roles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen flex bg-muted">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="CGD" className="h-8 w-8 rounded-full object-cover" />
              <span className="font-display font-bold text-sm text-card-foreground">CGD Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-card-foreground hover:bg-muted"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-border space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <p className="text-xs text-primary font-medium capitalize">{roles[0] || "user"}</p>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full">
              <LogOut className="h-4 w-4" />Sign Out
            </button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground"><Menu className="h-5 w-5" /></button>
          <h2 className="font-display font-semibold text-card-foreground text-sm">{navItems.find((n) => n.path === location.pathname)?.label || "Admin"}</h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-2 py-1 font-semibold transition-colors ${lang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-card-foreground"}`}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 font-semibold transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-card-foreground"}`}
                aria-label="English"
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
              aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

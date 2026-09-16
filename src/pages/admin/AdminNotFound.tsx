import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, FileText, Images, Mail, Home } from "lucide-react";

const shortcuts = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/media", label: "Médiathèque", icon: Images },
  { to: "/admin/messages", label: "Messages reçus", icon: Mail },
  { to: "/", label: "Voir le site", icon: Home },
];

export default function AdminNotFound() {
  const location = useLocation();

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <p className="font-display text-6xl font-bold text-primary leading-none">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        Cette section du tableau de bord n'existe pas
      </h1>
      <p className="mt-3 text-muted-foreground">
        L'adresse <span className="font-mono text-xs break-all">{location.pathname}</span> ne correspond à aucune page
        d'administration.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Page précédente
      </button>
    </div>
  );
}

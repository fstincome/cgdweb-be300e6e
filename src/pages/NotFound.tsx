import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useLanguage();
  const fr = lang !== "en";

  useEffect(() => {
    document.title = fr ? "Page introuvable — CGD" : "Page not found — CGD";
  }, [fr]);

  const links = [
    { to: "/", label: fr ? "Accueil" : "Home" },
    { to: "/programs", label: fr ? "Programmes" : "Programs" },
    { to: "/projects", label: fr ? "Projets" : "Projects" },
    { to: "/blog", label: fr ? "Actualités" : "News" },
    { to: "/contact", label: "Contact" },
    { to: "/donate", label: fr ? "Faire un don" : "Donate" },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <img src={logo} alt="CGD" className="h-16 w-16 rounded-full object-cover mx-auto mb-6" />
        <p className="font-display text-7xl md:text-8xl font-bold text-primary leading-none">404</p>
        <h1 className="mt-4 font-display text-2xl md:text-3xl font-bold text-foreground">
          {fr ? "Cette page n'existe pas" : "This page does not exist"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {fr
            ? "Le lien est peut-être erroné ou la page a été déplacée."
            : "The link may be wrong or the page has been moved."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70 break-all">
          <Search className="inline h-3 w-3 mr-1" />
          {location.pathname}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            {fr ? "Retour à l'accueil" : "Back to home"}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {fr ? "Page précédente" : "Go back"}
          </button>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            {fr ? "Pages populaires" : "Popular pages"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            to="/admin"
            className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {fr ? "Tableau de bord" : "Dashboard"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

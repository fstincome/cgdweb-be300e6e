import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageBannerProps {
  title: string;
  imageUrl?: string | null;
  breadcrumbs?: Breadcrumb[];
}

const DEFAULT_IMAGE = "https://lh3.googleusercontent.com/d/1RAhUuswgBLe02nOp-YeEPgIrjvL7cGvQ";

export default function PageBanner({ title, imageUrl, breadcrumbs }: PageBannerProps) {
  return (
    <section className="relative h-56 md:h-72 overflow-hidden">
      <img
        src={imageUrl || DEFAULT_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-secondary/75" />
      <div className="container relative h-full flex flex-col justify-end pb-8 gap-3">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-secondary-foreground/70">
            <Link to="/" className="hover:text-secondary-foreground transition-colors">Accueil</Link>
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                {bc.to ? (
                  <Link to={bc.to} className="hover:text-secondary-foreground transition-colors">{bc.label}</Link>
                ) : (
                  <span className="text-secondary-foreground">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display font-bold text-3xl md:text-4xl text-secondary-foreground">{title}</h1>
      </div>
    </section>
  );
}

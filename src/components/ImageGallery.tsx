import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  images: string[];
  title?: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState<string | null>(null);
  if (!images || images.length === 0) return null;

  return (
    <section className="space-y-4">
      {title && <h2 className="font-display font-bold text-xl text-foreground">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setActive(url)}
            className="group aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
          >
            <img
              src={url}
              alt={title ? `${title} — image ${i + 1}` : `Image ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-2">
          {active && <img src={active} alt={title || ""} className="w-full h-auto rounded-md" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

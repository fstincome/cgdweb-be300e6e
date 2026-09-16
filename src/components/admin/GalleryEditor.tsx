import { useState } from "react";
import { Images, X, ArrowLeft, ArrowRight } from "lucide-react";
import MediaPickerDialog from "@/components/media/MediaPickerDialog";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
}

export default function GalleryEditor({ value, onChange, folder = "gallery", label = "Galerie d'images" }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const add = (url: string) => {
    if (!url || value.includes(url)) return;
    onChange([...value, url]);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-card-foreground">{label}</label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-muted transition-colors"
        >
          <Images className="h-4 w-4" /> Ajouter une image
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune image dans la galerie.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {value.map((url, i) => (
            <div key={url + i} className="group relative rounded-md overflow-hidden border border-border bg-muted">
              <img src={url} alt="" className="h-20 w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                title="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => move(i, -1)} className="p-0.5 rounded bg-background/90 text-foreground" title="Déplacer à gauche">
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="p-0.5 rounded bg-background/90 text-foreground" title="Déplacer à droite">
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} folder={folder} onSelect={add} />
    </div>
  );
}

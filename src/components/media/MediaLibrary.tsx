import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Trash2, RefreshCw, Check, Search } from "lucide-react";
import { toast } from "sonner";

export interface MediaItem {
  path: string;
  name: string;
  url: string;
  size: number;
  createdAt: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function listFolder(prefix: string): Promise<{ files: any[]; folders: string[] }> {
  const { data, error } = await supabase.storage.from("uploads").list(prefix, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) return { files: [], folders: [] };
  const files = data.filter((d) => d.id !== null).map((d) => ({ ...d, path: prefix ? `${prefix}/${d.name}` : d.name }));
  const folders = data.filter((d) => d.id === null).map((d) => (prefix ? `${prefix}/${d.name}` : d.name));
  return { files, folders };
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const all: any[] = [];
  const queue = [""];
  let guard = 0;
  while (queue.length && guard < 50) {
    guard++;
    const prefix = queue.shift() as string;
    const { files, folders } = await listFolder(prefix);
    all.push(...files);
    queue.push(...folders);
  }
  if (all.length === 0) return [];
  const { data } = await supabase.storage
    .from("uploads")
    .createSignedUrls(all.map((f) => f.path), TEN_YEARS);
  const urlByPath = new Map((data || []).map((d: any) => [d.path, d.signedUrl]));
  return all
    .map((f) => ({
      path: f.path,
      name: f.name,
      url: urlByPath.get(f.path) || "",
      size: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? null,
    }))
    .filter((f) => f.url)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

interface Props {
  onSelect?: (url: string) => void;
  selectedUrl?: string;
  folder?: string;
}

export default function MediaLibrary({ onSelect, selectedUrl, folder = "library" }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setItems(await fetchMedia());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} : format non supporté`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`${file.name} : dépasse 5 Mo`);
        continue;
      }
      const ext = file.name.split(".").pop();
      const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 40);
      const path = `${folder}/${Date.now()}-${base}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file);
      if (error) toast.error(`${file.name} : ${error.message}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await load();
    toast.success("Bibliothèque mise à jour");
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Supprimer définitivement ce média ?")) return;
    const { error } = await supabase.storage.from("uploads").remove([path]);
    if (error) return toast.error("Suppression impossible", { description: error.message });
    setItems((prev) => prev.filter((i) => i.path !== path));
    toast.success("Média supprimé");
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Envoi…" : "Ajouter des images"}
        </button>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border text-muted-foreground hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un fichier…"
            className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_TYPES.join(",")} onChange={handleUpload} className="hidden" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucun média pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => {
            const isSelected = selectedUrl && selectedUrl.includes(item.path);
            return (
              <div
                key={item.path}
                className={`group relative rounded-lg border overflow-hidden bg-card ${isSelected ? "border-primary ring-2 ring-primary" : "border-border"}`}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(item.url)}
                  className="block w-full aspect-square bg-muted"
                  title={item.name}
                >
                  <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                </button>
                {isSelected && (
                  <span className="absolute top-1 left-1 rounded-full bg-primary text-primary-foreground p-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.path)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <p className="px-2 py-1 text-[11px] text-muted-foreground truncate">{item.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

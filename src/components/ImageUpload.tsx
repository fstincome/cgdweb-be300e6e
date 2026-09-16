import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Images } from "lucide-react";
import { toast } from "sonner";
import MediaPickerDialog from "@/components/media/MediaPickerDialog";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({ value, onChange, folder = "images" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URL when preview changes/unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Format non supporté", {
        description: "Utilisez JPG, PNG, WebP, GIF ou SVG.",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Size validation
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Fichier trop volumineux", {
        description: `Taille max ${MAX_SIZE_MB} Mo (fichier : ${(file.size / 1024 / 1024).toFixed(2)} Mo).`,
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      toast.error("Erreur d'upload", { description: error.message });
      setPreview(null);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const { data, error: urlError } = await supabase.storage
      .from("uploads")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 ans
    if (urlError || !data) {
      toast.error("Erreur URL", { description: urlError?.message || "inconnue" });
      setPreview(null);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange(data.signedUrl);
    setPreview(null);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Image téléchargée");
  };

  const displayed = preview || value;

  return (
    <div className="space-y-2">
      {displayed && (
        <div className="relative inline-block">
          <img
            src={displayed}
            alt=""
            className={`h-24 w-auto rounded-md border border-border object-cover transition-opacity ${uploading ? "opacity-60" : ""}`}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={() => { onChange(""); setPreview(null); }}
              className="absolute -top-2 -right-2 p-0.5 bg-destructive text-destructive-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Upload…" : value ? "Remplacer" : "Choisir image"}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Images className="h-4 w-4" /> Bibliothèque
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ou coller une URL"
          className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF, SVG · max {MAX_SIZE_MB} Mo</p>
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleUpload} className="hidden" />
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedUrl={value}
        folder={folder}
        onSelect={(url) => { onChange(url); setPreview(null); }}
      />
    </div>
  );
}

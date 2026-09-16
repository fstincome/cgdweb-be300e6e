import MediaLibrary from "@/components/media/MediaLibrary";

export default function AdminMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Bibliothèque de médias</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les images du site. Ajoutez-en ici, puis réutilisez-les partout via le bouton « Bibliothèque ».
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <MediaLibrary />
      </div>
    </div>
  );
}

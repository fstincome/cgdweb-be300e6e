import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaLibrary from "./MediaLibrary";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  selectedUrl?: string;
  folder?: string;
}

export default function MediaPickerDialog({ open, onOpenChange, onSelect, selectedUrl, folder }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bibliothèque de médias</DialogTitle>
        </DialogHeader>
        <MediaLibrary
          folder={folder}
          selectedUrl={selectedUrl}
          onSelect={(url) => { onSelect(url); onOpenChange(false); }}
        />
      </DialogContent>
    </Dialog>
  );
}

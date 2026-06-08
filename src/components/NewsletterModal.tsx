import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter_dismissed");
    if (dismissed) return;

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        setOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) sessionStorage.setItem("newsletter_dismissed", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim(), name: name.trim() || null });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.info("Vous êtes déjà abonné(e) !");
      else toast.error("Erreur lors de l'inscription.");
    } else {
      toast.success("Merci pour votre abonnement !");
    }
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Mail className="h-5 w-5 text-primary" /> Newsletter
          </DialogTitle>
          <DialogDescription>
            Recevez nos derniers articles et actualités directement dans votre boîte mail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <Input placeholder="Votre nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="email" required placeholder="Votre email *" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi…" : "S'abonner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

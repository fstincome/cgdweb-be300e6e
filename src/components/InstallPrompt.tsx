import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "cgd-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const { lang } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // iOS Safari never fires beforeinstallprompt — show manual instructions.
    if (isIOS()) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (isIOS()) {
      setShowIOSHelp(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferred(null);
  };

  const t = {
    title: lang === "fr" ? "Installer l'application CGD" : "Install the CGD app",
    desc:
      lang === "fr"
        ? "Ajoutez le Centre for Green Development à votre écran d'accueil pour un accès rapide."
        : "Add the Centre for Green Development to your home screen for quick access.",
    button: lang === "fr" ? "Installer" : "Install",
    iosHelp:
      lang === "fr"
        ? "Sur iPhone/iPad : appuyez sur le bouton Partager, puis « Sur l'écran d'accueil »."
        : "On iPhone/iPad: tap the Share button, then \"Add to Home Screen\".",
    close: lang === "fr" ? "Fermer" : "Close",
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 rounded-xl border border-border bg-background shadow-lg p-4 animate-in slide-in-from-bottom-4">
      <button
        onClick={dismiss}
        aria-label={t.close}
        className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="CGD" className="h-10 w-10 rounded-lg shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-foreground">{t.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
          {showIOSHelp && (
            <p className="text-xs text-primary mt-2 flex items-start gap-1.5">
              <Share className="h-3.5 w-3.5 shrink-0 mt-px" />
              {t.iosHelp}
            </p>
          )}
          <button
            onClick={install}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isIOS() ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            {t.button}
          </button>
        </div>
      </div>
    </div>
  );
}

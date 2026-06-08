import { useState, ReactNode } from "react";

interface Props {
  fr: ReactNode;
  en: ReactNode;
}

export default function LangTabs({ fr, en }: Props) {
  const [tab, setTab] = useState<"fr" | "en">("fr");
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border border-border overflow-hidden bg-muted text-xs">
        <button
          type="button"
          onClick={() => setTab("fr")}
          className={`px-3 py-1.5 font-semibold transition-colors ${tab === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🇫🇷 Français
        </button>
        <button
          type="button"
          onClick={() => setTab("en")}
          className={`px-3 py-1.5 font-semibold transition-colors ${tab === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          🇬🇧 English
        </button>
      </div>
      <div>{tab === "fr" ? fr : en}</div>
    </div>
  );
}

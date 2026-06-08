import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLang } from "@/lib/i18nField";

type SettingRow = { key: string; value_fr: any; value_en: any };

let _cache: SettingRow[] | null = null;
let _listeners: (() => void)[] = [];

async function loadAll() {
  const { data } = await supabase.from("site_settings").select("key, value_fr, value_en");
  _cache = (data as SettingRow[] | null) ?? [];
  _listeners.forEach((l) => l());
}

export function useSiteSettings() {
  const { lang } = useLanguage();
  const [, setTick] = useState(0);

  useEffect(() => {
    const sub = () => setTick((t) => t + 1);
    _listeners.push(sub);
    if (_cache === null) loadAll();
    return () => { _listeners = _listeners.filter((l) => l !== sub); };
  }, []);

  function get<T = any>(key: string): T | null {
    if (!_cache) return null;
    const row = _cache.find((r) => r.key === key);
    if (!row) return null;
    return pickLang<T>({ value_fr: row.value_fr, value_en: row.value_en }, lang);
  }

  return { get, ready: _cache !== null, reload: loadAll };
}

export function reloadSiteSettings() {
  return loadAll();
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  label_fr: string;
  label_en: string | null;
  path: string;
  display_order: number;
  enabled: boolean;
  is_external: boolean;
  highlight: boolean;
}

let _cache: MenuItem[] | null = null;
let _listeners: (() => void)[] = [];

async function loadAll() {
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .order("display_order", { ascending: true });
  _cache = (data as MenuItem[] | null) ?? [];
  _listeners.forEach((l) => l());
}

export function useMenuItems(onlyEnabled = true) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const sub = () => setTick((t) => t + 1);
    _listeners.push(sub);
    if (_cache === null) loadAll();
    return () => { _listeners = _listeners.filter((l) => l !== sub); };
  }, []);

  const items = _cache ?? [];
  return {
    items: onlyEnabled ? items.filter((i) => i.enabled) : items,
    ready: _cache !== null,
    reload: loadAll,
  };
}

export function reloadMenuItems() {
  return loadAll();
}

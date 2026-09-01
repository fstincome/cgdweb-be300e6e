// Helper to pick the correct localized field on a record based on active language.
// Falls back to the FR (default) field if EN is missing.
export type Lang = "en" | "fr";

export function tField<T extends Record<string, any>>(
  row: T | null | undefined,
  base: string,
  lang: Lang,
): string {
  if (!row) return "";
  if (lang === "en") {
    const en = row[`${base}_en`];
    if (en && String(en).trim() !== "") return en;
  }
  const direct = row[base];
  if (direct != null && String(direct).trim() !== "") return direct;
  return row[`${base}_fr`] ?? "";
}

// Pick from an object {fr,en} block (e.g. from site_settings)
export function pickLang<T = any>(
  obj: { value_fr?: T | null; value_en?: T | null } | null | undefined,
  lang: Lang,
): T | null {
  if (!obj) return null;
  if (lang === "en" && obj.value_en) return obj.value_en;
  return obj.value_fr ?? obj.value_en ?? null;
}

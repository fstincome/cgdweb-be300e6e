export function toGallery(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      return toGallery(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

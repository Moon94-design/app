import type { MasterRepoRecord, SuggestCandidate } from "./types";

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function collectRowTexts(row: Record<string, unknown>, keys: string[]): string[] {
  const out: string[] = [];
  const base = row.base && typeof row.base === "object" ? (row.base as Record<string, unknown>) : null;

  for (const key of keys) {
    const direct = getText(row[key]);
    if (direct) out.push(direct);
    if (base) {
      const nested = getText(base[key]);
      if (nested) out.push(nested);
    }
  }
  return out;
}

export function collectMasterTags(rows: MasterRepoRecord[], keys: string[]): string[] {
  const out: string[] = [];
  for (const row of rows) {
    out.push(...collectRowTexts(row as Record<string, unknown>, keys));
  }
  return out;
}

export function buildTagCandidates(
  systemTags: string[],
  personalTags: string[],
  masterNames: string[]
): SuggestCandidate[] {
  const out: SuggestCandidate[] = [];
  const seen = new Set<string>();

  for (const tag of [...systemTags, ...masterNames]) {
    const t = tag.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push({ tag: t, source: "system" });
  }

  for (const tag of personalTags) {
    const t = tag.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push({ tag: t, source: "personal" });
  }

  return out.slice(0, 600);
}

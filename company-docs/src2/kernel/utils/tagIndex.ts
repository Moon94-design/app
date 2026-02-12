import { STORAGE_KEYS } from "@kernel/repo";
import { createJsonStorage } from "@kernel/repo/storage/jsonStorage";

export type TagIndexRow = {
  tag: string;
  total: number;
  byScope: Record<string, number>;
  lastUsedAt: string;
};

const storage = createJsonStorage();
const TAG_INDEX_UPDATED_EVENT = "tag-index-updated";

function nowIso() {
  return new Date().toISOString();
}

export const SYSTEM_KEY = STORAGE_KEYS.tagIndexSystemV1;
export const USER_KEY = STORAGE_KEYS.tagUserV1;
export const PERSONAL_PREFIX = STORAGE_KEYS.tagPersonalPrefixV1;

export function getUserKey(explicit?: string) {
  if (explicit && explicit.trim()) return explicit.trim();
  const v = storage.getItem<string>(USER_KEY);
  return (v || "").trim() || "local";
}

export function normTag(s: string) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.startsWith("#") ? t.slice(1).trim() : t;
}

export function parseTagsText(text: string): string[] {
  return (text || "")
    .split(",")
    .map((x) => normTag(x))
    .filter(Boolean);
}

export function buildTagsText(tags: string[]) {
  return tags.join(", ");
}

export function loadIndex(key: string): TagIndexRow[] {
  const rows = storage.getItem<TagIndexRow[]>(key);
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      tag: typeof row?.tag === "string" ? row.tag : "",
      total: Number(row?.total) || 0,
      byScope: row?.byScope && typeof row.byScope === "object" ? row.byScope : {},
      lastUsedAt: typeof row?.lastUsedAt === "string" ? row.lastUsedAt : "",
    }))
    .filter((row) => Boolean(row.tag));
}

export function saveIndex(key: string, rows: TagIndexRow[]) {
  storage.setItem(key, rows.slice(0, 500));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TAG_INDEX_UPDATED_EVENT));
  }
}

export function bumpIndex(key: string, scope: string, tag: string) {
  const now = nowIso();
  const rows = loadIndex(key);
  const t = normTag(tag);
  if (!t) return;

  const idx = rows.findIndex((row) => row.tag === t);
  if (idx >= 0) {
    const row = rows[idx];
    rows[idx] = {
      ...row,
      total: (row.total || 0) + 1,
      byScope: { ...(row.byScope || {}), [scope]: ((row.byScope || {})[scope] || 0) + 1 },
      lastUsedAt: now,
    };
  } else {
    rows.unshift({
      tag: t,
      total: 1,
      byScope: { [scope]: 1 },
      lastUsedAt: now,
    });
  }

  saveIndex(key, rows);
}

export function deleteFromIndex(key: string, tag: string) {
  const t = normTag(tag);
  if (!t) return;
  saveIndex(
    key,
    loadIndex(key).filter((row) => row.tag !== t)
  );
}

function normSearch(s: string) {
  return (s || "").toLowerCase().trim();
}

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

function isNumericish(q: string) {
  const x = (q || "").trim();
  return !!x && /^[0-9-]+$/.test(x);
}

export function getSuggestions(systemKey: string, personalKey: string, scope: string, q: string, limit = 10) {
  const qqRaw = normTag(q);
  const qq = normSearch(qqRaw);
  if (qq.length < 1) return [];

  const sys = loadIndex(systemKey).map((row) => ({ ...row, _source: "system" as const }));
  const per = loadIndex(personalKey).map((row) => ({ ...row, _source: "personal" as const }));

  const scoreBase = (row: TagIndexRow) =>
    ((row.byScope || {})[scope] || 0) * 100000 +
    (row.total || 0) * 1000 +
    (row.lastUsedAt ? Date.parse(row.lastUsedAt) : 0) / 1000000;

  const looseMode = isNumericish(qqRaw);
  const qqLoose = normLoose(qqRaw);

  function rank(tag: string) {
    const a = looseMode ? normLoose(tag) : normSearch(tag);
    const b = looseMode ? qqLoose : qq;
    if (a === b) return 0;
    if (a.startsWith(b)) return 1;
    if (a.endsWith(b)) return 1.2;
    if (a.includes(b)) return 2;
    // Legacy-style fallback: query contains tag (helps "A" -> "Aa" continuity).
    if (b.includes(a)) return 2.8;
    return 99;
  }

  const rows = [...per, ...sys]
    .map((row) => {
      const tag = row.tag || "";
      const rr = rank(tag);
      if (rr >= 99) return null;
      return {
        tag,
        source: row._source as "system" | "personal",
        rr,
        score: scoreBase(row),
      };
    })
    .filter(Boolean) as Array<{ tag: string; source: "system" | "personal"; rr: number; score: number }>;

  // Textual relevance first, usage/frequency as tie-breaker.
  rows.sort((a, b) => a.rr - b.rr || b.score - a.score || b.tag.length - a.tag.length);

  const seen = new Set<string>();
  const out: Array<{ tag: string; source: "system" | "personal" }> = [];

  for (const row of rows) {
    if (seen.has(row.tag)) continue;
    seen.add(row.tag);
    out.push({ tag: row.tag, source: row.source });
    if (out.length >= limit) break;
  }

  return out;
}

export function bumpSystemTag(scope: string, tag: string) {
  bumpIndex(SYSTEM_KEY, scope, tag);
}

export function bumpPersonalTag(scope: string, tag: string, userKey?: string) {
  const key = `${PERSONAL_PREFIX}${getUserKey(userKey)}`;
  bumpIndex(key, scope, tag);
}

export function listSystemTags() {
  return loadIndex(SYSTEM_KEY).map((row) => row.tag);
}

export function listPersonalTags(userKey?: string) {
  const key = `${PERSONAL_PREFIX}${getUserKey(userKey)}`;
  return loadIndex(key).map((row) => row.tag);
}

export function getTagIndexUpdatedEventName() {
  return TAG_INDEX_UPDATED_EVENT;
}

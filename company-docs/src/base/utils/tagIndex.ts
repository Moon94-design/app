export type TagIndexRow = {
  tag: string;
  total: number;
  byScope: Record<string, number>;
  lastUsedAt: string;
};

export type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

let adapter: StorageAdapter = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

export function setStorageAdapter(a: StorageAdapter) {
  adapter = a;
}

function nowIso() {
  return new Date().toISOString();
}

export const SYSTEM_KEY = "tag_index_system_v1";
export const USER_KEY = "tag_user_v1";
export const PERSONAL_PREFIX = "tag_index_personal_v1_";

export function getUserKey(explicit?: string) {
  if (explicit && explicit.trim()) return explicit.trim();
  try {
    const v = (adapter.getItem(USER_KEY) || "").trim();
    return v || "local";
  } catch {
    return "local";
  }
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
  try {
    const raw = adapter.getItem(key);
    if (!raw) return [];
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .map((r: any) => ({
        tag: typeof r?.tag === "string" ? r.tag : "",
        total: Number(r?.total) || 0,
        byScope: r?.byScope && typeof r.byScope === "object" ? r.byScope : {},
        lastUsedAt: typeof r?.lastUsedAt === "string" ? r.lastUsedAt : "",
      }))
      .filter((r: TagIndexRow) => !!r.tag);
  } catch {
    return [];
  }
}

export function saveIndex(key: string, rows: TagIndexRow[]) {
  try {
    adapter.setItem(key, JSON.stringify(rows.slice(0, 500)));
  } catch {}
}

export function bumpIndex(key: string, scope: string, tag: string) {
  const now = nowIso();
  const rows = loadIndex(key);
  const t = normTag(tag);
  if (!t) return;

  const i = rows.findIndex((r) => r.tag === t);
  if (i >= 0) {
    const r = rows[i];
    rows[i] = {
      ...r,
      total: (r.total || 0) + 1,
      byScope: { ...(r.byScope || {}), [scope]: ((r.byScope || {})[scope] || 0) + 1 },
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
  const rows = loadIndex(key);
  saveIndex(key, rows.filter((r) => r.tag !== t));
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
  const sys = loadIndex(systemKey).map((r) => ({ ...r, _source: "system" as const }));
  const per = loadIndex(personalKey).map((r) => ({ ...r, _source: "personal" as const }));

  const scoreBase = (r: TagIndexRow) =>
    ((r.byScope || {})[scope] || 0) * 100000 +
    (r.total || 0) * 1000 +
    (r.lastUsedAt ? Date.parse(r.lastUsedAt) : 0) / 1000000;

  const looseMode = isNumericish(qqRaw);
  const qqLoose = normLoose(qqRaw);

  function rank(tag: string) {
    const a = looseMode ? normLoose(tag) : normSearch(tag);
    const b = looseMode ? qqLoose : qq;

    if (a === b) return 0;
    if (a.startsWith(b)) return 1;
    if (a.endsWith(b)) return 1.2;
    if (a.includes(b)) return 2;
    return 99;
  }

  const rows = [...per, ...sys]
    .map((r) => {
      const tag = r.tag || "";
      const rr = rank(tag);
      if (rr >= 99) return null;
      return {
        tag,
        source: (r as any)._source as "system" | "personal",
        score: scoreBase(r) - rr * 10000000,
      };
    })
    .filter(Boolean) as Array<{ tag: string; source: "system" | "personal"; score: number }>;

  rows.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: Array<{ tag: string; source: "system" | "personal" }> = [];
  for (const r of rows) {
    if (seen.has(r.tag)) continue;
    seen.add(r.tag);
    out.push({ tag: r.tag, source: r.source });
    if (out.length >= limit) break;
  }
  return out;
}

export function bumpSystemTag(scope: string, tag: string) {
  bumpIndex(SYSTEM_KEY, scope, tag);
}

export function bumpPersonalTag(scope: string, tag: string, userKey?: string) {
  const u = getUserKey(userKey);
  const personalKey = `${PERSONAL_PREFIX}${u}`;
  bumpIndex(personalKey, scope, tag);
}

export function listSystemTags() {
  return loadIndex(SYSTEM_KEY).map((r) => r.tag);
}

export function listPersonalTags(userKey?: string) {
  const u = getUserKey(userKey);
  const key = `${PERSONAL_PREFIX}${u}`;
  return loadIndex(key).map((r) => r.tag);
}

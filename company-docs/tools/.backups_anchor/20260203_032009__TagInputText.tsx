import { useEffect, useMemo, useRef, useState } from "react";

type TagIndexRow = {
  tag: string;
  total: number;
  byScope: Record<string, number>;
  lastUsedAt: string;
};

type SuggestItem = { tag: string; source: "system" | "personal" };

const SYSTEM_KEY = "tag_index_system_v1";
const USER_KEY = "tag_user_v1";
const PERSONAL_PREFIX = "tag_index_personal_v1_";

function nowIso() {
  return new Date().toISOString();
}

function getUserKey(explicit?: string) {
  if (explicit && explicit.trim()) return explicit.trim();
  try {
    const v = (localStorage.getItem(USER_KEY) || "").trim();
    return v || "local";
  } catch {
    return "local";
  }
}

function normTag(s: string) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.startsWith("#") ? t.slice(1).trim() : t;
}

function parseTagsText(text: string): string[] {
  return (text || "")
    .split(",")
    .map((x) => normTag(x))
    .filter(Boolean);
}

function buildTagsText(tags: string[]) {
  return tags.join(", ");
}

function loadIndex(key: string): TagIndexRow[] {
  try {
    const raw = localStorage.getItem(key);
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

function saveIndex(key: string, rows: TagIndexRow[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows.slice(0, 500)));
  } catch {}
}

function bumpIndex(key: string, scope: string, tag: string) {
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

function deleteFromIndex(key: string, tag: string) {
  const t = normTag(tag);
  if (!t) return;
  const rows = loadIndex(key);
  saveIndex(key, rows.filter((r) => r.tag !== t));
}

function normSearch(s: string) {
  return (s || "").toLowerCase().trim();
}
function normLoose(s: string) {
  // 차량번호/숫자 같은 건 하이픈/공백 제거로 비교
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}
function isNumericish(q: string) {
  const x = (q || "").trim();
  return !!x && /^[0-9-]+$/.test(x);
}

function getSuggestions(systemKey: string, personalKey: string, scope: string, q: string, limit = 10): SuggestItem[] {
  const qqRaw = normTag(q);
  const qq = normSearch(qqRaw);
  if (qq.length < 3) return []; // ✅ 3글자부터 추천

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

    // exact / prefix / suffix / includes
    if (a === b) return 0;
    if (a.startsWith(b)) return 1;
    if (a.endsWith(b)) return 1.2; // suffix 조금 우대(차량번호 뒷자리)
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
  const out: SuggestItem[] = [];
  for (const r of rows) {
    if (seen.has(r.tag)) continue;
    seen.add(r.tag);
    out.push({ tag: r.tag, source: r.source });
    if (out.length >= limit) break;
  }
  return out;
}

// ✅ 외부(추천 태그 클릭)에서 “기준(시스템) 태그”로 누적
export function bumpSystemTag(scope: string, tag: string) {
  bumpIndex(SYSTEM_KEY, scope, tag);
}

// ✅ 외부에서 “개인 태그”로 누적(내용 추천에서 개인 태그 클릭 등)
export function bumpPersonalTag(scope: string, tag: string, userKey?: string) {
  const u = getUserKey(userKey);
  const personalKey = `${PERSONAL_PREFIX}${u}`;
  bumpIndex(personalKey, scope, tag);
}

export function listSystemTags(): string[] {
  return loadIndex(SYSTEM_KEY).map((r) => r.tag);
}

export function listPersonalTags(userKey?: string): string[] {
  const u = getUserKey(userKey);
  const key = `${PERSONAL_PREFIX}${u}`;
  return loadIndex(key).map((r) => r.tag);
}

type Props = {
  value: string;
  onChange: (next: string) => void;
  scope: string;
  placeholder?: string;
  userKey?: string;
};

export default function TagInputText({ value, onChange, scope, placeholder, userKey }: Props) {
  const tags = useMemo(() => parseTagsText(value), [value]);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [indexTick, setIndexTick] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const uKey = useMemo(() => getUserKey(userKey), [userKey]);
  const personalKey = useMemo(() => `${PERSONAL_PREFIX}${uKey}`, [uKey]);

  const suggestions = useMemo(
    () => getSuggestions(SYSTEM_KEY, personalKey, scope, input),
    [personalKey, scope, input, indexTick]
  );

  const systemRows = useMemo(() => loadIndex(SYSTEM_KEY), [indexTick]);
  const personalRows = useMemo(() => loadIndex(personalKey), [personalKey, manageOpen, indexTick]);

  const systemSet = useMemo(() => new Set(systemRows.map((r) => r.tag)), [systemRows]);

  useEffect(() => {
    setOpen(!!input.trim());
  }, [input]);

  function refreshIndexView() {
    setIndexTick((t) => t + 1);
  }

  function commitTag(raw: string) {
    const t = normTag(raw);
    if (!t) return;

    if (tags.includes(t)) {
      setInput("");
      setOpen(false);
      return;
    }

    // ✅ 수동 입력 태그는 개인 태그로 누적
    bumpIndex(personalKey, scope, t);
    refreshIndexView();

    onChange(buildTagsText([...tags, t]));
    setInput("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag(input);
      return;
    }
    if (e.key === ",") {
      e.preventDefault();
      commitTag(input);
      return;
    }
    if (e.key === "Backspace" && !input) {
      if (tags.length === 0) return;
      onChange(buildTagsText(tags.slice(0, -1)));
      return;
    }
  }

  function pickSuggestion(s: SuggestItem) {
    commitTag(s.tag);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* chips with color */}
      {tags.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {tags.map((t) => {
            const isSystem = systemSet.has(t);
            return (
              <span
                key={t}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: isSystem ? "rgba(70,130,255,0.24)" : "rgba(255,255,255,0.06)",
                  border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
                  fontSize: 13,
                }}
                title={isSystem ? "기준 태그" : "개인 태그"}
              >
                #{t}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* input */}
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || "태그 입력(3글자↑ 추천) 후 Enter 또는 ,"}
        />

        <div className="row" style={{ marginTop: 0 }}>
          <button type="button" className="btn" onClick={() => setManageOpen((v) => !v)}>
            개인 태그 관리
          </button>
        </div>
      </div>

      {/* [ANCHOR:TAG_SUGGEST_DROPDOWN_START] */}
      {open && suggestions.length ? (
        <div
          style={{
            marginTop: 8,
            borderRadius: 12,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          {suggestions.map((s) => {
            const isSystem = s.source === "system";
            return (
              <button
                key={`${s.source}:${s.tag}`}
                type="button"
                onClick={() => pickSuggestion(s)}
                className="btn"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  borderRadius: 0,
                  background: "transparent",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: isSystem ? "rgba(70,130,255,0.85)" : "rgba(255,255,255,0.35)",
                  }}
                />
                <span style={{ fontWeight: 900 }}>#{s.tag}</span>
                <span style={{ opacity: 0.65, fontSize: 12 }}>
                  {isSystem ? "기준" : "개인"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      {/* [ANCHOR:TAG_SUGGEST_DROPDOWN_END] */}

      {/* [ANCHOR:PERSONAL_TAG_MANAGER_START] */}
      {manageOpen ? (
        <div
          style={{
            marginTop: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            padding: 10,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>개인 태그(삭제 가능)</div>

          {personalRows.length === 0 ? (
            <div className="p" style={{ marginTop: 0, opacity: 0.75 }}>아직 없음</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {personalRows
                .slice()
                .sort((a, b) => (b.total || 0) - (a.total || 0))
                .slice(0, 80)
                .map((r) => (
                  <div
                    key={r.tag}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.22)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>#{r.tag}</div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>({r.total})</div>
                    </div>

                    <button
                      type="button"
                      className="btn danger"
                      style={{ padding: "6px 10px" }}
                      onClick={() => {
                        deleteFromIndex(personalKey, r.tag);
                        refreshIndexView();
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : null}
      {/* [ANCHOR:PERSONAL_TAG_MANAGER_END] */}
    </div>
  );
}

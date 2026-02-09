import { useEffect, useMemo, useRef, useState } from "react";

type TagIndexRow = {
  tag: string;
  total: number;
  byScope: Record<string, number>;
  lastUsedAt: string;
};

const SYSTEM_KEY = "tag_index_system_v1"; // 나중에 기준정보 기반 태그(공용)
const USER_KEY = "tag_user_v1";          // 로컬 단계 사용자 식별
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

function getSuggestions(systemKey: string, personalKey: string, scope: string, q: string, limit = 8) {
  const qq = normTag(q).toLowerCase();
  if (!qq) return [];

  const sys = loadIndex(systemKey);
  const per = loadIndex(personalKey);

  const score = (r: TagIndexRow) =>
    ((r.byScope || {})[scope] || 0) * 100000 +
    (r.total || 0) * 1000 +
    (r.lastUsedAt ? Date.parse(r.lastUsedAt) : 0) / 1000000;

  const filterMap = (rows: TagIndexRow[]) =>
    rows
      .filter((r) => (r.tag || "").toLowerCase().includes(qq))
      .map((r) => ({ tag: r.tag, score: score(r) }))
      .sort((a, b) => b.score - a.score);

  const a = filterMap(per);
  const b = filterMap(sys);

  const seen = new Set<string>();
  const out: string[] = [];

  for (const x of a) {
    if (seen.has(x.tag)) continue;
    seen.add(x.tag);
    out.push(x.tag);
    if (out.length >= limit) return out;
  }
  for (const x of b) {
    if (seen.has(x.tag)) continue;
    seen.add(x.tag);
    out.push(x.tag);
    if (out.length >= limit) return out;
  }
  return out;
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
  const [indexTick, setIndexTick] = useState(0); // ✅ 추가/삭제 즉시 반영용

  const inputRef = useRef<HTMLInputElement | null>(null);

  const uKey = useMemo(() => getUserKey(userKey), [userKey]);
  const personalKey = useMemo(() => `${PERSONAL_PREFIX}${uKey}`, [uKey]);

  const suggestions = useMemo(() => getSuggestions(SYSTEM_KEY, personalKey, scope, input), [personalKey, scope, input, indexTick]);

  // ✅ 관리창이 켜져 있을 때도 즉시 반영되도록 tick을 dependency에 포함
  const personalRows = useMemo(() => loadIndex(personalKey), [personalKey, manageOpen, indexTick]);

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

    // ✅ 수동 태그는 개인 태그로 누적
    bumpIndex(personalKey, scope, t);
    refreshIndexView();

    const nextTags = [...tags, t];
    onChange(buildTagsText(nextTags));
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
      const nextTags = tags.slice(0, -1);
      onChange(buildTagsText(nextTags));
      return;
    }
  }

  function pickSuggestion(t: string) {
    commitTag(t);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* chips */}
      {tags.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                fontSize: 13,
              }}
              title="Backspace로 마지막 삭제"
            >
              #{t}
            </span>
          ))}
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
          placeholder={placeholder || "태그 입력 후 Enter 또는 ,"}
        />

        <div className="row" style={{ marginTop: 0 }}>
          <button type="button" className="btn" onClick={() => setManageOpen((v) => !v)}>
            개인 태그 관리
          </button>
        </div>
      </div>

      {/* suggestions dropdown */}
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
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pickSuggestion(t)}
              className="btn"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                borderRadius: 0,
                background: "transparent",
              }}
            >
              #{t}
            </button>
          ))}
        </div>
      ) : null}

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
                        refreshIndexView(); // ✅ 즉시 반영
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

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSuggestions,
  bumpSystemTag,
  bumpPersonalTag,
  listSystemTags,
  listPersonalTags,
  parseTagsText,
  buildTagsText,
  loadIndex,
  deleteFromIndex,
  getUserKey,
  PERSONAL_PREFIX,
  SYSTEM_KEY,
  normTag,
} from "../utils/tagIndex";

export { bumpSystemTag, bumpPersonalTag, listSystemTags, listPersonalTags };

type SuggestItem = { tag: string; source: "system" | "personal" };

type Props = {
  value: string;
  onChange: (next: string) => void;
  scope: string;
  placeholder?: string;
  userKey?: string;
  showChips?: boolean;
};

export default function TagInputText({ value, onChange, scope, placeholder, userKey, showChips = true }: Props) {
  const tags = useMemo(() => parseTagsText(value), [value]);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  
  // IME 조합 상태 (한글 입력 중 추천 유지용)
  const [isComposing, setIsComposing] = useState(false);
  const lastStableQueryRef = useRef("");

  const [manageOpen, setManageOpen] = useState(false);
  const [personalQuery, setPersonalQuery] = useState("");
  const [indexTick, setIndexTick] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const uKey = useMemo(() => getUserKey(userKey), [userKey]);
  const personalKey = useMemo(() => `${PERSONAL_PREFIX}${uKey}`, [uKey]);

  // IME 조합 중에는 마지막 안정 쿼리로 추천 유지
  const queryForSuggestions = isComposing ? lastStableQueryRef.current : input;

  const suggestions = useMemo(
    () => {
      const q = queryForSuggestions.trim();
      // 1글자부터 추천 표시
      if (!q) return [];
      return getSuggestions(SYSTEM_KEY, personalKey, scope, q);
    },
    [personalKey, scope, queryForSuggestions, indexTick]
  );

  const systemRows = useMemo(() => loadIndex(SYSTEM_KEY), [indexTick]);
  const personalRows = useMemo(() => loadIndex(personalKey), [personalKey, manageOpen, indexTick]);

  const systemSet = useMemo(() => new Set(systemRows.map((r) => r.tag)), [systemRows]);

  useEffect(() => {
    const trimmed = input.trim();
    setOpen(!!trimmed);
    // IME 조합 중이 아니면 마지막 안정 쿼리 업데이트
    if (!isComposing) {
      lastStableQueryRef.current = input;
    }
  }, [input, isComposing]);

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

    // 시스템 태그 판별: suggestions source 우선 > systemSet fallback
    // (추천에서 선택한 태그가 가장 정확하므로 source 우선 체크)
    const sug = suggestions.find((s) => s.tag === t);
    if (sug?.source === "system") {
      bumpSystemTag(scope, t);
    } else if (systemSet.has(t)) {
      bumpSystemTag(scope, t);
    } else {
      bumpPersonalTag(scope, t, userKey);
    }
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
      {/* chips with color + delete button (3/4 text + 1/4 trash) */}
      {showChips && tags.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {tags.map((t) => {
            const isSystem = systemSet.has(t);
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  overflow: "hidden",
                  background: isSystem ? "rgba(70,130,255,0.24)" : "rgba(255,255,255,0.06)",
                  border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
                  fontSize: 13,
                }}
                title={isSystem ? "기준 태그" : "개인 태그"}
              >
                <span style={{ padding: "6px 10px", flex: 3 }}>#{t}</span>
                <button
                  type="button"
                  onClick={() => onChange(buildTagsText(tags.filter((x) => x !== t)))}
                  style={{
                    border: "none",
                    background: "rgba(255,70,70,0.18)",
                    borderLeft: "1px solid rgba(255,70,70,0.25)",
                    padding: "6px 8px",
                    flex: 1,
                    minWidth: 32,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                  title="삭제"
                >
                  🗑
                </button>
              </div>
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
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => {
            setIsComposing(false);
            lastStableQueryRef.current = input;
          }}
          placeholder={placeholder || "태그 입력 후 Enter 또는 ,"}
        />

        <div className="row" style={{ marginTop: 0 }}>
          <button type="button" className="btn" onClick={() => setManageOpen((v) => !v)}>
            개인 태그 관리
          </button>
        </div>
      </div>

      {/* suggestions */}
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
            const display = (s.tag || "");
            const short = display.length > 12 ? display.slice(0, 11) + "…" : display;
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
                  gap: 8,
                  padding: "6px 8px",
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: isSystem ? "rgba(70,130,255,0.9)" : "rgba(255,255,255,0.65)",
                    display: "inline-block",
                    marginRight: 8,
                  }}
                />
                <span style={{ fontWeight: 800 }}>#{short}</span>
                <span style={{ opacity: 0.65, fontSize: 11, marginLeft: 8 }}>
                  {isSystem ? "기준" : "개인"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* personal manager */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>개인 태그(삭제 가능)</div>

            <input
              value={personalQuery}
              onChange={(e) => setPersonalQuery(e.target.value)}
              placeholder="검색…"
              style={{
                width: 220,
                maxWidth: "55vw",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.18)",
                color: "white",
                outline: "none",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
            {(() => {
              const q = (personalQuery || "").trim().toLowerCase();
              const rows = personalRows
                .slice()
                .filter((r) => !q || String(r.tag || "").toLowerCase().includes(q));
              return `표시 ${Math.min(rows.length, 200)} / 전체 ${personalRows.length}`;
            })()}
          </div>

          {personalRows.length === 0 ? (
            <div className="p" style={{ marginTop: 8, opacity: 0.75 }}>아직 없음</div>
          ) : (
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {(() => {
                const q = (personalQuery || "").trim().toLowerCase();
                const rows = personalRows
                  .slice()
                  .filter((r) => !q || String(r.tag || "").toLowerCase().includes(q))
                  .sort((a, b) => (b.total || 0) - (a.total || 0))
                  .slice(0, 200);

                if (rows.length === 0) {
                  return (
                    <div className="p" style={{ marginTop: 0, opacity: 0.75 }}>
                      검색 결과 없음
                    </div>
                  );
                }

                return rows.map((r) => (
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
                    <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        #{r.tag}
                      </div>
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
                ));
              })()}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

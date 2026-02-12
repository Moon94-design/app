import { useEffect, useMemo, useRef, useState } from "react";
import {
  PERSONAL_PREFIX,
  SYSTEM_KEY,
  buildTagsText,
  bumpPersonalTag,
  bumpSystemTag,
  getTagIndexUpdatedEventName,
  getSuggestions,
  getUserKey,
  loadIndex,
  normTag,
  parseTagsText,
} from "@kernel/utils";
import TagChips from "./TagChips";
import PersonalTagManager from "./PersonalTagManager";

type SuggestItem = { tag: string; source: "system" | "personal" };

type TagInputTextProps = {
  value: string;
  onChange: (next: string) => void;
  scope: string;
  placeholder?: string;
  userKey?: string;
  showChips?: boolean;
};

export default function TagInputText({
  value,
  onChange,
  scope,
  placeholder,
  userKey,
  showChips = true,
}: TagInputTextProps) {
  const tags = useMemo(() => parseTagsText(value), [value]);
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [compositionQuery, setCompositionQuery] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [personalQuery, setPersonalQuery] = useState("");
  const [, setIndexTick] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uKey = useMemo(() => getUserKey(userKey), [userKey]);
  const personalKey = useMemo(() => `${PERSONAL_PREFIX}${uKey}`, [uKey]);
  const queryForSuggestions = isComposing ? compositionQuery : input;
  const open = input.trim().length > 0;

  const suggestions = (() => {
    const q = queryForSuggestions.trim();
    if (!q) return [];
    return getSuggestions(SYSTEM_KEY, personalKey, scope, q);
  })();

  const systemRows = loadIndex(SYSTEM_KEY);
  const personalRows = loadIndex(personalKey);
  const systemSet = useMemo(() => new Set(systemRows.map((row) => row.tag)), [systemRows]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eventName = getTagIndexUpdatedEventName();
    const handler = () => setIndexTick((v) => v + 1);
    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);

  function refreshIndexView() {
    setIndexTick((v) => v + 1);
  }

  function commitTag(raw: string) {
    const t = normTag(raw);
    if (!t) return;

    if (tags.includes(t)) {
      setInput("");
      return;
    }

    const sug = suggestions.find((item) => item.tag === t);
    if (sug?.source === "system" || systemSet.has(t)) {
      bumpSystemTag(scope, t);
    } else {
      bumpPersonalTag(scope, t, userKey);
    }

    refreshIndexView();
    onChange(buildTagsText([...tags, t]));
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag(input);
      return;
    }
    if (e.key === "Backspace" && !input) {
      if (!tags.length) return;
      onChange(buildTagsText(tags.slice(0, -1)));
    }
  }

  function pickSuggestion(s: SuggestItem) {
    commitTag(s.tag);
    inputRef.current?.focus();
  }

  return (
    <div>
      {showChips ? (
        <TagChips
          tags={tags}
          systemSet={systemSet}
          onRemove={(tag) => onChange(buildTagsText(tags.filter((item) => item !== tag)))}
        />
      ) : null}

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => {
            setCompositionQuery(input);
            setIsComposing(true);
          }}
          onCompositionEnd={() => {
            setIsComposing(false);
            setCompositionQuery("");
          }}
          placeholder={placeholder || "태그 입력 후 Enter 또는 ,"}
        />

        <div className="row" style={{ marginTop: 0 }}>
          <button type="button" className="btn" onClick={() => setManageOpen((v) => !v)}>
            개인 태그 관리
          </button>
        </div>
      </div>

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
            const short = s.tag.length > 12 ? `${s.tag.slice(0, 11)}...` : s.tag;
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
                <span style={{ opacity: 0.65, fontSize: 11, marginLeft: 8 }}>{isSystem ? "기준" : "개인"}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <PersonalTagManager
        manageOpen={manageOpen}
        personalQuery={personalQuery}
        onChangePersonalQuery={setPersonalQuery}
        personalRows={personalRows}
        personalKey={personalKey}
        refreshIndexView={refreshIndexView}
      />
    </div>
  );
}

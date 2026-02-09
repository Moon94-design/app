/**
 * TagBlock — 태그 입력 + 추천 통합 블록 (SSOT 정본)
 * 
 * 역할:
 * - 태그 입력 (TagInputText 기반)
 * - 내용 기반 추천 UI (전체 포함 + suffix 보조, dismiss, 더보기)
 * - 기준(파란)/개인(회색) 색상 구분
 * - 개인 태그 삭제 관리
 * 
 * 사용처: Production/Issue/Action 페이지
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { 
  TagInputText, 
  listSystemTags, 
  listPersonalTags,
  bumpSystemTag,
  bumpPersonalTag
} from "../../index";

type Sug = { tag: string; source: "system" | "personal" };

export type TagBlockProps = {
  scope: string;
  tagsText: string;
  onChangeTagsText: (next: string) => void;
  detailsText?: string; // 내용 기반 추천용 (없으면 추천 UI 숨김)
  candidates?: Sug[]; // 외부에서 후보 제공 가능 (없으면 내부에서 system/personal로 구성)
  placeholder?: string;
  userKey?: string;
  showChips?: boolean;
  onAfterAdd?: () => void; // 추천 태그 추가 후 콜백 (포커스 복귀용)
};

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

function lastToken(text: string) {
  const t = (text || "").replace(/\s+/g, " ");
  const m = t.match(/([0-9A-Za-z가-힣-]{1,})\s*$/);
  return m ? m[1] : "";
}

export default function TagBlock({
  scope,
  tagsText,
  onChangeTagsText,
  detailsText,
  candidates,
  placeholder,
  userKey,
  showChips = true,
  onAfterAdd,
}: TagBlockProps) {
  // 기본 후보: system/personal 태그만
  const defaultCandidates = useMemo(() => {
    const systemTags = listSystemTags().filter((t) => t.trim().length >= 2);
    const personalTags = listPersonalTags(userKey).filter((t) => t.trim().length >= 2);
    
    const out: Sug[] = [];
    const seen = new Set<string>();
    
    for (const t of personalTags) {
      if (!seen.has(t)) {
        out.push({ tag: t, source: "personal" });
        seen.add(t);
      }
    }
    for (const t of systemTags) {
      if (!seen.has(t)) {
        out.push({ tag: t, source: "system" });
        seen.add(t);
      }
    }
    
    return out;
  }, [userKey]);

  const finalCandidates = candidates || defaultCandidates;

  const selectedTags = useMemo(() => {
    const set = new Set<string>();
    (tagsText || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((t) => set.add(t.startsWith("#") ? t.slice(1).trim() : t));
    return set;
  }, [tagsText]);

  // 내용 기반 추천 (detailsText가 있을 때만)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);

  const currentToken = useMemo(() => {
    if (!detailsText) return "";
    return lastToken(detailsText);
  }, [detailsText]);

  // 글 길이 감소 시 dismissed/showAll 초기화
  const prevLenRef = useRef<number>((detailsText || "").length);
  useEffect(() => {
    const len = (detailsText || "").length;
    if (len < prevLenRef.current) {
      setDismissed(new Set());
      setShowAll(false);
    }
    prevLenRef.current = len;
  }, [detailsText]);

  // typing 추천: 1글자부터, prefix/contains/suffix 매칭
  function typingSuggestions(tokenRaw: string): Sug[] {
    const token = (tokenRaw || "").trim();
    if (!token) return [];

    const q = token.toLowerCase();
    const qLoose = normLoose(token);

    const grams3: string[] = [];
    if (qLoose.length >= 3) {
      for (let i = 0; i <= qLoose.length - 3; i++) grams3.push(qLoose.slice(i, i + 3));
    }

    const scored: Array<{ s: Sug; score: number; len: number }> = [];

    for (const c of finalCandidates) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (selectedTags.has(tag)) continue;
      if (dismissed.has(tag)) continue;

      const a = tag.toLowerCase();
      const aLoose = normLoose(tag);

      let score = 0;

      if (a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose))) score += 40;
      if (a.includes(q) || (qLoose && aLoose.includes(qLoose))) score += 20;
      if (a.endsWith(q) || (qLoose && aLoose.endsWith(qLoose))) score += 25;

      if (score === 0 && grams3.length) {
        const hit3 = grams3.some((g) => aLoose.includes(g));
        if (hit3) score += 10;
      }

      if (score === 0) continue;

      scored.push({ s: c, score, len: tag.length });
    }

    scored.sort((x, y) => y.score - x.score || y.len - x.len);
    return scored.slice(0, 30).map((x) => x.s);
  }

  const allSug = useMemo(
    () => typingSuggestions(currentToken),
    [currentToken, finalCandidates, selectedTags, dismissed]
  );

  const visibleSug = useMemo(() => {
    if (showAll) return allSug;
    return allSug.slice(0, 5);
  }, [allSug, showAll]);

  function addTag(tag: string) {
    const existing = (tagsText || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (existing.includes(tag)) return;
    
    const next = [...existing, tag].join(", ");
    onChangeTagsText(next);
    
    // bump index
    const sug = finalCandidates.find((c) => c.tag === tag);
    if (sug?.source === "system") {
      bumpSystemTag(scope, tag);
    } else if (sug?.source === "personal") {
      bumpPersonalTag(scope, tag, userKey);
    }
    
    // 태그 추가 후 포커스 복귀 콜백
    if (onAfterAdd) {
      onAfterAdd();
    }
  }

  function dismissTag(tag: string) {
    setDismissed((prev) => new Set(prev).add(tag));
  }

  // 추천 UI (detailsText가 있고 추천이 있을 때만 표시)
  const showSuggestions = !!detailsText && visibleSug.length > 0;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {/* 태그 입력 */}
      <TagInputText
        value={tagsText}
        onChange={onChangeTagsText}
        scope={scope}
        placeholder={placeholder}
        userKey={userKey}
        showChips={showChips}
      />

      {/* 내용 기반 추천 UI (다크 테마) */}
      {showSuggestions && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "110px 1fr", 
          gap: 10, 
          alignItems: "start" 
        }}>
          <div className="p" style={{ marginTop: 0 }}>추천 태그</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {visibleSug.map((s) => {
              const isSystem = s.source === "system";
              return (
                <div
                  key={`${s.source}:${s.tag}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    overflow: "hidden",
                    border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
                    background: isSystem ? "rgba(70,130,255,0.20)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    style={{
                      borderRadius: 0,
                      background: "transparent",
                      padding: "6px 10px",
                      flex: 3,
                      textAlign: "left",
                      fontSize: 13,
                    }}
                    onClick={() => addTag(s.tag)}
                  >
                    #{s.tag}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    style={{
                      borderRadius: 0,
                      background: "rgba(255,70,70,0.18)",
                      borderLeft: "1px solid rgba(255,70,70,0.25)",
                      padding: "6px 8px",
                      flex: 1,
                      minWidth: 38,
                      fontSize: 13,
                    }}
                    title="추천에서 제외"
                    onClick={() => dismissTag(s.tag)}
                  >
                    🗑
                  </button>
                </div>
              );
            })}

            {allSug.length > 5 ? (
              <button type="button" className="btn" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "접기" : `더보기(${allSug.length})`}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

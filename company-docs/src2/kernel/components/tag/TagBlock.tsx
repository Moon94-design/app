import TagInputText from "./TagInputText";
import { bumpPersonalTag, bumpSystemTag, parseTagsText } from "@kernel/utils";
import { useTagBlockSuggestions } from "./hooks/useTagBlockSuggestions";

export type SuggestCandidate = { tag: string; source: "system" | "personal" };

export type TagBlockProps = {
  scope: string;
  tagsText: string;
  onChangeTagsText: (next: string) => void;
  detailsText?: string;
  candidates?: SuggestCandidate[];
  placeholder?: string;
  userKey?: string;
  showChips?: boolean;
  onAfterAdd?: () => void;
};

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
  const {
    finalCandidates,
    currentTokens,
    allSuggestions,
    visibleSuggestions,
    showAll,
    setShowAll,
    dismissTag,
  } = useTagBlockSuggestions({
    tagsText,
    detailsText,
    candidates,
    userKey,
  });

  function addTag(tag: string) {
    const existing = parseTagsText(tagsText);
    if (existing.includes(tag)) return;

    onChangeTagsText([...existing, tag].join(", "));

    const sug = finalCandidates.find((c) => c.tag === tag);
    if (sug?.source === "system") bumpSystemTag(scope, tag);
    if (sug?.source === "personal") bumpPersonalTag(scope, tag, userKey);
    if (onAfterAdd) onAfterAdd();
  }

  const showSuggestions = Boolean(currentTokens.length > 0 && visibleSuggestions.length > 0);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TagInputText
        value={tagsText}
        onChange={onChangeTagsText}
        scope={scope}
        placeholder={placeholder}
        userKey={userKey}
        showChips={showChips}
      />

      {showSuggestions ? (
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>
            추천 태그
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {visibleSuggestions.map((s) => {
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
                      minWidth: 38,
                      fontSize: 13,
                    }}
                    title="추천에서 제외"
                    onClick={() => dismissTag(s.tag)}
                  >
                    X
                  </button>
                </div>
              );
            })}

            {allSuggestions.length > 5 ? (
              <button type="button" className="btn" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "접기" : `더보기(${allSuggestions.length})`}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

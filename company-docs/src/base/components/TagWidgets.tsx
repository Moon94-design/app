export { default as usePreserveSelection } from "../hooks/usePreserveSelection";

type Sug = { tag: string; source: "system" | "personal" };

export function truncate(s: string, n = 12) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function SuggestionItem({
  s,
  onApply,
  onDismiss,
  compact = true,
}: {
  s: Sug;
  onApply: (s: Sug) => void;
  onDismiss: (tag: string) => void;
  compact?: boolean;
}) {
  const isSystem = s.source === "system";
  const padV = compact ? "6px" : "8px";
  const padH = compact ? "8px" : "10px";
  return (
    <div
      key={`${s.source}:${s.tag}`}
      style={{
        display: "flex",
        alignItems: "center",
        borderRadius: 999,
        overflow: "hidden",
        border: isSystem ? "1px solid rgba(70,130,255,0.55)" : "1px solid rgba(255,255,255,0.08)",
        background: isSystem ? "rgba(70,130,255,0.12)" : "rgba(255,255,255,0.04)",
        fontSize: compact ? 12 : 13,
      }}
    >
      <button
        type="button"
        className="btn"
        onClick={() => onApply(s)}
        style={{
          borderRadius: 0,
          background: "transparent",
          padding: `${padV} ${padH}`,
          flex: 3,
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 9,
            height: 9,
            borderRadius: 999,
            marginRight: 8,
            verticalAlign: "middle",
            background: isSystem ? "rgba(70,130,255,0.9)" : "rgba(255,255,255,0.65)",
          }}
        />
        <span style={{ fontWeight: 800 }}>#{truncate(s.tag, compact ? 12 : 18)}</span>
      </button>

      <button
        type="button"
        className="btn"
        onClick={() => onDismiss(s.tag)}
        title="삭제"
        style={{
          borderRadius: 0,
          background: "rgba(255,70,70,0.14)",
          borderLeft: "1px solid rgba(255,70,70,0.22)",
          padding: `${padV} ${padH}`,
          flex: 1,
          minWidth: 40,
        }}
      >
        🗑
      </button>
    </div>
  );
}

export function ConfirmedTagChips({
  tagsText,
  onRemove,
  compact = true,
  getTone,
}: {
  tagsText: string;
  onRemove: (tag: string) => void;
  compact?: boolean;
  getTone?: (tag: string) => "system" | "personal";
}) {
  const tags = (tagsText || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!tags.length) return null;
  const padV = compact ? "6px" : "8px";
  const padH = compact ? "8px" : "10px";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
      {tags.map((t) => {
        const tone = getTone ? getTone(t) : "personal";
        const isSystem = tone === "system";
        return (
          <div
            key={t}
            style={{
              display: "flex",
              borderRadius: 999,
              overflow: "hidden",
              border: isSystem ? "1px solid rgba(70,130,255,0.55)" : "1px solid rgba(255,255,255,0.12)",
              background: isSystem ? "rgba(70,130,255,0.12)" : "rgba(255,255,255,0.04)",
              fontSize: compact ? 12 : 13,
            }}
          >
            <div style={{ padding: `${padV} ${padH}`, flex: 3, minWidth: 0, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 800 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  marginRight: 8,
                  verticalAlign: "middle",
                  background: isSystem ? "rgba(70,130,255,0.9)" : "rgba(160,160,160,0.9)",
                }}
              />
              #{truncate(t, compact ? 14 : 20)}
            </div>
            <button type="button" className="btn" style={{ padding: `${padV} ${padH}`, flex: 1, minWidth: 40, background: "rgba(255,70,70,0.14)", borderLeft: "1px solid rgba(255,70,70,0.22)" }} title="삭제" onClick={() => onRemove(t)}>🗑</button>
          </div>
        );
      })}
    </div>
  );
}


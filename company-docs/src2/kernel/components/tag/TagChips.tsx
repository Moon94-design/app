type TagChipsProps = {
  tags: string[];
  systemSet: Set<string>;
  onRemove: (tag: string) => void;
};

export default function TagChips({ tags, systemSet, onRemove }: TagChipsProps) {
  if (!tags.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
      {tags.map((tag) => {
        const isSystem = systemSet.has(tag);
        return (
          <div
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              overflow: "hidden",
              background: isSystem ? "rgba(70,130,255,0.24)" : "rgba(255,255,255,0.06)",
              border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ padding: "6px 10px" }}>#{tag}</span>
            <button
              type="button"
              onClick={() => onRemove(tag)}
              style={{
                border: "none",
                background: "rgba(255,70,70,0.18)",
                borderLeft: "1px solid rgba(255,70,70,0.25)",
                padding: "6px 8px",
                minWidth: 30,
                cursor: "pointer",
                fontSize: 13,
              }}
              title="삭제"
            >
              X
            </button>
          </div>
        );
      })}
    </div>
  );
}


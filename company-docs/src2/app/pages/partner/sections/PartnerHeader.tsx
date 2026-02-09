type PartnerHeaderProps = {
  mode: "create" | "edit";
  completed: boolean;
  onReset: () => void;
};

export default function PartnerHeader({ mode, completed, onReset }: PartnerHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <h2 style={{ margin: 0 }}>
        거래처 {mode === "edit" ? "수정" : "등록"}
      </h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {mode === "edit" ? (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 900,
              background: completed ? "#339af0" : "#ff6b6b",
              color: "#fff",
            }}
          >
            {completed ? "✅ 완료" : "⚠️ 미완료"}
          </span>
        ) : null}
        <button type="button" className="btn" onClick={onReset}>
          초기화
        </button>
      </div>
    </div>
  );
}

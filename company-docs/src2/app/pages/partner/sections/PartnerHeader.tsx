type PartnerHeaderProps = {
  mode: "create" | "edit";
  completed: boolean;
  onReset: () => void;
};

export default function PartnerHeader({ mode, completed, onReset }: PartnerHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <h1 className="h1" style={{ margin: 0 }}>
        거래처 {mode === "edit" ? "수정" : "등록"}
      </h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {mode === "edit" ? (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 900,
              background: completed ? "#4c6ef5" : "#e03131",
              color: "#fff",
            }}
          >
            {completed ? "완료" : "미완료"}
          </span>
        ) : null}
        <button type="button" className="btn" onClick={onReset}>
          초기화
        </button>
      </div>
    </div>
  );
}

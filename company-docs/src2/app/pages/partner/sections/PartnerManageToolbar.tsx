type PartnerManageToolbarProps = {
  filter: "all" | "incomplete" | "pending" | "complete";
  counts: {
    all: number;
    incomplete: number;
    pending: number;
    complete: number;
  };
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: "all" | "incomplete" | "pending" | "complete") => void;
  bulkMode: boolean;
  onToggleBulkMode: () => void;
};

export default function PartnerManageToolbar({
  filter,
  counts,
  searchQuery,
  onSearchChange,
  onFilterChange,
  bulkMode,
  onToggleBulkMode,
}: PartnerManageToolbarProps) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className={`btn ${filter === "all" ? "primary" : ""}`} onClick={() => onFilterChange("all")}>
          전체 ({counts.all})
        </button>
        <button
          className={`btn ${filter === "incomplete" ? "primary" : ""}`}
          onClick={() => onFilterChange("incomplete")}
        >
          미완료 ({counts.incomplete})
        </button>
        <button className={`btn ${filter === "pending" ? "primary" : ""}`} onClick={() => onFilterChange("pending")}>
          보류 ({counts.pending})
        </button>
        <button
          className={`btn ${filter === "complete" ? "primary" : ""}`}
          onClick={() => onFilterChange("complete")}
        >
          완료 ({counts.complete})
        </button>
        <button className={`btn ${bulkMode ? "primary" : ""}`} onClick={onToggleBulkMode}>
          {bulkMode ? "일괄 수정 종료" : "일괄 수정"}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="거래처명 검색"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

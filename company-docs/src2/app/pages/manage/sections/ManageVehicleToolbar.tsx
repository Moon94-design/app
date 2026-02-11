type VehicleFilter = "all" | "incomplete" | "pending" | "complete";

type ManageVehicleToolbarProps = {
  filter: VehicleFilter;
  counts: {
    total: number;
    incomplete: number;
    pending: number;
    complete: number;
  };
  onChangeFilter: (next: VehicleFilter) => void;
};

export default function ManageVehicleToolbar({
  filter,
  counts,
  onChangeFilter,
}: ManageVehicleToolbarProps) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
      <button
        className={`btn ${filter === "all" ? "primary" : ""}`}
        onClick={() => onChangeFilter("all")}
      >
        전체 ({counts.total})
      </button>
      <button
        className={`btn ${filter === "incomplete" ? "primary" : ""}`}
        onClick={() => onChangeFilter("incomplete")}
      >
        미입력 ({counts.incomplete})
      </button>
      <button
        className={`btn ${filter === "pending" ? "primary" : ""}`}
        onClick={() => onChangeFilter("pending")}
      >
        보류 ({counts.pending})
      </button>
      <button
        className={`btn ${filter === "complete" ? "primary" : ""}`}
        onClick={() => onChangeFilter("complete")}
      >
        완료 ({counts.complete})
      </button>
    </div>
  );
}

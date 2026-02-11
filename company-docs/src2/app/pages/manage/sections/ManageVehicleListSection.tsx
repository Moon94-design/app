import {
  isVehicleComplete,
  isVehiclePending,
  type Vehicle,
} from "@kernel/schema/vehicle";

type ManageVehicleListSectionProps = {
  vehicles: Vehicle[];
  onEdit: (id: string) => void;
  onPending: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

export default function ManageVehicleListSection({
  vehicles,
  onEdit,
  onPending,
  onDelete,
}: ManageVehicleListSectionProps) {
  if (vehicles.length === 0) {
    return <p className="p">항목이 없습니다.</p>;
  }

  return (
    <>
      {vehicles.map((vehicle) => {
        const pending = isVehiclePending(vehicle);
        const complete = isVehicleComplete(vehicle);
        const statusLabel = complete ? "완료" : pending ? "보류" : "미입력";
        const statusBg = complete ? "#1976d2" : pending ? "#ff9800" : "#d32f2f";

        return (
          <div
            key={vehicle.id}
            className="card"
            style={{
              marginTop: 10,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, display: "flex", gap: 8, alignItems: "center" }}>
                  {vehicle.vehicleNo}
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: statusBg,
                      color: "white",
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="p" style={{ marginTop: 6, fontSize: 12 }}>
                  {vehicle.tonClass || "-"} | {vehicle.bodyType || "-"} |{" "}
                  {vehicle.carrierName || "-"} | {vehicle.driverName || "-"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn"
                  onClick={() => onEdit(vehicle.id)}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  수정
                </button>
                {!pending && (
                  <button
                    className="btn"
                    onClick={() => onPending(vehicle)}
                    style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,152,0,0.2)" }}
                  >
                    보류
                  </button>
                )}
                <button
                  className="btn"
                  onClick={() => onDelete(vehicle)}
                  style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,100,100,0.2)" }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

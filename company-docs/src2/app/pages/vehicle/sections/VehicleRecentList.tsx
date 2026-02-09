import type { Vehicle } from "@kernel/schema/vehicle";

type Props = {
  vehicles: Vehicle[];
  onRemove: (id: string) => void;
};

export default function VehicleRecentList({ vehicles, onRemove }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 차량 ({vehicles.length}건)
      </div>

      {vehicles.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        vehicles.map((v) => (
          <div
            key={v.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{v.vehicleNo}</div>
                <div className="p" style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                  {v.tonClass || "미완성"} / {v.bodyType || "미완성"}
                  {v.carrierName && ` / ${v.carrierName}`}
                </div>
                {v.driverName && (
                  <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                    기사: {v.driverName}
                  </div>
                )}
                {v.driverPhone && (
                  <div className="p" style={{ marginTop: 2, fontSize: 13 }}>
                    연락처: {v.driverPhone}
                  </div>
                )}
              </div>
              <button type="button" className="btn danger" onClick={() => onRemove(v.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

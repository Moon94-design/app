import type { Consumable } from "@kernel/schema/equipment";

type Props = {
  consumables: Consumable[];
  onRemove: (id: string) => void;
};

export default function ConsumableRecentList({ consumables, onRemove }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 소모품
      </div>

      {consumables.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        consumables.map((consumable) => (
          <div
            key={consumable.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ fontWeight: 900 }}>{consumable.name}</div>
            <div className="p" style={{ marginTop: 6 }}>
              설비: {consumable.equipmentName || "-"} · 최소보유: {consumable.minStock}
            </div>
            {consumable.vendorName ? (
              <div className="p" style={{ marginTop: 6 }}>
                업체: {consumable.vendorName}
              </div>
            ) : null}
            <div className="row">
              <button type="button" className="btn danger" onClick={() => onRemove(consumable.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

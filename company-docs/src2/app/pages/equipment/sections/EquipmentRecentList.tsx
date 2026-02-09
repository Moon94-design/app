import type { Equipment } from "@kernel/schema/equipment";

type Props = {
  equipments: Equipment[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
};

export default function EquipmentRecentList({ equipments, onRemove, onSelect }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 설비
      </div>

      {equipments.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        equipments.map((equipment) => (
          <div
            key={equipment.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{equipment.name}</div>
                <div className="p" style={{ marginTop: 6 }}>
                  {equipment.location} · {equipment.equipType} · {equipment.importance}
                </div>
                <div className="p" style={{ marginTop: 6 }}>
                  소모품: {(equipment.consumableIds || []).length}개
                </div>
              </div>
              <button type="button" className="btn danger" onClick={() => onRemove(equipment.id)}>
                삭제
              </button>
            </div>

            <div className="row">
              <button type="button" className="btn" onClick={() => onSelect(equipment.id)}>
                이 설비로 소모품 추가
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

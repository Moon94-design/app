import type { Equipment } from "@kernel/schema/equipment";

type ManageEquipmentListSectionProps = {
  equipments: Equipment[];
  onEdit: (id: string) => void;
  onDelete: (equipment: Equipment) => void;
};

export default function ManageEquipmentListSection({
  equipments,
  onEdit,
  onDelete,
}: ManageEquipmentListSectionProps) {
  if (equipments.length === 0) {
    return <p className="p">설비 데이터가 없습니다.</p>;
  }

  return (
    <>
      {equipments.map((equipment) => (
        <div key={equipment.id} className="card manage-card manage-list-card">
          <div className="manage-list-row">
            <div>
              <div className="manage-list-title">{equipment.name}</div>
              <div className="p manage-list-meta">
                {equipment.location || "-"} | {equipment.equipType} | 중요도 {equipment.importance}
              </div>
              <div className="p manage-list-meta">
                점검: {equipment.inspectCycle} {equipment.inspectNote ? `(${equipment.inspectNote})` : ""}
              </div>
              <div className="p manage-list-meta">
                소모품 연결: {(equipment.consumableIds || []).length}개
              </div>
            </div>
            <div className="manage-action-group">
              <button type="button" className="btn manage-action-btn" onClick={() => onEdit(equipment.id)}>
                수정
              </button>
              <button
                type="button"
                className="btn manage-action-btn manage-action-btn--danger"
                onClick={() => onDelete(equipment)}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

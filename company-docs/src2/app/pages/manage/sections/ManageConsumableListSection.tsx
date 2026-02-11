import type { Consumable } from "@kernel/schema/equipment";

type ManageConsumableListSectionProps = {
  consumables: Consumable[];
  onEdit: (id: string) => void;
  onDelete: (consumable: Consumable) => void;
};

export default function ManageConsumableListSection({
  consumables,
  onEdit,
  onDelete,
}: ManageConsumableListSectionProps) {
  if (consumables.length === 0) {
    return <p className="p">소모품 데이터가 없습니다.</p>;
  }

  return (
    <>
      {consumables.map((consumable) => (
        <div key={consumable.id} className="card manage-card manage-list-card">
          <div className="manage-list-row">
            <div>
              <div className="manage-list-title">{consumable.name}</div>
              <div className="p manage-list-meta">
                설비: {consumable.equipmentName || "-"} | 규격: {consumable.spec || "-"}
              </div>
              <div className="p manage-list-meta">
                교체 기준: {consumable.replaceRule || "-"} | 최소 재고: {consumable.minStock}
              </div>
              <div className="p manage-list-meta">
                서비스 업체: {consumable.vendorName || "-"}
              </div>
            </div>
            <div className="manage-action-group">
              <button type="button" className="btn manage-action-btn" onClick={() => onEdit(consumable.id)}>
                수정
              </button>
              <button
                type="button"
                className="btn manage-action-btn manage-action-btn--danger"
                onClick={() => onDelete(consumable)}
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

import { Link } from "react-router-dom";
import EquipmentConsumableSection from "./sections/EquipmentConsumableSection";
import EquipmentFormSection from "./sections/EquipmentFormSection";
import EquipmentRecentList from "./sections/EquipmentRecentList";
import { useEquipmentRegisterPage } from "./hooks/useEquipmentRegisterPage";

export default function EquipmentRegisterPage() {
  const {
    draft,
    equipments,
    vendors,
    activeEquipment,
    activeConsumables,
    updateDraft,
    resetDraft,
    submitEquipment,
    removeEquipment,
    selectEquipment,
    addConsumableFromEquipment,
  } = useEquipmentRegisterPage();

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          설비 등록
        </h1>
        <button type="button" className="btn" onClick={resetDraft}>
          초기화
        </button>
      </div>

      <EquipmentFormSection draft={draft} onChange={updateDraft} />

      <div className="row">
        <button type="button" className="btn primary" onClick={submitEquipment}>
          설비 저장(로컬)
        </button>
      </div>

      <div className="divider" />

      <EquipmentConsumableSection
        draft={draft}
        vendors={vendors}
        activeEquipment={activeEquipment}
        activeConsumables={activeConsumables}
        onChange={updateDraft}
        onSubmit={addConsumableFromEquipment}
      />

      <div className="divider" />

      <EquipmentRecentList
        equipments={equipments}
        onRemove={removeEquipment}
        onSelect={selectEquipment}
      />

      <div className="divider" />
      <div className="row">
        <Link className="btn" to="/register/master/consumable">
          소모품 등록으로 이동
        </Link>
      </div>
    </div>
  );
}

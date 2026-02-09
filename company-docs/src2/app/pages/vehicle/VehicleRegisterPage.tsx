import VehicleFormSection from "./sections/VehicleFormSection";
import VehicleRecentList from "./sections/VehicleRecentList";
import { useVehicleRegisterPage } from "./hooks/useVehicleRegisterPage";

export default function VehicleRegisterPage() {
  const { draft, vehicles, updateDraft, onChangePhone, submit, resetDraft, remove } =
    useVehicleRegisterPage();

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          차량 등록
        </h1>
        <button type="button" className="btn" onClick={resetDraft}>
          초기화
        </button>
      </div>

      <VehicleFormSection
        draft={draft}
        onChange={updateDraft}
        onChangePhone={onChangePhone}
        onSubmit={submit}
      />

      <div className="divider" />

      <VehicleRecentList vehicles={vehicles} onRemove={remove} />
    </div>
  );
}

import { MasterFormHeader } from "@kernel/components/master";
import VehicleFormSection from "./sections/VehicleFormSection";
import VehicleRecentList from "./sections/VehicleRecentList";
import { useVehicleRegisterPage } from "./hooks/useVehicleRegisterPage";

export default function VehicleRegisterPage() {
  const { draft, vehicles, updateDraft, onChangePhone, submit, resetDraft, remove } =
    useVehicleRegisterPage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="차량 등록" onReset={resetDraft} />
      <div className="divider" />

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


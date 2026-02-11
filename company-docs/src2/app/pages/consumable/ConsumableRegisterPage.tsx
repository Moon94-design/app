import { MasterFormHeader } from "@kernel/components/master";
import ConsumableFormSection from "./sections/ConsumableFormSection";
import ConsumableRecentList from "./sections/ConsumableRecentList";
import { useConsumableRegisterPage } from "./hooks/useConsumableRegisterPage";

export default function ConsumableRegisterPage() {
  const { draft, equipments, vendors, consumables, updateDraft, resetDraft, submit, remove } =
    useConsumableRegisterPage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="소모품 등록" onReset={resetDraft} />
      <div className="divider" />

      <ConsumableFormSection draft={draft} equipments={equipments} vendors={vendors} onChange={updateDraft} />

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장(로컬)
        </button>
      </div>

      <div className="divider" />

      <ConsumableRecentList consumables={consumables} onRemove={remove} />
    </div>
  );
}


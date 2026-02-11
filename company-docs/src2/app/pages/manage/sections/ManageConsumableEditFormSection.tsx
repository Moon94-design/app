import ConsumableFormSection from "@app2/pages/consumable/sections/ConsumableFormSection";
import type { ConsumableDraft } from "@kernel/schema/consumable";
import type { Equipment } from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

type ManageConsumableEditFormSectionProps = {
  draft: ConsumableDraft;
  equipments: Equipment[];
  vendors: Vendor[];
  onChange: (patch: Partial<ConsumableDraft>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onReset: () => void;
};

export default function ManageConsumableEditFormSection({
  draft,
  equipments,
  vendors,
  onChange,
  onSave,
  onCancel,
  onReset,
}: ManageConsumableEditFormSectionProps) {
  return (
    <>
      <ConsumableFormSection
        draft={draft}
        equipments={equipments}
        vendors={vendors}
        onChange={onChange}
      />

      <div className="manage-edit-actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            onSave();
          }}
        >
          저장
        </button>
        <button type="button" className="btn" onClick={onReset}>
          초기화
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </>
  );
}

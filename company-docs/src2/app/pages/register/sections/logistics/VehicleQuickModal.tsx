import type { Dispatch, SetStateAction } from "react";
import type { VehicleDraft } from "@kernel/schema/vehicle";
import { formatPhoneInput } from "@kernel/utils";
import VehicleFormSection from "@app2/pages/vehicle/sections/VehicleFormSection";
import LayerModal from "./LayerModal";

type VehicleQuickModalProps = {
  open: boolean;
  onClose: () => void;
  draft: VehicleDraft;
  setDraft: Dispatch<SetStateAction<VehicleDraft>>;
  onSave: () => void;
};

export default function VehicleQuickModal({ open, onClose, draft, setDraft, onSave }: VehicleQuickModalProps) {
  if (!open) return null;

  return (
    <LayerModal title="차량 기준정보 빠른 추가" onClose={onClose}>
      <VehicleFormSection
        draft={draft}
        onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
        onChangePhone={(raw) => setDraft((prev) => ({ ...prev, driverPhone: formatPhoneInput(raw) }))}
        onSubmit={onSave}
      />
    </LayerModal>
  );
}

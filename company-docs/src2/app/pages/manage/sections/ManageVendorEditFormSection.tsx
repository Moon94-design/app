import VendorContactsSection from "@app2/pages/vendor/sections/VendorContactsSection";
import VendorFormSection from "@app2/pages/vendor/sections/VendorFormSection";
import type { VendorDraft } from "@kernel/schema/vendor";

type ManageVendorEditFormSectionProps = {
  draft: VendorDraft;
  onChange: (patch: Partial<VendorDraft>) => void;
  onToggleScope: (scope: import("@kernel/schema/vendor").VendorScope) => void;
  onAddContact: () => void;
  onRemoveContact: (id: string) => void;
  onUpdateContact: (id: string, patch: Partial<import("@kernel/schema/vendor").VendorContact>) => void;
  onUpdateContactPhone: (id: string, raw: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
};

export default function ManageVendorEditFormSection({
  draft,
  onChange,
  onToggleScope,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
  onUpdateContactPhone,
  onSave,
  onCancel,
}: ManageVendorEditFormSectionProps) {
  return (
    <>
      <VendorFormSection draft={draft} onChange={onChange} onToggleScope={onToggleScope} />

      <div className="divider" />

      <VendorContactsSection
        contacts={draft.contacts}
        onAdd={onAddContact}
        onRemove={onRemoveContact}
        onUpdate={onUpdateContact}
        onUpdatePhone={onUpdateContactPhone}
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
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </>
  );
}

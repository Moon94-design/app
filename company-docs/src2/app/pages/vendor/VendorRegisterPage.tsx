import { MasterFormHeader } from "@kernel/components/master";
import { StatusBadge } from "@kernel/components/status";
import { getVendorStatusBadge, resolveVendorStatus } from "@kernel/schema/vendor";
import VendorContactsSection from "./sections/VendorContactsSection";
import VendorFormSection from "./sections/VendorFormSection";
import VendorRecentList from "./sections/VendorRecentList";
import { useVendorRegisterPage } from "./hooks/useVendorRegisterPage";

export default function VendorRegisterPage() {
  const {
    draft,
    vendors,
    updateDraft,
    toggleScope,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    resetDraft,
    submit,
    removeVendor,
  } = useVendorRegisterPage();
  const status = resolveVendorStatus(draft.status);
  const statusBadge = getVendorStatusBadge(status);

  return (
    <div className="card menu-page">
      <MasterFormHeader
        title="서비스 업체 등록"
        onReset={resetDraft}
        rightSlot={<StatusBadge label={statusBadge.label} tone={statusBadge.tone} />}
      />
      <div className="divider" />

      <VendorFormSection draft={draft} onChange={updateDraft} onToggleScope={toggleScope} />

      <div className="divider" />

      <VendorContactsSection
        contacts={draft.contacts}
        onAdd={addContact}
        onRemove={removeContact}
        onUpdate={updateContact}
        onUpdatePhone={updateContactPhone}
      />

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장(로컬)
        </button>
      </div>

      <div className="divider" />

      <VendorRecentList vendors={vendors} onRemove={removeVendor} />
    </div>
  );
}


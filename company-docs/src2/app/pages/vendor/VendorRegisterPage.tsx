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

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          정비/서비스 업체 등록
        </h1>
        <button type="button" className="btn" onClick={resetDraft}>
          초기화
        </button>
      </div>

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

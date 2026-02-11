import { MasterFormHeader } from "@kernel/components/master";
import AgencyContactsSection from "./sections/AgencyContactsSection";
import AgencyFormSection from "./sections/AgencyFormSection";
import AgencyRecentList from "./sections/AgencyRecentList";
import { useAgencyRegisterPage } from "./hooks/useAgencyRegisterPage";

export default function AgencyRegisterPage() {
  const {
    draft,
    agencies,
    updateDraft,
    toggleScope,
    updateScopeNote,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    resetDraft,
    submit,
    removeAgency,
  } = useAgencyRegisterPage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="관계 기관 등록" onReset={resetDraft} />
      <div className="divider" />

      <AgencyFormSection
        draft={draft}
        onChange={updateDraft}
        onToggleScope={toggleScope}
        onUpdateScopeNote={updateScopeNote}
      />

      <div className="divider" />

      <AgencyContactsSection
        contacts={draft.contacts}
        onAdd={addContact}
        onRemove={removeContact}
        onUpdate={updateContact}
        onUpdatePhone={updateContactPhone}
      />

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장
        </button>
      </div>

      <div className="divider" />

      <AgencyRecentList agencies={agencies} onRemove={removeAgency} />
    </div>
  );
}


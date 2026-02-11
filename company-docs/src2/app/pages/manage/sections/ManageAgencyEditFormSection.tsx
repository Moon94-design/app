import AgencyContactsSection from "@app2/pages/agency/sections/AgencyContactsSection";
import AgencyFormSection from "@app2/pages/agency/sections/AgencyFormSection";
import type { AgencyContact, AgencyDraft, AgencyScope } from "@kernel/schema/agency";

type ManageAgencyEditFormSectionProps = {
  draft: AgencyDraft;
  onChange: (patch: Partial<AgencyDraft>) => void;
  onToggleScope: (scope: AgencyScope) => void;
  onUpdateScopeNote: (scope: AgencyScope, text: string) => void;
  onAddContact: () => void;
  onRemoveContact: (id: string) => void;
  onUpdateContact: (id: string, patch: Partial<AgencyContact>) => void;
  onUpdateContactPhone: (id: string, raw: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
};

export default function ManageAgencyEditFormSection({
  draft,
  onChange,
  onToggleScope,
  onUpdateScopeNote,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
  onUpdateContactPhone,
  onSave,
  onCancel,
}: ManageAgencyEditFormSectionProps) {
  return (
    <>
      <AgencyFormSection
        draft={draft}
        onChange={onChange}
        onToggleScope={onToggleScope}
        onUpdateScopeNote={onUpdateScopeNote}
      />

      <div className="divider" />

      <AgencyContactsSection
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

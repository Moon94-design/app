import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageAgencyEditFormSection from "./sections/ManageAgencyEditFormSection";
import ManageAgencyListSection from "./sections/ManageAgencyListSection";
import { useManageAgencyPage } from "./hooks/useManageAgencyPage";

type ManageAgencyPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "신규 관계기관 등록",
    to: "/register/master/agency",
    text: "등록 > 기준정보 > 관계 기관",
  },
];

export default function ManageAgencyPage({ onBack }: ManageAgencyPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    agencies,
    editingAgency,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    toggleScope,
    updateScopeNote,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    save,
    removeAgency,
  } = useManageAgencyPage();

  if (editingAgency && draft) {
    return (
      <ManagePageCard title="관계기관 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageAgencyEditFormSection
          draft={draft}
          onChange={updateDraft}
          onToggleScope={toggleScope}
          onUpdateScopeNote={updateScopeNote}
          onAddContact={addContact}
          onRemoveContact={removeContact}
          onUpdateContact={updateContact}
          onUpdateContactPhone={updateContactPhone}
          onSave={save}
          onCancel={cancelEdit}
        />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="관계 기관 관리" onAction={resolvedOnBack}>

      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />

      <ManageAgencyListSection
        agencies={agencies}
        onEdit={startEdit}
        onDelete={(agency) => {
          if (!confirm(`기관 "${agency.name}"을(를) 삭제하시겠습니까?`)) return;
          removeAgency(agency.id);
        }}
      />
    </ManagePageCard>
  );
}

import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageVendorEditFormSection from "./sections/ManageVendorEditFormSection";
import ManageVendorListSection from "./sections/ManageVendorListSection";
import { useManageVendorPage } from "./hooks/useManageVendorPage";

type ManageVendorPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "신규 서비스 업체 등록",
    to: "/register/master/vendor",
    text: "등록 > 기준정보 > 서비스 업체",
  },
];

export default function ManageVendorPage({ onBack }: ManageVendorPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    vendors,
    editingVendor,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    toggleScope,
    addContact,
    removeContact,
    updateContact,
    updateContactPhone,
    save,
    removeVendor,
  } = useManageVendorPage();

  if (editingVendor && draft) {
    return (
      <ManagePageCard title="업체 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageVendorEditFormSection
          draft={draft}
          onChange={updateDraft}
          onToggleScope={toggleScope}
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
    <ManagePageCard title="서비스 업체 관리" onAction={resolvedOnBack}>

      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />

      <ManageVendorListSection
        vendors={vendors}
        onEdit={startEdit}
        onDelete={(vendor) => {
          if (!confirm(`업체 "${vendor.name}"을(를) 삭제하시겠습니까?`)) return;
          removeVendor(vendor.id);
        }}
      />
    </ManagePageCard>
  );
}

import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageConsumableEditFormSection from "./sections/ManageConsumableEditFormSection";
import ManageConsumableListSection from "./sections/ManageConsumableListSection";
import { useManageConsumablePage } from "./hooks/useManageConsumablePage";

type ManageConsumablePageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "신규 소모품 등록",
    to: "/register/master/consumable",
    text: "등록 > 기준정보 > 소모품",
  },
];

export default function ManageConsumablePage({ onBack }: ManageConsumablePageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    consumables,
    equipments,
    vendors,
    editingConsumable,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    save,
    removeConsumable,
    resetDraft,
  } = useManageConsumablePage();

  if (editingConsumable && draft) {
    return (
      <ManagePageCard title="소모품 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageConsumableEditFormSection
          draft={draft}
          equipments={equipments}
          vendors={vendors}
          onChange={updateDraft}
          onSave={save}
          onCancel={cancelEdit}
          onReset={resetDraft}
        />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="소모품 관리" onAction={resolvedOnBack}>

      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />

      <ManageConsumableListSection
        consumables={consumables}
        onEdit={startEdit}
        onDelete={(consumable) => {
          if (!confirm(`소모품 "${consumable.name}"을(를) 삭제하시겠습니까?`)) return;
          removeConsumable(consumable.id);
        }}
      />
    </ManagePageCard>
  );
}

import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageEquipmentEditFormSection from "./sections/ManageEquipmentEditFormSection";
import ManageEquipmentListSection from "./sections/ManageEquipmentListSection";
import { useManageEquipmentPage } from "./hooks/useManageEquipmentPage";

type ManageEquipmentPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "신규 설비 등록",
    to: "/register/master/equipment",
    text: "등록 > 기준정보 > 설비",
  },
  {
    label: "엑셀 일괄 등록",
    text: "추후 제공 예정",
    enabled: false,
  },
];

export default function ManageEquipmentPage({ onBack }: ManageEquipmentPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    equipments,
    editingEquipment,
    startEdit,
    cancelEdit,
    saveEquipment,
    removeEquipment,
  } = useManageEquipmentPage();

  if (editingEquipment) {
    return (
      <ManagePageCard title="설비 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageEquipmentEditFormSection
          equipment={editingEquipment}
          onSave={saveEquipment}
          onCancel={cancelEdit}
        />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="설비 관리" onAction={resolvedOnBack}>

      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />

      <ManageEquipmentListSection
        equipments={equipments}
        onEdit={startEdit}
        onDelete={(equipment) => {
          if (!confirm(`설비 "${equipment.name}"을(를) 삭제하시겠습니까?`)) return;
          removeEquipment(equipment.id);
        }}
      />
    </ManagePageCard>
  );
}

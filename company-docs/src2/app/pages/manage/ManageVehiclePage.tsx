import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageVehicleEditFormSection from "./sections/ManageVehicleEditFormSection";
import ManageVehicleListSection from "./sections/ManageVehicleListSection";
import ManageVehicleToolbar from "./sections/ManageVehicleToolbar";
import { useManageVehiclePage } from "./hooks/useManageVehiclePage";

type ManageVehiclePageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "차량 엑셀 일괄 등록",
    to: "/excel",
    text: "홈 > 엑셀등록 > 차량 업로드",
  },
  {
    label: "신규 차량 등록",
    to: "/register/master/vehicle",
    text: "등록 > 기준정보 > 차량",
  },
];

export default function ManageVehiclePage({ onBack }: ManageVehiclePageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    vehicles,
    counts,
    filter,
    setFilter,
    editingVehicle,
    startEdit,
    cancelEdit,
    saveVehicle,
    removeVehicle,
    markPending,
  } = useManageVehiclePage();

  if (editingVehicle) {
    return (
      <ManagePageCard title="차량 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageVehicleEditFormSection vehicle={editingVehicle} onSave={saveVehicle} onCancel={cancelEdit} />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="차량 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />

      <ManageVehicleToolbar filter={filter} counts={counts} onChangeFilter={setFilter} />

      <div className="divider" />

      <ManageVehicleListSection
        vehicles={vehicles}
        onEdit={startEdit}
        onPending={(vehicle) => {
          if (!confirm(`차량 "${vehicle.vehicleNo}"을(를) 보류 처리하시겠습니까?`)) return;
          markPending(vehicle.id);
        }}
        onDelete={(vehicle) => {
          if (!confirm(`차량 "${vehicle.vehicleNo}"을(를) 삭제하시겠습니까?`)) return;
          removeVehicle(vehicle.id);
        }}
      />
    </ManagePageCard>
  );
}

import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import ManageEmployeeEditFormSection from "./sections/ManageEmployeeEditFormSection";
import ManageEmployeeListSection from "./sections/ManageEmployeeListSection";
import { useManageEmployeePage } from "./hooks/useManageEmployeePage";

type ManageEmployeePageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "직원 신규 등록",
    to: "/register/master/employee",
    text: "등록 > 기준정보 > 직원",
  },
];

export default function ManageEmployeePage({ onBack }: ManageEmployeePageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const {
    employees,
    editingEmployee,
    startEdit,
    cancelEdit,
    saveEmployee,
    removeEmployee,
  } = useManageEmployeePage();

  if (editingEmployee) {
    return (
      <ManagePageCard title="직원 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageEmployeeEditFormSection
          employee={editingEmployee}
          onSave={saveEmployee}
          onCancel={cancelEdit}
        />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="직원 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />

      <ManageEmployeeListSection
        employees={employees}
        onEdit={startEdit}
        onDelete={(employee) => {
          if (!confirm(`직원 "${employee.name}"을(를) 삭제하시겠습니까?`)) return;
          removeEmployee(employee.id);
        }}
      />
    </ManagePageCard>
  );
}

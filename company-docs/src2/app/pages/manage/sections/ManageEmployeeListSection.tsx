import type { Employee } from "@kernel/schema/employee";

type ManageEmployeeListSectionProps = {
  employees: Employee[];
  onEdit: (id: string) => void;
  onDelete: (employee: Employee) => void;
};

export default function ManageEmployeeListSection({
  employees,
  onEdit,
  onDelete,
}: ManageEmployeeListSectionProps) {
  if (employees.length === 0) {
    return <p className="p">직원 데이터가 없습니다.</p>;
  }

  return (
    <>
      {employees.map((employee) => (
        <div key={employee.id} className="card manage-card manage-list-card">
          <div className="manage-list-row">
            <div>
              <div className="manage-list-title">{employee.name}</div>
              <div className="p manage-list-meta">
                {employee.branch} | {employee.phone || "-"} | {employee.job || "-"}
              </div>
              {employee.memo ? (
                <div className="p manage-list-meta">
                  메모: {employee.memo}
                </div>
              ) : null}
            </div>
            <div className="manage-action-group">
              <button type="button" className="btn manage-action-btn" onClick={() => onEdit(employee.id)}>
                수정
              </button>
              <button
                type="button"
                className="btn manage-action-btn manage-action-btn--danger"
                onClick={() => onDelete(employee)}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

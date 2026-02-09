import type { Employee } from "@kernel/schema/employee";

type Props = {
  employees: Employee[];
  onRemove: (id: string) => void;
};

export default function EmployeeRecentList({ employees, onRemove }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 직원
      </div>
      {employees.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        employees.map((employee) => (
          <div
            key={employee.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{employee.name}</div>
                <div className="p" style={{ marginTop: 6 }}>
                  {employee.branch} · {employee.phone}
                </div>
                <div className="p" style={{ marginTop: 6 }}>직무: {employee.job}</div>
                {employee.memo ? (
                  <div className="p" style={{ marginTop: 6 }}>
                    참고사항: {employee.memo}
                  </div>
                ) : null}
              </div>
              <button type="button" className="btn danger" onClick={() => onRemove(employee.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import EmployeeFormSection from "./sections/EmployeeFormSection";
import EmployeeRecentList from "./sections/EmployeeRecentList";
import { useEmployeeRegisterPage } from "./hooks/useEmployeeRegisterPage";

export default function EmployeeRegisterPage() {
  const { draft, employees, updateDraft, updateBranch, updatePhone, resetDraft, submit, removeEmployee } =
    useEmployeeRegisterPage();

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          직원 등록
        </h1>
        <button type="button" className="btn" onClick={resetDraft}>
          초기화
        </button>
      </div>

      <EmployeeFormSection
        draft={draft}
        onChange={updateDraft}
        onChangeBranch={updateBranch}
        onChangePhone={updatePhone}
      />

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장(로컬)
        </button>
      </div>

      <div className="divider" />

      <EmployeeRecentList employees={employees} onRemove={removeEmployee} />
    </div>
  );
}

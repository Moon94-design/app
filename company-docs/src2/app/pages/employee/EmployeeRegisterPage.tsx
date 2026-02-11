import { MasterFormHeader } from "@kernel/components/master";
import EmployeeFormSection from "./sections/EmployeeFormSection";
import EmployeeRecentList from "./sections/EmployeeRecentList";
import { useEmployeeRegisterPage } from "./hooks/useEmployeeRegisterPage";

export default function EmployeeRegisterPage() {
  const { draft, employees, updateDraft, updateBranch, updatePhone, resetDraft, submit, removeEmployee } =
    useEmployeeRegisterPage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="직원 등록" onReset={resetDraft} />
      <div className="divider" />

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


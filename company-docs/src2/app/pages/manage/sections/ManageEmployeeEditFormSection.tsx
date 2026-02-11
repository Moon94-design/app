import { useState } from "react";
import { formatPhoneInput } from "@kernel/utils";
import type { Employee, EmployeeBranch } from "@kernel/schema/employee";

type ManageEmployeeEditFormSectionProps = {
  employee: Employee;
  onSave: (next: Employee) => Promise<void>;
  onCancel: () => void;
};

export default function ManageEmployeeEditFormSection({
  employee,
  onSave,
  onCancel,
}: ManageEmployeeEditFormSectionProps) {
  const [form, setForm] = useState<Employee>({ ...employee });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("이름을 입력하세요.");
      return;
    }
    if (!form.phone.trim()) {
      alert("연락처를 입력하세요.");
      return;
    }
    if (!form.job.trim()) {
      alert("직무를 입력하세요.");
      return;
    }
    await onSave({
      ...form,
      name: form.name.trim(),
      phone: formatPhoneInput(form.phone),
      job: form.job.trim(),
      memo: form.memo.trim(),
      updatedAt: Date.now(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="manage-edit-field">
        <label className="label">이름</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">지부</label>
        <div className="row manage-edit-choice-row">
          {(["대구", "성주"] as const).map((branch) => (
            <button
              key={branch}
              type="button"
              className={`selBtn ${form.branch === branch ? "active" : ""}`}
              onClick={() => setForm({ ...form, branch: branch as EmployeeBranch })}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      <div className="manage-edit-field">
        <label className="label">연락처</label>
        <input
          className="input"
          inputMode="numeric"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: formatPhoneInput(e.target.value) })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">직무</label>
        <input
          className="input"
          value={form.job}
          onChange={(e) => setForm({ ...form, job: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">참고사항</label>
        <textarea
          className="textarea"
          rows={3}
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />
      </div>

      <div className="manage-edit-actions">
        <button type="submit" className="btn primary">
          저장
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

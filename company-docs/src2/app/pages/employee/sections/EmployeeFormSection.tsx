import type { EmployeeBranch, EmployeeDraft } from "@kernel/schema/employee";

type Props = {
  draft: EmployeeDraft;
  onChange: (patch: Partial<EmployeeDraft>) => void;
  onChangeBranch: (branch: EmployeeBranch) => void;
  onChangePhone: (raw: string) => void;
};

export default function EmployeeFormSection({
  draft,
  onChange,
  onChangeBranch,
  onChangePhone,
}: Props) {
  return (
    <div className="form-grid">
      <div className="form-field">
        <div className="form-label">
          이름
        </div>
        <input className="input" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          지부
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {(["대구", "성주"] as const).map((branch) => (
            <button
              key={branch}
              type="button"
              className={`selBtn ${draft.branch === branch ? "active" : ""}`}
              onClick={() => onChangeBranch(branch)}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <div className="form-label">
          연락처
        </div>
        <input
          className="input"
          inputMode="numeric"
          value={draft.phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="숫자만 입력 가능"
        />
      </div>

      <div className="form-field">
        <div className="form-label">
          직무
        </div>
        <input
          className="input"
          value={draft.job}
          onChange={(e) => onChange({ job: e.target.value })}
          placeholder="자유기입"
        />
      </div>

      <div className="form-field">
        <div className="form-label">
          참고사항
        </div>
        <textarea
          className="textarea"
          rows={2}
          value={draft.memo}
          onChange={(e) => onChange({ memo: e.target.value })}
          placeholder="참고사항"
        />
      </div>
    </div>
  );
}

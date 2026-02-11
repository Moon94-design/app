import { getVendorScopeOptions, type VendorDraft, type VendorScope } from "@kernel/schema/vendor";

type Props = {
  draft: VendorDraft;
  onChange: (patch: Partial<VendorDraft>) => void;
  onToggleScope: (scope: VendorScope) => void;
};

const SCOPE_OPTIONS = getVendorScopeOptions();

export default function VendorFormSection({ draft, onChange, onToggleScope }: Props) {
  return (
    <div className="form-grid">
      <div className="form-field">
        <div className="form-label">
          업체명
        </div>
        <input className="input" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          상태
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {(["거래중", "보류", "중단"] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`selBtn ${draft.status === status ? "active" : ""}`}
              onClick={() => onChange({ status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <div className="form-label">
          지역
        </div>
        <input className="input" value={draft.region} onChange={(e) => onChange({ region: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          서비스 범위
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {SCOPE_OPTIONS.map((scope) => (
            <button
              key={scope}
              type="button"
              className={`selBtn ${draft.scopes.includes(scope) ? "active" : ""}`}
              onClick={() => onToggleScope(scope)}
            >
              {scope}
            </button>
          ))}
        </div>
        {draft.scopes.includes("기타") ? (
          <div style={{ marginTop: 10 }}>
            <input
              className="input"
              value={draft.otherScopeText}
              onChange={(e) => onChange({ otherScopeText: e.target.value })}
              placeholder="기타 내용"
            />
          </div>
        ) : null}
      </div>

      <div className="form-field">
        <div className="form-label">
          태그(쉼표)
        </div>
        <input className="input" value={draft.tagsText} onChange={(e) => onChange({ tagsText: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          참고사항
        </div>
        <textarea
          className="textarea"
          rows={2}
          value={draft.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="참고사항"
        />
      </div>
    </div>
  );
}

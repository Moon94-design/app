import { getAgencyScopeOptions, type AgencyDraft, type AgencyScope } from "@kernel/schema/agency";

type Props = {
  draft: AgencyDraft;
  onChange: (patch: Partial<AgencyDraft>) => void;
  onToggleScope: (scope: AgencyScope) => void;
  onUpdateScopeNote: (scope: AgencyScope, text: string) => void;
};

const SCOPE_OPTIONS = getAgencyScopeOptions();

export default function AgencyFormSection({
  draft,
  onChange,
  onToggleScope,
  onUpdateScopeNote,
}: Props) {
  return (
    <div className="form-grid">
      <div className="form-field">
        <div className="form-label">
          기관명(메인)
        </div>
        <input className="input" value={draft.baseName} onChange={(e) => onChange({ baseName: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          세부태그(선택)
        </div>
        <input className="input" value={draft.detailTag} onChange={(e) => onChange({ detailTag: e.target.value })} />
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
          업무범위(복수)
        </div>
        <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
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
        {draft.scopes.length > 0 ? (
          <div style={{ marginTop: 10 }} className="form-subgrid">
            {draft.scopes.map((scope) => (
              <div key={scope} className="form-field">
                <div className="form-label">
                  {scope} 설명
                </div>
                <input
                  className="input"
                  value={draft.scopeNotes[scope] || ""}
                  onChange={(e) => onUpdateScopeNote(scope, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="form-field">
        <div className="form-label">
          비고
        </div>
        <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      </div>
    </div>
  );
}

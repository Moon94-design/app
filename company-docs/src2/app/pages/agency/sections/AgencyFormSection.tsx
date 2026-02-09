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
    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
      <div>
        <div className="p" style={{ marginTop: 0 }}>
          기관명(메인)
        </div>
        <input className="input" value={draft.baseName} onChange={(e) => onChange({ baseName: e.target.value })} />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          세부태그(선택)
        </div>
        <input className="input" value={draft.detailTag} onChange={(e) => onChange({ detailTag: e.target.value })} />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
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

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          지역
        </div>
        <input className="input" value={draft.region} onChange={(e) => onChange({ region: e.target.value })} />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
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
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {draft.scopes.map((scope) => (
              <div key={scope}>
                <div className="p" style={{ marginTop: 0 }}>
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

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          비고
        </div>
        <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      </div>
    </div>
  );
}

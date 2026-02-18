import { compactGhostButtonStyle } from "../common/dailyRecordView";
import FilterableSelect from "../common/FilterableSelect";
import type { LinkedReferenceCandidate } from "../../hooks/common/linkedReferences";
import type {
  OfficeDraft,
  OfficeLinkedReference,
  OfficeLinkType,
  OfficeLinkTypeOption,
} from "../../hooks/office/types";

type OfficeLineDraftPanelProps = {
  draft: OfficeDraft;
  lineOptions: Array<{ id: string; label: string }>;
  suggestionCandidates: LinkedReferenceCandidate<OfficeLinkType>[];
  linkTypeOptions: readonly OfficeLinkTypeOption[];
  isHistoryLineEditing: boolean;
  onUpdateLineDraft: (patch: Partial<OfficeDraft["lineDraft"]>) => void;
  onSelectLinkedReference: (id: string) => void;
  onAddSuggestionCandidate: (candidate: LinkedReferenceCandidate<OfficeLinkType>) => void;
  onRemoveLinkedReference: (reference: OfficeLinkedReference) => void;
  onCommitLineDraft: () => Promise<void> | void;
  onCancelHistoryLineEdit: () => void;
};

export default function OfficeLineDraftPanel({
  draft,
  lineOptions,
  suggestionCandidates,
  linkTypeOptions,
  isHistoryLineEditing,
  onUpdateLineDraft,
  onSelectLinkedReference,
  onAddSuggestionCandidate,
  onRemoveLinkedReference,
  onCommitLineDraft,
  onCancelHistoryLineEdit,
}: OfficeLineDraftPanelProps) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h2 className="h1" style={{ fontSize: 15 }}>
        사무 세부 등록
      </h2>
      <div className="form-grid" style={{ marginTop: 8 }}>
        <div className="form-field">
          <p className="form-label">세부 제목</p>
          <input
            className="input"
            value={draft.lineDraft.subtitle}
            onChange={(event) => onUpdateLineDraft({ subtitle: event.target.value })}
            placeholder="세부 제목"
          />
        </div>
        <div className="form-field">
          <p className="form-label">내용</p>
          <textarea
            className="textarea"
            rows={3}
            value={draft.lineDraft.details}
            onChange={(event) => onUpdateLineDraft({ details: event.target.value })}
            placeholder="상세 내용"
          />
        </div>
        <div className="form-two-col">
          <div className="form-field">
            <p className="form-label">연계정보 유형(선택)</p>
            <select
              className="input"
              value={draft.lineDraft.linkType}
              onChange={(event) => onUpdateLineDraft({ linkType: event.target.value as typeof draft.lineDraft.linkType })}
            >
              {linkTypeOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <p className="form-label">연계정보 선택(선택)</p>
            <FilterableSelect
              value={draft.lineDraft.linkId}
              options={lineOptions}
              onChange={(nextId) => onSelectLinkedReference(nextId)}
              searchPlaceholder="연계정보 검색 후 선택"
              noResultText="검색 결과가 없습니다."
              allowEmpty={false}
            />
          </div>
        </div>

        {draft.lineDraft.linkedReferences.length > 0 ? (
          <div className="form-field">
            <p className="form-label" style={{ marginBottom: 6 }}>
              연계 항목 (클릭 시 삭제)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {draft.lineDraft.linkedReferences.map((item) => (
                <button
                  key={`${item.type}:${item.id}`}
                  type="button"
                  onClick={() => onRemoveLinkedReference(item)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "inherit",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  aria-label={`${item.label} 삭제`}
                  title="클릭하면 삭제"
                >
                  {item.label}
                  <span style={{ color: "#ff4d4f", fontWeight: 700 }}>X</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {suggestionCandidates.length > 0 ? (
          <div className="form-field">
            <p className="form-label" style={{ marginBottom: 6 }}>
              내용 기반 연계 추천
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {suggestionCandidates.map((candidate) => (
                <button
                  key={`${candidate.type}:${candidate.id}`}
                  type="button"
                  style={compactGhostButtonStyle}
                  onClick={() => onAddSuggestionCandidate(candidate)}
                >
                  {candidate.typeLabel} · {candidate.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="row" style={{ gap: 6 }}>
        {isHistoryLineEditing ? (
          <button type="button" style={compactGhostButtonStyle} onClick={onCancelHistoryLineEdit}>
            수정 취소
          </button>
        ) : null}
        <button type="button" className="btn" onClick={() => void onCommitLineDraft()}>
          {isHistoryLineEditing ? "수정 저장" : "등록"}
        </button>
      </div>
    </div>
  );
}

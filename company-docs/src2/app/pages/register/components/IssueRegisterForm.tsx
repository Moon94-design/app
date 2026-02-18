import { DailyMetaFields } from "@kernel/components/record";
import type { LinkedReferenceCandidate } from "../hooks/common/linkedReferences";
import type { OfficeLinkType, OfficeLinkTypeOption } from "../hooks/office/types";
import type { IssueRegisterDraft } from "../hooks/useRegisterIssuePage";
import { compactGhostButtonStyle } from "../sections/common/dailyRecordView";
import FilterableSelect from "../sections/common/FilterableSelect";

export const ISSUE_CATEGORY_OPTIONS = ["현장", "설비", "안전"] as const;
export const ISSUE_STATUS_OPTIONS = ["진행중", "완료"] as const;

type IssueRegisterFormProps = {
  draft: IssueRegisterDraft;
  siteOptions: readonly IssueRegisterDraft["site"][];
  linkTypeOptions?: readonly OfficeLinkTypeOption[];
  lineOptions?: Array<{ id: string; label: string }>;
  suggestionCandidates?: LinkedReferenceCandidate<OfficeLinkType>[];
  onChange: (patch: Partial<IssueRegisterDraft>) => void;
  onSelectLinkedReference?: (id: string) => void;
  onAddSuggestionCandidate?: (candidate: LinkedReferenceCandidate<OfficeLinkType>) => void;
  onRemoveLinkedReference?: (type: OfficeLinkType, id: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  lockRecordDate?: boolean;
  lockSite?: boolean;
  lockWriterName?: boolean;
  lockWriterRole?: boolean;
  showRelationFields?: boolean;
};

export default function IssueRegisterForm({
  draft,
  siteOptions,
  linkTypeOptions,
  lineOptions,
  suggestionCandidates,
  onChange,
  onSelectLinkedReference,
  onAddSuggestionCandidate,
  onRemoveLinkedReference,
  onSubmit,
  submitLabel = "저장",
  lockRecordDate = false,
  lockSite = false,
  lockWriterName = false,
  lockWriterRole = false,
}: IssueRegisterFormProps) {
  const canUseLinkedReference =
    Boolean(linkTypeOptions) &&
    Boolean(lineOptions) &&
    Boolean(onSelectLinkedReference) &&
    Boolean(onAddSuggestionCandidate) &&
    Boolean(onRemoveLinkedReference);
  const safeSuggestionCandidates = suggestionCandidates || [];

  return (
    <>
      <div className="form-grid">
        <DailyMetaFields
          recordDate={draft.recordDate}
          site={draft.site}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          siteOptions={siteOptions}
          onChangeRecordDate={(next) => onChange({ recordDate: next })}
          onChangeSite={(next) => onChange({ site: next })}
          onChangeWriterName={(next) => onChange({ writerName: next })}
          onChangeWriterRole={(next) => onChange({ writerRole: next })}
          lockRecordDate={lockRecordDate}
          lockSite={lockSite}
          lockWriterName={lockWriterName}
          lockWriterRole={lockWriterRole}
        />

        <div className="form-two-col">
          <div className="form-field">
            <p className="form-label">분류</p>
            <div className="row" style={{ marginTop: 0 }}>
              {ISSUE_CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`selBtn ${draft.category === category ? "active" : ""}`}
                  onClick={() => onChange({ category })}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <p className="form-label">상태</p>
            <div className="row" style={{ marginTop: 0 }}>
              {ISSUE_STATUS_OPTIONS.map((status) => (
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
        </div>

        <div className="form-field">
          <p className="form-label">이슈 제목</p>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="예: 차량 공회전 이상 진동"
          />
        </div>

        <div className="form-field">
          <p className="form-label">상세 내용</p>
          <textarea
            className="textarea"
            rows={4}
            value={draft.details}
            onChange={(e) => onChange({ details: e.target.value })}
            placeholder="상세 내용을 입력해 주세요."
          />
        </div>

        {canUseLinkedReference ? (
          <>
            <div className="form-two-col">
              <div className="form-field">
                <p className="form-label">연계정보 유형(선택)</p>
                <select
                  className="input"
                  value={draft.linkType}
                  onChange={(event) => onChange({ linkType: event.target.value as IssueRegisterDraft["linkType"] })}
                >
                  {linkTypeOptions!.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <p className="form-label">연계정보 선택(선택)</p>
                <FilterableSelect
                  value={draft.linkId}
                  options={lineOptions!}
                  onChange={onSelectLinkedReference!}
                  searchPlaceholder="연계정보 검색 후 선택"
                  noResultText="검색 결과가 없습니다."
                  allowEmpty={false}
                />
              </div>
            </div>

            {draft.linkedReferences.length > 0 ? (
              <div className="form-field">
                <p className="form-label" style={{ marginBottom: 6 }}>
                  연계 항목 (클릭 시 삭제)
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {draft.linkedReferences.map((item) => (
                    <button
                      key={`${item.type}:${item.id}`}
                      type="button"
                      onClick={() => onRemoveLinkedReference!(item.type, item.id)}
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
                      title="클릭하면 삭제"
                    >
                      {item.label}
                      <span style={{ color: "#ff4d4f", fontWeight: 700 }}>X</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {safeSuggestionCandidates.length > 0 ? (
              <div className="form-field">
                <p className="form-label" style={{ marginBottom: 6 }}>
                  내용 기반 연계 추천
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {safeSuggestionCandidates.map((candidate) => (
                    <button
                      key={`${candidate.type}:${candidate.id}`}
                      type="button"
                      style={compactGhostButtonStyle}
                      onClick={() => onAddSuggestionCandidate!(candidate)}
                    >
                      {candidate.typeLabel} · {candidate.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </>
  );
}

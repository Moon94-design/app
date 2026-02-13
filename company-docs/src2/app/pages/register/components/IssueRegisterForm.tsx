import { DailyMetaFields } from "@kernel/components/record";
import type { IssueRegisterDraft } from "../hooks/useRegisterIssuePage";

export const ISSUE_CATEGORY_OPTIONS = ["현장", "설비", "안전"] as const;
export const ISSUE_STATUS_OPTIONS = ["진행중", "완료"] as const;

type IssueRegisterFormProps = {
  draft: IssueRegisterDraft;
  siteOptions: readonly IssueRegisterDraft["site"][];
  onChange: (patch: Partial<IssueRegisterDraft>) => void;
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
  onChange,
  onSubmit,
  submitLabel = "저장",
  lockRecordDate = false,
  lockSite = false,
  lockWriterName = false,
  lockWriterRole = false,
}: IssueRegisterFormProps) {
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
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </>
  );
}

import { AutoTitleField, DailyMetaFields } from "@kernel/components/record";
import { TagBlock } from "@kernel/components/tag";
import type { ActionRegisterDraft } from "../hooks/useRegisterActionPage";

type PendingIssue = {
  id: string;
  title: string;
  category: string;
  date: string;
  writerName: string;
};

type VendorOption = {
  id: string;
  name: string;
};

type ActionRegisterFormProps = {
  draft: ActionRegisterDraft;
  pendingIssues: PendingIssue[];
  vendors: VendorOption[];
  siteOptions: readonly ActionRegisterDraft["site"][];
  onChange: (patch: Partial<ActionRegisterDraft>) => void;
  onSubmit: () => void;
  submitLabel?: string;
  lockRecordDate?: boolean;
  lockSite?: boolean;
  lockWriterName?: boolean;
  lockWriterRole?: boolean;
  showIssueLinkField?: boolean;
};

export default function ActionRegisterForm({
  draft,
  pendingIssues,
  vendors,
  siteOptions,
  onChange,
  onSubmit,
  submitLabel = "저장",
  lockRecordDate = false,
  lockSite = false,
  lockWriterName = false,
  lockWriterRole = false,
  showIssueLinkField = true,
}: ActionRegisterFormProps) {
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

        <AutoTitleField
          recordDate={draft.recordDate}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          suffix="조치기록"
          value={draft.title}
          onChange={(next) => onChange({ title: next })}
          placeholder="비워두면 자동 입력"
        />

        {showIssueLinkField ? (
          <div className="form-field">
            <p className="form-label">이슈 연계</p>
            <select className="input" value={draft.issueId} onChange={(e) => onChange({ issueId: e.target.value })}>
              <option value="">선택 안함</option>
              {pendingIssues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.date} · {issue.category} · {issue.title}
                </option>
              ))}
            </select>
            {pendingIssues.length === 0 ? <p className="p">진행 중 이슈가 없습니다.</p> : null}
          </div>
        ) : null}

        <div className="form-field">
          <p className="form-label">정비업체</p>
          <select className="input" value={draft.vendorId} onChange={(e) => onChange({ vendorId: e.target.value })}>
            <option value="">선택 안함</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {draft.vendorId ? (
          <div className="form-field">
            <p className="form-label">정비 비용(원)</p>
            <input
              className="input"
              inputMode="numeric"
              value={String(draft.vendorCost || 0)}
              onChange={(e) => onChange({ vendorCost: Number(e.target.value || 0) })}
            />
          </div>
        ) : null}

        <div className="form-field">
          <p className="form-label">내용</p>
          <textarea
            className="textarea"
            rows={4}
            value={draft.details}
            onChange={(e) => onChange({ details: e.target.value })}
            placeholder="조치 내용을 입력해 주세요."
          />
        </div>

        <div className="form-field">
          <p className="form-label">태그</p>
          <TagBlock
            scope="action"
            tagsText={draft.tagsText}
            onChangeTagsText={(next) => onChange({ tagsText: next })}
            detailsText={draft.details}
            placeholder="태그 입력"
            showChips={true}
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

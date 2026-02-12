type DailyMetaFieldsProps<TSite extends string> = {
  recordDate: string;
  site: TSite;
  writerName: string;
  writerRole: string;
  siteOptions: readonly TSite[];
  onChangeRecordDate: (next: string) => void;
  onChangeSite: (next: TSite) => void;
  onChangeWriterName: (next: string) => void;
  onChangeWriterRole: (next: string) => void;
  lockRecordDate?: boolean;
  lockWriterName?: boolean;
  allowEmptySite?: boolean;
  emptySiteLabel?: string;
};

export default function DailyMetaFields<TSite extends string>({
  recordDate,
  site,
  writerName,
  writerRole,
  siteOptions,
  onChangeRecordDate,
  onChangeSite,
  onChangeWriterName,
  onChangeWriterRole,
  lockRecordDate = false,
  lockWriterName = false,
  allowEmptySite = false,
  emptySiteLabel = "선택 안함",
}: DailyMetaFieldsProps<TSite>) {
  return (
    <>
      <div className="form-two-col">
        <div className="form-field">
          <p className="form-label">기록일</p>
          <input
            className="input"
            type="date"
            value={recordDate}
            onChange={(e) => onChangeRecordDate(e.target.value)}
            disabled={lockRecordDate}
            readOnly={lockRecordDate}
          />
        </div>
        <div className="form-field">
          <p className="form-label">지부</p>
          <select className="input" value={site} onChange={(e) => onChangeSite(e.target.value as TSite)}>
            {allowEmptySite ? <option value="">{emptySiteLabel}</option> : null}
            {siteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-two-col">
        <div className="form-field">
          <p className="form-label">작성자</p>
          <input
            className="input"
            value={writerName}
            onChange={(e) => onChangeWriterName(e.target.value)}
            placeholder="이름"
            disabled={lockWriterName}
            readOnly={lockWriterName}
          />
        </div>
        <div className="form-field">
          <p className="form-label">직책</p>
          <input
            className="input"
            value={writerRole}
            onChange={(e) => onChangeWriterRole(e.target.value)}
            placeholder="직책"
          />
        </div>
      </div>
    </>
  );
}

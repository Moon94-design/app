/**
 * RecordHeaderBlock — 기록 헤더 입력 블록 (SSOT 정본)
 * 
 * 역할:
 * - 기록날짜/작성자/직책/지부 입력 통합
 * - 표현(UI) 전용: 상태 생성/저장/기본값 주입 금지
 * - props + onChange 콜백만 사용
 * 
 * 사용처: RegisterIssue, RegisterAction, IssueForm
 */

export type RecordHeaderBlockProps = {
  // 기록날짜
  recordDate?: string;
  onChangeRecordDate?: (date: string) => void;
  showDate?: boolean;        // default: true
  dateEditable?: boolean;    // default: true
  
  // 작성자/직책
  writerName?: string;
  setWriterName?: (name: string) => void;
  writerRole?: string;
  setWriterRole?: (role: string) => void;
  showWriter?: boolean;      // default: true
  writerEditable?: boolean;  // default: true
  
  // 지부
  site?: string;
  onChangeSite?: (site: string | undefined) => void;
  siteOptions?: string[];    // 부모가 옵션 제공 (예: ["대구", "성주"])
  showSite?: boolean;        // default: false
  siteEditable?: boolean;    // default: true
};

export default function RecordHeaderBlock(props: RecordHeaderBlockProps) {
  const {
    recordDate = "",
    onChangeRecordDate,
    showDate = true,
    dateEditable = true,
    
    writerName = "",
    setWriterName,
    writerRole = "",
    setWriterRole,
    showWriter = true,
    writerEditable = true,
    
    site,
    onChangeSite,
    siteOptions = [],
    showSite = false,
    siteEditable = true,
  } = props;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {/* 기록날짜 */}
      {showDate && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
          <div className="p">기록일 *</div>
          <input
            className="input"
            type="date"
            value={recordDate}
            onChange={(e) => onChangeRecordDate?.(e.target.value)}
            disabled={!dateEditable}
            style={!dateEditable ? { opacity: 0.7 } : undefined}
          />
        </div>
      )}

      {/* 작성자 */}
      {showWriter && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
          <div className="p">작성자 *</div>
          <input
            className="input"
            value={writerName}
            onChange={(e) => setWriterName?.(e.target.value)}
            placeholder="이름"
            disabled={!writerEditable}
          />
        </div>
      )}

      {/* 직책 */}
      {showWriter && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
          <div className="p">직책 *</div>
          <input
            className="input"
            value={writerRole}
            onChange={(e) => setWriterRole?.(e.target.value)}
            placeholder="직책"
            disabled={!writerEditable}
          />
        </div>
      )}

      {/* 지부 */}
      {showSite && siteOptions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
          <div className="p">지부</div>
          <div className="row" style={{ marginTop: 0 }}>
            {siteOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`selBtn ${site === option ? "active" : ""}`}
                onClick={() => {
                  if (!siteEditable) return;
                  onChangeSite?.(site === option ? undefined : option);
                }}
                disabled={!siteEditable}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

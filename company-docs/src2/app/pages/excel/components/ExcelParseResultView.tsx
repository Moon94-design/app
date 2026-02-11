import { type ReactNode } from "react";

export interface ParseStats {
  total: number;
  ok: number;
  incomplete?: number;
  fail: number;
}

export interface TableColumn {
  header: string;
  key: string;
  render?: (row: any) => ReactNode;
}

interface ExcelParseResultViewProps {
  stats: ParseStats;
  duplicates?: string[];
  dbConflicts?: string[];
  policyMessage?: ReactNode;
  previewRows: any[];
  previewColumns: TableColumn[];
  maxPreviewRows?: number;
  applyCount: number;
  onApply: () => void;
  canApply: boolean;
  applyButtonText?: string;
}

export default function ExcelParseResultView({
  stats,
  duplicates = [],
  dbConflicts = [],
  policyMessage,
  previewRows,
  previewColumns,
  maxPreviewRows = 20,
  applyCount,
  onApply,
  canApply,
  applyButtonText,
}: ExcelParseResultViewProps) {
  const showIncomplete = stats.incomplete !== undefined;

  return (
    <div>
      <div className="divider" />
      <h2 className="h2">파싱 결과</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 14 }}>
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>전체</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>
            {stats.total}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>

        <div className="card" style={{ background: "rgba(100,200,100,0.1)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>완료 (OK)</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(100,255,150,1)" }}>
            {stats.ok}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>

        {showIncomplete && (
          <div className="card" style={{ background: "rgba(255,200,100,0.1)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>미완료 (INCOMPLETE)</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(255,200,100,1)" }}>
              {stats.incomplete}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
            </div>
          </div>
        )}

        <div className="card" style={{ background: "rgba(255,100,100,0.1)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>실패 (FAIL)</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(255,100,100,1)" }}>
            {stats.fail}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>
      </div>

      {(duplicates.length > 0 || dbConflicts.length > 0) && (
        <div className="card" style={{ background: "rgba(255,100,100,0.1)", marginTop: 20 }}>
          <div className="p" style={{ marginTop: 0, color: "rgba(255,100,100,1)", fontWeight: 700 }}>
            ⚠️ 중복/충돌 발생
          </div>
          {duplicates.length > 0 && (
            <div className="p" style={{ marginTop: 8, fontSize: 13 }}>
              🔸 엑셀 내부 중복: {duplicates.join(", ")}
            </div>
          )}
          {dbConflicts.length > 0 && (
            <div className="p" style={{ marginTop: 8, fontSize: 13 }}>
              🔸 DB 충돌: {dbConflicts.join(", ")}
            </div>
          )}
          <div className="p" style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
            → 중복/충돌 건은 FAIL 상태로 분류되어 등록되지 않습니다.
          </div>
        </div>
      )}

      {policyMessage && (
        <div className="card" style={{ background: "rgba(100,150,255,0.1)", marginTop: 20 }}>
          {policyMessage}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3 className="h3">미리보기 (최근 {maxPreviewRows}건)</h3>
        <div style={{ overflowX: "auto", marginTop: 14 }}>
          <table className="table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                {previewColumns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, maxPreviewRows).map((row, idx) => (
                <tr key={idx}>
                  {previewColumns.map((col, colIdx) => (
                    <td key={colIdx}>{col.render ? col.render(row) : row[col.key] || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="divider" style={{ marginTop: 30 }} />

      <div style={{ marginTop: 20, display: "flex", gap: 14, alignItems: "center" }}>
        <button
          className="btn primary"
          onClick={onApply}
          disabled={!canApply}
          style={{ fontSize: 16, padding: "12px 24px" }}
        >
          {applyButtonText || `✅ 적용 (${applyCount}건 등록)`}
        </button>
        {!canApply && (
          <div className="p" style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>
            등록 가능한 데이터가 없습니다 (FAIL만 존재)
          </div>
        )}
      </div>
    </div>
  );
}

export function renderStatusBadge(status: "OK" | "INCOMPLETE" | "FAIL") {
  const label = status === "OK" ? "완료" : status === "INCOMPLETE" ? "미완료" : "실패";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        borderRadius: 3,
        fontSize: 11,
        fontWeight: 700,
        background:
          status === "OK"
            ? "rgba(100,200,100,0.3)"
            : status === "INCOMPLETE"
              ? "rgba(255,200,100,0.3)"
              : "rgba(255,100,100,0.3)",
        color:
          status === "OK"
            ? "rgba(100,255,150,1)"
            : status === "INCOMPLETE"
              ? "rgba(255,200,100,1)"
              : "rgba(255,100,100,1)",
      }}
    >
      {label}
    </span>
  );
}

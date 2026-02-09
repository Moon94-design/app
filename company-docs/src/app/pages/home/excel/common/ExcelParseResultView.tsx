/**
 * ExcelParseResultView.tsx
 * 공통 엑셀 파싱 결과 UI 컴포넌트
 * 
 * 차량/거래처/계량현황 등 모든 엑셀 파싱 결과 표시에 사용
 */

import { type ReactNode } from "react";

/**
 * 파싱 통계
 */
export interface ParseStats {
  total: number;
  ok: number;
  incomplete?: number; // 옵션 (거래처는 없을 수 있음)
  fail: number;
}

/**
 * 테이블 컬럼 정의
 */
export interface TableColumn {
  header: string;
  key: string;
  render?: (row: any) => ReactNode; // 커스텀 렌더링
}

/**
 * 파싱 결과 Props
 */
interface ExcelParseResultViewProps {
  // 통계
  stats: ParseStats;
  
  // 중복/충돌
  duplicates?: string[];
  dbConflicts?: string[];
  
  // 적용 정책 메시지 (커스텀)
  policyMessage?: ReactNode;
  
  // 미리보기 테이블
  previewRows: any[]; // 파싱된 row 배열
  previewColumns: TableColumn[]; // 테이블 컬럼 정의
  maxPreviewRows?: number; // 기본 20
  
  // 적용 버튼
  applyCount: number; // 적용 예정 건수
  onApply: () => void;
  canApply: boolean;
  applyButtonText?: string; // 기본값: "✅ 적용 ({count}건 등록)"
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

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 14 }}>
        {/* 전체 */}
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            전체
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>
            {stats.total}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>

        {/* OK */}
        <div className="card" style={{ background: "rgba(100,200,100,0.1)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            완료 (OK)
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(100,255,150,1)" }}>
            {stats.ok}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>

        {/* INCOMPLETE (옵션) */}
        {showIncomplete && (
          <div className="card" style={{ background: "rgba(255,200,100,0.1)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
              미완성 (INCOMPLETE)
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(255,200,100,1)" }}>
              {stats.incomplete}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
            </div>
          </div>
        )}

        {/* FAIL */}
        <div className="card" style={{ background: "rgba(255,100,100,0.1)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            실패 (FAIL)
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(255,100,100,1)" }}>
            {stats.fail}
            <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
          </div>
        </div>
      </div>

      {/* 중복/충돌 경고 */}
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

      {/* 적용 정책 안내 (커스텀 가능) */}
      {policyMessage && (
        <div className="card" style={{ background: "rgba(100,150,255,0.1)", marginTop: 20 }}>
          {policyMessage}
        </div>
      )}

      {/* 미리보기 테이블 */}
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
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="divider" style={{ marginTop: 30 }} />

      {/* 적용 버튼 */}
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

/**
 * 상태 배지 렌더링 헬퍼
 */
export function renderStatusBadge(status: "OK" | "INCOMPLETE" | "FAIL") {
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
      {status}
    </span>
  );
}

import { useState } from "react";
import ExcelParseResultView from "../components/ExcelParseResultView";
import { renderStatusBadge } from "../components/renderStatusBadge";
import { parsePartnerExcelNative } from "../adapters/partnerExcelBridge";
import type { PartnerParseResult, PartnerParsedRow } from "../types/excelUploadTypes";

type Props = {
  existingCodes: string[];
  onApply: (result: PartnerParseResult) => void;
};

export default function ExcelPartnerUploadSection({ existingCodes, onApply }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<PartnerParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!file) return;
    setParsing(true);
    setError(null);
    setResult(null);

    try {
      const parsed = await parsePartnerExcelNative(file, existingCodes);
      setResult(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "파싱 실패");
    } finally {
      setParsing(false);
    }
  }

  function handleApply() {
    if (!result || result.ok === 0) return;
    onApply(result);
    setFile(null);
    setResult(null);
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)", padding: 20, marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>엑셀 업로드 (거래처 일괄 등록)</h3>

      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setResult(null);
            setError(null);
          }}
        />
        {file && (
          <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn primary" onClick={handleParse} disabled={!file || parsing}>
          {parsing ? "파싱 중..." : "파싱 & 검증"}
        </button>
        <button className="btn" onClick={handleReset} disabled={parsing}>
          초기화
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#d32f2f", color: "white", borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {result && (
        <ExcelParseResultView
          stats={{ total: result.total, ok: result.ok, fail: result.fail }}
          duplicates={result.duplicates}
          dbConflicts={result.dbConflicts}
          policyMessage={
            <>
              <div className="p" style={{ marginTop: 0, fontWeight: 700 }}>📋 적용 정책</div>
              <div className="p" style={{ marginTop: 8, fontSize: 13 }}>
                • FAIL 건은 제외하고 <strong>OK 건만 등록</strong>됩니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 적용 예정: <strong>{result.ok}건</strong>
              </div>
            </>
          }
          previewRows={result.rows}
          previewColumns={[
            { header: "행", key: "rowIndex" },
            { header: "상태", key: "status", render: (row: PartnerParsedRow) => renderStatusBadge(row.status === "FAIL" ? "FAIL" : "OK") },
            { header: "거래처코드", key: "data", render: (row: PartnerParsedRow) => row.data?.partnerCode || "-" },
            { header: "거래처명", key: "data", render: (row: PartnerParsedRow) => row.data?.partnerName || "-" },
            { header: "대표자명", key: "data", render: (row: PartnerParsedRow) => row.data?.ceoName || "-" },
            { header: "메시지", key: "errors", render: (row: PartnerParsedRow) => <span style={{ fontSize: 11, opacity: 0.7 }}>{row.errors.join(", ") || "-"}</span> },
          ]}
          applyCount={result.ok}
          onApply={handleApply}
          canApply={result.ok > 0}
          applyButtonText={`거래처 ${result.ok}건 등록`}
        />
      )}
    </div>
  );
}

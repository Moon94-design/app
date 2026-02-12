import { useState } from "react";
import ExcelParseResultView from "../components/ExcelParseResultView";
import { renderStatusBadge } from "../components/renderStatusBadge";
import { parseWeighingExcelNative } from "../adapters/weighingExcelBridge";
import type { ExcelSite, WeighingParseResult, WeighingParsedRow } from "../types/excelUploadTypes";

type Props = {
  selectedSite: ExcelSite;
  existingTicketKeys: string[];
  onApply: (result: WeighingParseResult) => void;
};

export default function ExcelWeighingUploadSection({ selectedSite, existingTicketKeys, onApply }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<WeighingParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!file) return;
    setParsing(true);
    setError(null);
    setResult(null);
    try {
      const parsed = await parseWeighingExcelNative(file, existingTicketKeys, selectedSite);
      setResult(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "파싱 실패");
    } finally {
      setParsing(false);
    }
  }

  function handleApply() {
    if (!result || result.ok + result.incomplete === 0) return;
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
      <h3 style={{ marginTop: 0, fontSize: 16 }}>엑셀 업로드 (계량현황 일괄 등록)</h3>

      <p className="p" style={{ marginTop: 0, marginBottom: 10, fontSize: 13, opacity: 0.8 }}>
        선택 지점: <strong>{selectedSite === "daegu" ? "대구" : "성주"}</strong>
      </p>

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
          stats={{ total: result.total, ok: result.ok, incomplete: result.incomplete, fail: result.fail }}
          duplicates={result.duplicates}
          policyMessage={
            <>
              <div className="p" style={{ marginTop: 0, fontWeight: 700 }}>📋 적용 정책</div>
              <div className="p" style={{ marginTop: 8, fontSize: 13 }}>
                • FAIL 건은 제외하고 <strong>완료 + 미완료</strong> 건을 모두 등록합니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 미완료 건은 관리에서 <strong>기본 미입력</strong>으로 확인/보완할 수 있습니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 중복 판정 키: <strong>site + ticketNo</strong> ({selectedSite === "daegu" ? "대구" : "성주"} 선택 기준)
              </div>
            </>
          }
          previewRows={result.rows}
          previewColumns={[
            { header: "행", key: "rowIndex" },
            { header: "상태", key: "status", render: (row: WeighingParsedRow) => renderStatusBadge(row.status) },
            { header: "전표번호", key: "data", render: (row: WeighingParsedRow) => row.data?.ticketNo || "-" },
            { header: "날짜", key: "data", render: (row: WeighingParsedRow) => row.data?.date || "-" },
            { header: "거래처", key: "data", render: (row: WeighingParsedRow) => row.data?.partnerName || "-" },
            { header: "차량번호", key: "data", render: (row: WeighingParsedRow) => row.data?.vehicleNo || "-" },
            { header: "품목", key: "data", render: (row: WeighingParsedRow) => row.data?.itemName || "-" },
            { header: "단가", key: "data", render: (row: WeighingParsedRow) => row.data?.unitPrice || 0 },
            { header: "메시지", key: "errors", render: (row: WeighingParsedRow) => <span style={{ fontSize: 11, opacity: 0.7 }}>{row.errors.join(", ") || "-"}</span> },
          ]}
          applyCount={result.ok + result.incomplete}
          onApply={handleApply}
          canApply={result.ok + result.incomplete > 0}
          applyButtonText={`거래 ${result.ok + result.incomplete}건 등록`}
        />
      )}
    </div>
  );
}

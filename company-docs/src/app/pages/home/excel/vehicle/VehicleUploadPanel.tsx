/**
 * VehicleUploadPanel.tsx
 * 차량 엑셀 업로드 패널
 * - 파일 선택
 * - 파싱/검증/미리보기
 * - 적용(등록) - FAIL 제외, OK/INCOMPLETE 등록 가능
 */

import { useState, useMemo } from "react";
import { parseVehicleExcel } from "./vehicleExcelParser";
import type { VehicleParseResult, VehicleParsedRow } from "./vehicleExcelTypes";
import ExcelParseResultView, { renderStatusBadge } from "../common/ExcelParseResultView";

interface VehicleUploadPanelProps {
  existingVehicleNos: string[]; // 기존 DB 차량번호 (충돌 검증)
  onApply: (result: VehicleParseResult) => void; // 적용 콜백
}

export default function VehicleUploadPanel({ existingVehicleNos, onApply }: VehicleUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<VehicleParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string>("");

  // 파일 선택
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParseResult(null);
      setError("");
    }
  }

  // 파싱
  async function handleParse() {
    if (!file) return;

    setParsing(true);
    setError("");

    try {
      const result = await parseVehicleExcel(file, existingVehicleNos);
      setParseResult(result);
    } catch (err: any) {
      setError(err.message || "파싱 실패");
    } finally {
      setParsing(false);
    }
  }

  // 적용 (FAIL 제외, OK/INCOMPLETE만 등록)
  function handleApply() {
    if (!parseResult) return;
    onApply(parseResult);
  }

  // 적용 가능 여부 (OK + INCOMPLETE만)
  const canApply = useMemo(() => {
    if (!parseResult) return false;
    return parseResult.ok + parseResult.incomplete > 0;
  }, [parseResult]);

  // 적용 예정 건수
  const applyCount = useMemo(() => {
    if (!parseResult) return 0;
    return parseResult.ok + parseResult.incomplete;
  }, [parseResult]);

  return (
    <div
      className="card"
      style={{
        background: "rgba(255,255,255,0.02)",
        padding: 20,
        marginBottom: 20,
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 16 }}>엑셀 업로드 (차량 일괄 등록)</h3>

      {/* 파일 선택 */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
        {file && (
          <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </span>
        )}
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          className="btn primary"
          onClick={handleParse}
          disabled={!file || parsing}
        >
          {parsing ? "파싱 중..." : "파싱 & 검증"}
        </button>
        <button
          className="btn"
          onClick={() => {
            setFile(null);
            setParseResult(null);
            setError("");
          }}
          disabled={parsing}
        >
          초기화
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div
          style={{
            padding: 12,
            background: "#d32f2f",
            color: "white",
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* 파싱 결과 */}
      {parseResult && (
        <ExcelParseResultView
          stats={{
            total: parseResult.total,
            ok: parseResult.ok,
            incomplete: parseResult.incomplete,
            fail: parseResult.fail,
          }}
          duplicates={parseResult.duplicates}
          dbConflicts={parseResult.dbConflicts}
          policyMessage={
            <>
              <div className="p" style={{ marginTop: 0, fontWeight: 700 }}>
                📋 적용 정책
              </div>
              <div className="p" style={{ marginTop: 8, fontSize: 13 }}>
                • FAIL 건은 제외하고 <strong>INCOMPLETE 건만 등록</strong>됩니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 엑셀에는 운송사/기사명/연락처가 없으므로 <strong>모든 건이 미완성</strong> 상태로 등록됩니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 관리 페이지에서 운송사/기사명/연락처를 추가해야 완성됩니다.
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                • 적용 예정: <strong>{applyCount}건</strong> (INCOMPLETE: {parseResult.incomplete})
              </div>
            </>
          }
          previewRows={parseResult.rows}
          previewColumns={[
            { header: "행", key: "rowIndex" },
            {
              header: "상태",
              key: "status",
              render: (row: VehicleParsedRow) => renderStatusBadge(row.status),
            },
            { header: "차량번호", key: "data", render: (row: VehicleParsedRow) => row.data.vehicleNo || "-" },
            { header: "톤수", key: "data", render: (row: VehicleParsedRow) => row.data.tonClass || "미완성" },
            { header: "형태", key: "data", render: (row: VehicleParsedRow) => row.data.bodyType || "미완성" },
            {
              header: "메시지",
              key: "messages",
              render: (row: VehicleParsedRow) => (
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  {[...row.errors, ...row.warnings].join(", ") || "-"}
                </span>
              ),
            },
          ]}
          applyCount={applyCount}
          onApply={handleApply}
          canApply={canApply}
        />
      )}
    </div>
  );
}

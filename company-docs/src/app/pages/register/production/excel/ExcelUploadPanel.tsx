/**
 * ExcelUploadPanel.tsx
 * 엑셀 업로드 미리보기 UI
 * 
 * 역할:
 * - 파일 업로드 input
 * - 파싱/검증 실행
 * - 검증 결과 테이블 표시 (OK/FAIL/WARN, 에러 메시지)
 * - 통계 표시 (총/OK/FAIL)
 * 
 * Phase5-1 제약:
 * - 저장 버튼은 UI만 표시, 실제 저장 금지 (Phase5-2에서 구현)
 */

import { useState } from "react";
import { parseExcelFile } from "./excelParser";
import { validateRows } from "./validator";
import type { ValidationResult } from "./excelTypes";

export type ExcelUploadPanelProps = {
  recordDate: string; // Unique Key 생성용
  onClose: () => void;
};

export default function ExcelUploadPanel(props: ExcelUploadPanelProps) {
  const { recordDate, onClose } = props;

  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
      setError("");
    }
  };

  // 파싱 & 검증
  const handleParse = async () => {
    if (!file) {
      setError("파일을 선택하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1단계: 파싱
      const result = await parseExcelFile(file);

      if (!result.success) {
        setError(result.error || "파싱 실패");
        setLoading(false);
        return;
      }

      // 2단계: 검증
      const validated = validateRows(result.rows, recordDate);
      setValidationResult(validated);
    } catch (err: any) {
      setError(`오류: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  // 저장 (Phase5-1에서는 비활성화, Phase5-2에서 구현)
  const handleSave = () => {
    alert("저장 기능은 Phase5-2에서 구현 예정입니다.");
  };

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)", padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>엑셀 업로드 (생산 항목)</h3>

      {/* 파일 선택 */}
      <div style={{ marginTop: 12 }}>
        <label className="p" style={{ display: "block", marginBottom: 8 }}>
          엑셀 파일 선택 (.xlsx, .xls)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: 12 }}
        />
        {file && <p className="p" style={{ marginTop: 6 }}>선택된 파일: {file.name}</p>}
      </div>

      {/* 파싱 & 검증 버튼 */}
      <div className="row" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn primary"
          onClick={handleParse}
          disabled={!file || loading}
        >
          {loading ? "처리 중..." : "파싱 & 검증"}
        </button>
        <button type="button" className="btn" onClick={onClose}>
          닫기
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "rgba(255,0,0,0.1)",
            border: "1px solid rgba(255,0,0,0.3)",
            borderRadius: 4,
          }}
        >
          <p className="p" style={{ marginTop: 0, color: "#ff6b6b" }}>
            ❌ {error}
          </p>
        </div>
      )}

      {/* 검증 결과 */}
      {validationResult && (
        <div style={{ marginTop: 20 }}>
          {/* 통계 */}
          <div
            style={{
              padding: 12,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              marginBottom: 12,
            }}
          >
            <p className="p" style={{ marginTop: 0, marginBottom: 8 }}>
              <strong>검증 결과</strong>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <div className="p" style={{ fontSize: 12, opacity: 0.7 }}>총 행수</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{validationResult.totalRows}</div>
              </div>
              <div>
                <div className="p" style={{ fontSize: 12, opacity: 0.7 }}>OK</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#51cf66" }}>
                  {validationResult.okRows}
                </div>
              </div>
              <div>
                <div className="p" style={{ fontSize: 12, opacity: 0.7 }}>FAIL</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#ff6b6b" }}>
                  {validationResult.failRows}
                </div>
              </div>
              <div>
                <div className="p" style={{ fontSize: 12, opacity: 0.7 }}>저장 가능</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: validationResult.canSave ? "#51cf66" : "#ff6b6b" }}>
                  {validationResult.canSave ? "✅" : "❌"}
                </div>
              </div>
            </div>
            {!validationResult.canSave && (
              <p className="p" style={{ marginTop: 12, marginBottom: 0, color: "#ff6b6b" }}>
                ⚠️ Policy A: FAIL 행이 있으면 저장 불가 (파일 수정 후 재업로드)
              </p>
            )}
          </div>

          {/* 행별 결과 테이블 */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>행</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>상태</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>근무</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>생산품</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>품목</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>자루</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>Kg</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>비고</th>
                  <th style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>에러</th>
                </tr>
              </thead>
              <tbody>
                {validationResult.rows.map((row) => (
                  <tr
                    key={row.rowIndex}
                    style={{
                      background:
                        row.status === "OK"
                          ? "rgba(81,207,102,0.05)"
                          : row.status === "FAIL"
                          ? "rgba(255,107,107,0.05)"
                          : "rgba(255,193,7,0.05)",
                    }}
                  >
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.rowIndex}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontWeight: 900,
                        color:
                          row.status === "OK"
                            ? "#51cf66"
                            : row.status === "FAIL"
                            ? "#ff6b6b"
                            : "#ffc107",
                      }}
                    >
                      {row.status}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.shift}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.product}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.item}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.bags}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.kg || "-"}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                      {row.data.memo || "-"}
                    </td>
                    <td style={{ padding: 8, border: "1px solid rgba(255,255,255,0.1)", color: "#ff6b6b" }}>
                      {row.errors.length > 0 ? (
                        <div>
                          {row.errors.map((err, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                              • {err.message}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 저장 버튼 (Phase5-1에서는 비활성화) */}
          <div className="row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleSave}
              disabled
              title="Phase5-2에서 구현 예정"
            >
              저장 (Phase5-2에서 구현 예정)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

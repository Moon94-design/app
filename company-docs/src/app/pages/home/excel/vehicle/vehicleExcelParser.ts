/**
 * vehicleExcelParser.ts
 * 차량 엑셀 파싱 및 검증
 *  
 * 파일 예시: company-docs/1/차량관리.xls.xlsx
 * - 헤더 행: 2번째 행(index 1)
 * - 필수 컬럼: 차량번호, 차량규격(톤수), 차량종류(형태)
 * 
 * 정규화 규칙:
 * - 톤수: 0.5 → "1t", 1 → "1t", 5 → "5t", 25 → "25t", 그 외 → "" (미완성)
 * - 형태: "카고" 포함 → "카고", 그 외 → "" (미완성)
 * 
 * 검증/상태:
 * - INCOMPLETE: vehicleNo 존재 + (중복 없음) - 엑셀에는 운송사/기사명/연락처가 없으므로 모두 미완성
 * - FAIL: vehicleNo 없음 OR 중복 충돌
 * 
 * 적용 정책:
 * - FAIL 건은 제외하고 INCOMPLETE만 등록 가능
 * - 관리 페이지에서 운송사/기사명/연락처를 추가해야 완성
 */

import * as XLSX from "xlsx";
import type { Vehicle, TonClass, BodyType } from "./vehicleTypes";
import type { VehicleExcelRow, VehicleParsedRow, VehicleParseResult, ParseStatus } from "./vehicleExcelTypes";

/**
 * 헤더 행 찾기
 * - 차량관리.xls.xlsx는 2번째 행(index 1)이 헤더
 * - "차량번호" 포함된 행을 찾음
 */
function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = 0; r <= range.e.r; r++) {
    const row: string[] = [];
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      row.push(cell ? String(cell.v || "").trim() : "");
    }
    if (row.includes("차량번호")) {
      return r;
    }
  }
  return 0;
}

/**
 * 톤수 정규화
 * - 0.5 → "1t"
 * - 1, 1.0 → "1t"
 * - 5, 5.0 → "5t"
 * - 25, 25.0 → "25t"
 * - 그 외 → "" (미완성)
 */
function normalizeTon(raw: any): TonClass {
  const num = parseFloat(String(raw || "").trim());
  if (isNaN(num)) return "";
  
  if (num === 0.5 || num === 1 || num === 1.0) return "1t";
  if (num === 5 || num === 5.0) return "5t";
  if (num === 25 || num === 25.0) return "25t";
  
  return ""; // 미완성
}

/**
 * 형태 정규화
 * - "카고" 포함 → "카고"
 * - 그 외 → "" (미완성)
 * 
 * 예: "01:카고" → "카고"
 *     "06:기타" → ""
 */
function normalizeBodyType(raw: any): BodyType {
  const str = String(raw || "").trim();
  if (str.includes("카고")) return "카고";
  if (str.includes("윙")) return "윙";
  if (str.includes("방통")) return "방통";
  
  return ""; // 미완성
}

/**
 * 차량번호 정규화
 * - 공백 제거
 * - 빈값이면 null 반환 (FAIL 처리용)
 */
function normalizeVehicleNo(raw: any): string | null {
  const str = String(raw ||"").trim().replace(/\s+/g, "");
  return str === "" ? null : str;
}

/**
 * 엑셀 파일 파싱
 * @param file 엑셀 파일
 * @param existingVehicleNos 기존 DB에 있는 차량번호 배열 (충돌 검증)
 * @returns 파싱 결과
 */
export async function parseVehicleExcel(
  file: File,
  existingVehicleNos: string[]
): Promise<VehicleParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("파일 읽기 실패"));

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("파일 데이터 없음");

        // xlsx 파싱 (xls도 지원)
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames.find((s) => s.includes("차량")) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) throw new Error("시트가 없습니다");

        // 헤더 행 찾기
        const headerRowIndex = findHeaderRow(sheet);
        
        // JSON 변환
        const rawRows: VehicleExcelRow[] = XLSX.utils.sheet_to_json(sheet, { 
          defval: "",
          range: headerRowIndex,
        });
        
        if (rawRows.length === 0) {
          return resolve({
            total: 0,
            ok: 0,
            incomplete: 0,
            fail: 0,
            rows: [],
            duplicates: [],
            dbConflicts: [],
          });
        }

        // 파싱 & 검증
        const parsedRows: VehicleParsedRow[] = [];
        const seenVehicleNos = new Set<string>();
        const duplicates: string[] = [];
        const dbConflicts: string[] = [];

        rawRows.forEach((row, idx) => {
          const rowIndex = headerRowIndex + idx + 2; // 엑셀 행 번호 (1-based)
          const errors: string[] = [];
          const warnings: string[] = [];

          // 차량번호 정규화
          const vehicleNo = normalizeVehicleNo(row["차량번호"]);
          if (!vehicleNo) {
            errors.push("차량번호 필수");
          }

          // 중복 검증 (엑셀 내부)
          if (vehicleNo) {
            if (seenVehicleNos.has(vehicleNo)) {
              errors.push(`엑셀 내부 중복 (${vehicleNo})`);
              if (!duplicates.includes(vehicleNo)) {
                duplicates.push(vehicleNo);
              }
            } else {
              seenVehicleNos.add(vehicleNo);
            }

            // DB 충돌 검증
            if (existingVehicleNos.includes(vehicleNo)) {
              errors.push(`DB 충돌 (${vehicleNo})`);
              if (!dbConflicts.includes(vehicleNo)) {
                dbConflicts.push(vehicleNo);
              }
            }
          }

          // 톤수/형태 정규화
          const tonClass = normalizeTon(row["차량규격"]);
          const bodyType = normalizeBodyType(row["차량종류"]);

          // 미완성 체크
          if (!tonClass) {
            warnings.push("톤수 미완성 (수동 입력 필요)");
          }
          if (!bodyType) {
            warnings.push("형태 미완성 (수동 입력 필요)");
          }
          // 엑셀에는 운송사/기사명/연락처가 없으므로 항상 미완성
          warnings.push("운송사/기사명/연락처 미입력 (관리에서 추가 필요)");

          // 상태 결정
          let status: ParseStatus = "INCOMPLETE"; // 엑셀에서는 항상 미완성
          if (errors.length > 0) {
            status = "FAIL";
          }

          // 데이터 구성
          const data: Partial<Vehicle> = {
            vehicleNo: vehicleNo || "",
            tonClass,
            bodyType,
            source: "excel",
          };

          parsedRows.push({
            rowIndex,
            status,
            errors,
            warnings,
            data,
          });
        });

        // 통계 (엑셀에서는 OK가 없음, 모두 INCOMPLETE 또는 FAIL)
        const ok = 0; // 엑셀에서는 OK 없음
        const incomplete = parsedRows.filter((r) => r.status === "INCOMPLETE").length;
        const fail = parsedRows.filter((r) => r.status === "FAIL").length;

        resolve({
          total: parsedRows.length,
          ok,
          incomplete,
          fail,
          rows: parsedRows,
          duplicates,
          dbConflicts,
        });
      } catch (err: any) {
        reject(new Error(`파싱 실패: ${err.message || String(err)}`));
      }
    };

    reader.readAsBinaryString(file);
  });
}

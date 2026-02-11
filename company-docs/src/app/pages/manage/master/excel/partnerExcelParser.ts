/**
 * partnerExcelParser.ts
 * 거래처 엑셀 파싱 및 검증
 */

import * as XLSX from "xlsx";
import type { PartnerBase } from "../../../register/partner/partnerV2Types";
import type { PartnerExcelRow, PartnerParsedRow, PartnerParseResult } from "./partnerExcelTypes";

// 컬럼 헤더 alias 매핑
const HEADER_MAP: Record<string, keyof PartnerBase> = {
  "거래처코드": "partnerCode",
  "거래처명": "partnerName",
  "대표자명": "ceoName",
  "전화": "phone",
  "우편번호": "zip",
  "주소": "addr1",
  "상세주소": "addr2",
  "담당자": "contactName",
  "핸드폰": "contactPhone",
  "사업자번호": "businessNo",
  "이메일": "email",
  "팩스": "fax",
  "업태": "businessType",
  "종목": "businessItem",
  "법인번호": "corporateNo",
};

// 필수 필드
const REQUIRED_FIELDS: (keyof PartnerBase)[] = ["partnerCode", "partnerName"];

function readWorkbookWithFallback(data: ArrayBuffer): XLSX.WorkBook {
  const attempts: Array<() => XLSX.WorkBook> = [
    () => XLSX.read(data, { type: "array" }),
    () => XLSX.read(data, { type: "array", codepage: 949 }),
    () => {
      const bytes = new Uint8Array(data);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return XLSX.read(binary, { type: "binary", codepage: 949 });
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      return attempt();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("엑셀 파싱 실패");
}

/**
 * 헤더 행 탐색 (예: 6번째 행)
 * "거래처코드"와 "거래처명" 모두 포함된 행을 찾음
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
    // 필수 헤더 존재 확인
    if (row.includes("거래처코드") && row.includes("거래처명")) {
      return r;
    }
  }
  return 0; // 기본 첫 행
}

/**
 * 엑셀 파일 파싱
 * @param file 엑셀 파일
 * @param existingCodes 기존 DB에 있는 partnerCode 배열 (충돌 검증)
 * @returns 파싱 결과
 */
export async function parsePartnerExcel(
  file: File,
  existingCodes: string[]
): Promise<PartnerParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("파일 읽기 실패"));

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!(data instanceof ArrayBuffer)) {
          throw new Error("파일 데이터(ArrayBuffer) 없음");
        }

        // xlsx/xls 파싱 (fallback 포함)
        const workbook = readWorkbookWithFallback(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error("시트가 없습니다");

        // 헤더 행 찾기 (예: Row 6)
        const headerRowIndex = findHeaderRow(firstSheet);
        
        // JSON 변환 (헤더 행 지정)
        const rawRows: PartnerExcelRow[] = XLSX.utils.sheet_to_json(firstSheet, { 
          defval: "",
          range: headerRowIndex, // 헤더 시작 행
        });
        if (rawRows.length === 0) {
          return resolve({
            total: 0,
            ok: 0,
            fail: 0,
            rows: [],
            duplicates: [],
            dbConflicts: [],
          });
        }

        // 파싱 & 검증
        const parsedRows: PartnerParsedRow[] = [];
        const seenCodes = new Set<string>();
        const duplicates: string[] = [];
        const dbConflicts: string[] = [];

        rawRows.forEach((row, idx) => {
          const rowIndex = headerRowIndex + idx + 2; // 헤더 행 + 데이터 오프셋
          const errors: string[] = [];
          const mapped: Partial<PartnerBase> = {};
          let faxMapped = false; // 팩스 중복 처리 (첫 번째만)

          // 헤더 매핑
          Object.entries(row).forEach(([header, value]) => {
            const field = HEADER_MAP[header];
            if (field) {
              // 팩스 중복 처리: 첫 번째만 매핑
              if (field === "fax" && faxMapped) {
                return;
              }
              mapped[field] = String(value || "").trim();
              if (field === "fax") {
                faxMapped = true;
              }
            }
          });

          // 필수 검증
          REQUIRED_FIELDS.forEach((field) => {
            if (!mapped[field] || mapped[field] === "") {
              errors.push(`${String(field)} 필수`);
            }
          });

          // 중복 검증 (엑셀 내부)
          const code = mapped.partnerCode || "";
          if (code) {
            if (seenCodes.has(code)) {
              errors.push(`엑셀 내부 중복 (${code})`);
              if (!duplicates.includes(code)) {
                duplicates.push(code);
              }
            } else {
              seenCodes.add(code);
            }

            // DB 충돌 검증
            if (existingCodes.includes(code)) {
              errors.push(`DB 충돌 (${code})`);
              if (!dbConflicts.includes(code)) {
                dbConflicts.push(code);
              }
            }
          }

          parsedRows.push({
            rowIndex,
            status: errors.length > 0 ? "FAIL" : "OK",
            errors,
            data:
              errors.length > 0
                ? null
                : {
                    partnerCode: mapped.partnerCode || "",
                    partnerName: mapped.partnerName || "",
                    ceoName: mapped.ceoName || "",
                    phone: mapped.phone || "",
                    zip: mapped.zip || "",
                    addr1: mapped.addr1 || "",
                    addr2: mapped.addr2 || "",
                    contactName: mapped.contactName || "",
                    contactPhone: mapped.contactPhone || "",
                    businessNo: mapped.businessNo || "",
                    email: mapped.email || "",
                    fax: mapped.fax || "",
                    businessType: mapped.businessType || "",
                    businessItem: mapped.businessItem || "",
                    corporateNo: mapped.corporateNo || "",
                  },
          });
        });

        const ok = parsedRows.filter((r) => r.status === "OK").length;
        const fail = parsedRows.filter((r) => r.status === "FAIL").length;

        resolve({
          total: parsedRows.length,
          ok,
          fail,
          rows: parsedRows,
          duplicates,
          dbConflicts,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

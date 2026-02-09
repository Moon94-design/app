/**
 * weighingParser.ts
 * 계량현황 엑셀 파싱 및 검증 (디버그 출력 강화)
 */

import * as XLSX from "xlsx";
import type { WeighingTransaction, WeighingExcelRow, WeighingParsedRow, WeighingParseResult } from "./weighingTypes";

// 컬럼 헤더 alias 매핑
const HEADER_MAP: Record<string, keyof WeighingTransaction> = {
  "번호": "ticketNo",
  "계량일자": "date",
  "순번": "seq",
  "구분": "directionRaw", // 원문 저장
  "입출여부": "inOut",
  "거래처ID": "partnerCode", // 거래처 코드 (연계 키)
  "거래처": "partnerName",
  "거래처명": "partnerName",
  "차량번호": "vehicleNo",
  "품목": "itemName",
  "품목명": "itemName",
  "품명": "itemName",
  "품목코드": "itemCode",
  "총중량": "gross",
  "공차중량": "tare",
  "실중량": "net",
  "인계중량": "handover",
  "인계량": "handover",
  "단가": "unitPrice",
  "금액": "amount",
  "비고": "note",
};

// 필수 필드 (ticketNo만 필수)
const REQUIRED_FIELDS: (keyof WeighingTransaction)[] = ["ticketNo"];

/**
 * 헤더 행 확정 (고정: 6행 = 0-indexed 5)
 * 사용자 확인: 실제 엑셀에서 6행이 헤더
 */
function getHeaderRow(sheet: XLSX.WorkSheet): { rowIndex: number; headers: string[] } {
  const HEADER_ROW_INDEX = 5; // 6행 (1-based) = 5 (0-indexed)
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const headers: string[] = [];
  
  for (let c = 0; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: HEADER_ROW_INDEX, c });
    const cell = sheet[addr];
    headers.push(cell ? String(cell.v || "").trim() : "");
  }
  
  return { rowIndex: HEADER_ROW_INDEX, headers };
}

/**
 * 날짜 파싱 강화 (여러 포맷 지원)
 */
function parseDate(value: any): string | null {
  if (!value) return null;

  // 엑셀 시리얼 날짜 (숫자)
  if (typeof value === "number") {
    try {
      const date = XLSX.SSF.parse_date_code(value);
      if (date && date.y && date.m && date.d) {
        const year = date.y;
        const month = String(date.m).padStart(2, "0");
        const day = String(date.d).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // 파싱 실패 시 null 반환
    }
  }

  // 문자열 날짜
  if (typeof value === "string") {
    const trimmed = value.trim();
    
    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    let cleaned = trimmed.replace(/[\/\.]/g, "-");
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) {
      const parts = cleaned.split("-");
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    
    // YYYYMMDD
    if (/^\d{8}$/.test(trimmed)) {
      const year = trimmed.substring(0, 4);
      const month = trimmed.substring(4, 6);
      const day = trimmed.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
  }

  // Date 객체
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  return null;
}

/**
 * 숫자 파싱 (0이면 0 반환)
 */
function parseNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * 데이터 행 판정 (요약행/빈 행 제외)
 * 종료 조건:
 * - ticketNo 없음
 * - 계량일자(dateRaw) 없음
 * - 요약 키워드: 운행수/소계/합계/[대괄호]
 */
function isDataRow(mapped: Partial<WeighingTransaction>, rawRow: WeighingExcelRow): boolean {
  const ticketNo = String(mapped.ticketNo || "").trim();
  const dateRaw = String(mapped.dateRaw || "").trim();
  
  // ticketNo나 dateRaw가 없으면 데이터 아님
  if (!ticketNo && !dateRaw) return false;
  
  // 요약행 패턴 제외
  const combinedText = `${ticketNo} ${dateRaw}`.toLowerCase();
  if (combinedText.includes("운행수")) return false;
  if (combinedText.includes("소 계") || combinedText.includes("소계")) return false;
  if (combinedText.includes("합계")) return false;
  if (combinedText.includes("[") || combinedText.includes("]")) return false;
  
  // Raw row의 첫 컬럼들도 체크 (안전장치)
  const firstCols = Object.values(rawRow).slice(0, 5).map(v => String(v || "").toLowerCase()).join(" ");
  if (firstCols.includes("운행수") || firstCols.includes("소계") || firstCols.includes("합계")) {
    return false;
  }

  return true;
}

/**
 * 엑셀 파일 파싱
 * @param file 엑셀 파일
 * @param existingTicketNos 기존 DB에 있는 ticketNo 배열 (충돌 검증)
 * @returns 파싱 결과 (디버그 정보 포함)
 */
export async function parseWeighingExcel(
  file: File,
  existingTicketNos: string[]
): Promise<WeighingParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("파일 읽기 실패"));

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("파일 데이터 없음");

        console.log("=== 계량현황 파싱 시작 ===");

        // xlsx 파싱
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        
        // 시트 선택: "계량현황" 시트 우선, 없으면 첫 시트
        let sheetName = workbook.SheetNames.find(name => name.includes("계량현황"));
        if (!sheetName) sheetName = workbook.SheetNames[0];
        
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) throw new Error("시트가 없습니다");

        console.log(`시트: ${sheetName}`);

        // 헤더 행 확정 (6행 고정)
        const { rowIndex: headerRowIndex, headers: headerColumns } = getHeaderRow(sheet);
        console.log(`헤더 행: ${headerRowIndex + 1} (고정), 헤더: ${headerColumns.filter(Boolean).slice(0, 10).join(", ")}...`);

        // 전체 행 수 확인
        const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
        const totalSheetRows = range.e.r + 1;
        console.log(`시트 전체 행 수: ${totalSheetRows}`);

        // 상단 10행 미리보기 (2D array)
        const sampleRawRows: any[][] = [];
        for (let r = 0; r < Math.min(10, range.e.r + 1); r++) {
          const row: any[] = [];
          for (let c = 0; c <= Math.min(range.e.c, 20); c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const cell = sheet[addr];
            row.push(cell ? cell.v : "");
          }
          sampleRawRows.push(row);
        }
        console.log("상단 미리보기 (1-10행, 처음 15열):");
        sampleRawRows.forEach((row, idx) => {
          console.log(`  Row ${idx + 1}: ${row.slice(0, 15).join(" | ")}`);
        });
        
        // JSON 변환 (헤더=6행, 데이터=7행부터)
        const rawRows: WeighingExcelRow[] = XLSX.utils.sheet_to_json(sheet, { 
          defval: "",
          range: headerRowIndex, // 6행(0-indexed=5)부터
          raw: true, // 날짜를 숫자로 유지 (parseDate에서 처리)
        });
        
        console.log(`JSON 변환 후 raw 행 수: ${rawRows.length}`);

        if (rawRows.length === 0) {
          console.warn("⚠️ JSON 변환 후 0건 (헤더 이후 데이터 없음)");
          return resolve({
            total: 0,
            ok: 0,
            fail: 0,
            incomplete: 0,
            rows: [],
            duplicates: [],
            debug: {
              headerRowIndex,
              sheetName,
              totalSheetRows,
              rawRowsCount: 0,
              afterFilterCount: 0,
              headerColumns: headerColumns.filter(Boolean),
              mappedFields: [],
              sampleRawRows,
            },
          });
        }

        // 파싱 & 검증
        const parsedRows: WeighingParsedRow[] = [];
        const seenTicketNos = new Set<string>();
        const duplicates: string[] = [];
        const mappedFieldsSet = new Set<string>();
        let okCount = 0;
        let failCount = 0;
        let incompleteCount = 0;
        let skippedCount = 0; // 데이터 행 판정 실패 (요약행 등)

        rawRows.forEach((row, idx) => {
          const rowIndex = headerRowIndex + idx + 2;
          const errors: string[] = [];
          const warnings: string[] = [];
          const mapped: Partial<WeighingTransaction> = {};

          // 헤더 매핑
          Object.entries(row).forEach(([header, value]) => {
            const field = HEADER_MAP[header];
            if (field) {
              mappedFieldsSet.add(field);
              
              if (field === "date") {
                // dateRaw: 원본 값 그대로 저장
                mapped["dateRaw"] = String(value || "");
                
                // date: 파싱 시도
                const parsed = parseDate(value);
                if (parsed) {
                  mapped[field] = parsed;
                } else {
                  // 파싱 실패 시 빈 문자열 (경고만)
                  mapped[field] = "";
                  if (value) {
                    warnings.push(`날짜 파싱 실패 (${value})`);
                  }
                }
              } else if (field === "directionRaw") {
                // directionRaw: 원문 저장
                const raw = String(value || "").trim();
                mapped["directionRaw"] = raw as any;
                
                // direction: BUY/SELL 정규화
                if (raw.includes("매입") || raw.includes("BUY") || raw.toUpperCase().includes("BUY")) {
                  mapped["direction"] = "BUY" as any;
                } else if (raw.includes("매출") || raw.includes("SELL") || raw.toUpperCase().includes("SELL")) {
                  mapped["direction"] = "SELL" as any;
                } else {
                  mapped["direction"] = "" as any;
                }
              } else if (field === "seq" || field === "gross" || field === "tare" || field === "net" || field === "handover" || field === "unitPrice" || field === "amount") {
                mapped[field] = parseNumber(value) as any;
              } else {
                mapped[field] = String(value || "").trim() as any;
              }
            }
          });

          // direction 보조 (inOut에서 추출, direction이 비어있을 때)
          if (!mapped.direction) {
            const inOut = String(mapped.inOut || "").trim();
            if (inOut.includes("입고") || inOut === "입고" || inOut.startsWith("1")) {
              mapped.direction = "BUY" as any;
            } else if (inOut.includes("출고") || inOut === "출고" || inOut.startsWith("2")) {
              mapped.direction = "SELL" as any;
            }
          }

          // 데이터 행 판정 (ticketNo/dateRaw 체크)
          if (!isDataRow(mapped, row)) {
            // 요약행 또는 빈 행 → 건너뛰기 (파싱 결과에 포함하지 않음)
            skippedCount++;
            return;
          }

          // 필수 검증
          REQUIRED_FIELDS.forEach((field) => {
            if (!mapped[field] || mapped[field] === "") {
              errors.push(`${String(field)} 필수`);
            }
          });

          // 중복 검증 (엑셀 내부)
          const ticketNo = mapped.ticketNo || "";
          if (ticketNo) {
            if (seenTicketNos.has(ticketNo)) {
              errors.push(`엑셀 내부 중복 (${ticketNo})`);
              if (!duplicates.includes(ticketNo)) {
                duplicates.push(ticketNo);
              }
            } else {
              seenTicketNos.add(ticketNo);
            }

            // DB 충돌 검증
            if (existingTicketNos.includes(ticketNo)) {
              errors.push(`DB 충돌 (${ticketNo})`);
              if (!duplicates.includes(ticketNo)) {
                duplicates.push(ticketNo);
              }
            }
          }

          // 경고를 에러에 추가 (정보성)
          if (warnings.length > 0) {
            errors.push(...warnings.map(w => `⚠️ ${w}`));
          }

          // 미완료 판정: gross/tare 중 하나라도 0이면 INCOMPLETE
          const gross = mapped.gross || 0;
          const tare = mapped.tare || 0;
          const unitPrice = mapped.unitPrice || 0;
          const isIncomplete = gross === 0 || tare === 0;
          const isPriceIncomplete = unitPrice === 0; // 하위 호환

          let status: "OK" | "FAIL" | "INCOMPLETE" = "OK";
          if (errors.filter(e => !e.startsWith("⚠️")).length > 0) {
            // 경고가 아닌 에러가 있으면 FAIL
            status = "FAIL";
            failCount++;
          } else if (isIncomplete) {
            status = "INCOMPLETE";
            incompleteCount++;
          } else {
            okCount++;
          }

          parsedRows.push({
            rowIndex,
            status,
            data: { ...mapped, isIncomplete, isPriceIncomplete } as any,
            errors,
          });
        });

        console.log(`데이터 행 필터 후: ${parsedRows.length}건 (스킵: ${skippedCount}건)`);
        console.log(`OK: ${okCount}, FAIL: ${failCount}, INCOMPLETE: ${incompleteCount}`);
        console.log(`매핑된 필드: ${Array.from(mappedFieldsSet).join(", ")}`);

        resolve({
          total: parsedRows.length,
          ok: okCount,
          fail: failCount,
          incomplete: incompleteCount,
          rows: parsedRows,
          duplicates,
          debug: {
            headerRowIndex,
            sheetName,
            totalSheetRows,
            rawRowsCount: rawRows.length,
            afterFilterCount: parsedRows.length,
            headerColumns: headerColumns.filter(Boolean),
            mappedFields: Array.from(mappedFieldsSet),
            sampleRawRows,
          },
        });
      } catch (err: any) {
        console.error("❌ 파싱 실패:", err);
        reject(new Error(`파싱 실패: ${err.message}`));
      }
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * excelParser.ts
 * 엑셀 파일 파싱 (SheetJS)
 * 
 * 역할:
 * - 엑셀 파일 읽기 (File API)
 * - SheetJS로 파싱
 * - 컬럼 헤더 매핑 (한국어/영문 alias)
 * - ParsedRow[] 반환
 */

import * as XLSX from "xlsx";
import type { ParseResult, ParsedRow } from "./excelTypes";

// 컬럼 alias 매핑 (한국어 → 정규화)
const COLUMN_MAP: Record<string, string> = {
  // shift
  근무: "shift",
  근무시간: "shift",
  시간대: "shift",
  shift: "shift",
  workshift: "shift",
  time: "shift",
  // product
  생산품: "product",
  제품: "product",
  생산제품: "product",
  product: "product",
  item_type: "product",
  production: "product",
  // item
  품목: "item",
  제품명: "item",
  아이템: "item",
  item: "item",
  product_name: "item",
  material: "item",
  // bags
  자루: "bags",
  자루수: "bags",
  개수: "bags",
  bags: "bags",
  quantity: "bags",
  count: "bags",
  // kg
  kg: "kg",
  Kg: "kg",
  무게: "kg",
  중량: "kg",
  weight: "kg",
  mass: "kg",
  // memo
  비고: "memo",
  메모: "memo",
  특이사항: "memo",
  memo: "memo",
  note: "memo",
  remark: "memo",
};

// 헤더 정규화 (대소문자, 공백 제거)
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

// 컬럼명 매핑
function mapColumn(header: string): string | null {
  const normalized = normalizeHeader(header);
  // 정확 매칭 시도
  if (COLUMN_MAP[header]) return COLUMN_MAP[header];
  if (COLUMN_MAP[normalized]) return COLUMN_MAP[normalized];
  // 부분 매칭 (포함)
  for (const [key, value] of Object.entries(COLUMN_MAP)) {
    if (normalized.includes(normalizeHeader(key))) return value;
  }
  return null;
}

// 엑셀 파일 파싱
export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    // 파일 읽기
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // 시트 선택: LINES 또는 첫 시트
    let sheetName = workbook.SheetNames.find((name) =>
      normalizeHeader(name).includes("lines")
    );
    if (!sheetName) sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        rows: [],
        error: "시트를 찾을 수 없습니다.",
      };
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return {
        success: false,
        rows: [],
        error: `시트 '${sheetName}'를 읽을 수 없습니다.`,
      };
    }

    // JSON 변환 (header: 1 → 배열 형태)
    const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (jsonData.length < 2) {
      return {
        success: false,
        rows: [],
        error: "데이터가 없습니다. (헤더 + 최소 1행 필요)",
      };
    }

    // 헤더 행 (첫 행)
    const headerRow = jsonData[0];
    const columnMapping: Record<number, string> = {};
    headerRow.forEach((header: any, colIndex: number) => {
      if (typeof header === "string") {
        const mapped = mapColumn(header);
        if (mapped) columnMapping[colIndex] = mapped;
      }
    });

    // 필수 컬럼 확인
    const requiredColumns = ["shift", "product", "item", "bags"];
    const mappedColumns = Object.values(columnMapping);
    const missingColumns = requiredColumns.filter(
      (col) => !mappedColumns.includes(col)
    );
    if (missingColumns.length > 0) {
      return {
        success: false,
        rows: [],
        error: `필수 컬럼 누락: ${missingColumns.join(", ")}`,
      };
    }

    // 데이터 행 파싱 (2행부터)
    const rows: ParsedRow[] = [];
    for (let i = 1; i < jsonData.length; i++) {
      const dataRow = jsonData[i];
      const rowIndex = i + 1; // 1-based (엑셀 행 번호)

      // 빈 행 건너뛰기
      if (!dataRow || dataRow.every((cell) => cell === undefined || cell === null || cell === "")) {
        continue;
      }

      const parsedRow: any = { rowIndex };
      Object.entries(columnMapping).forEach(([colIndex, columnName]) => {
        const cellValue = dataRow[Number(colIndex)];
        parsedRow[columnName] = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : "";
      });

      rows.push(parsedRow as ParsedRow);
    }

    return {
      success: true,
      rows,
      templateVersion: "v1.0", // 추후 메타데이터에서 추출
    };
  } catch (error: any) {
    return {
      success: false,
      rows: [],
      error: `파싱 오류: ${error.message || "알 수 없는 오류"}`,
    };
  }
}

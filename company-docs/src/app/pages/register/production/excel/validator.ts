/**
 * validator.ts
 * 엑셀 데이터 검증 로직
 * 
 * 역할:
 * - 필수값 검증 (shift, product, item, bags)
 * - 타입 검증 (bags, kg는 숫자)
 * - 허용값 검증 (shift, product, item)
 * - 중복키 검증 (엑셀 내부 중복)
 * 
 * 정책:
 * - Policy A: FAIL 1건이라도 있으면 canSave = false
 * - 충돌 정책: Error (중복키 발견 시 FAIL)
 */

import type { Shift, Product, Item } from "../../../../../ssot";
import type {
  ParsedRow,
  ValidatedRow,
  ValidationResult,
  ValidationError,
  ValidationStatus,
} from "./excelTypes";

// 대소문자 무시 매핑
const SHIFT_MAP: Record<string, Shift | null> = {
  주간: "주간",
  오후: "오후",
  야간: "야간",
  day: "주간",
  afternoon: "오후",
  night: "야간",
};

const PRODUCT_MAP: Record<string, Product | null> = {
  분쇄품: "분쇄품",
  펠렛: "펠렛",
  crushed: "분쇄품",
  pellet: "펠렛",
};

const ITEM_MAP: Record<string, Item | null> = {
  pp: "PP",
  pe: "PE",
  PP: "PP",
  PE: "PE",
};

// 값 정규화 (소문자, 공백 제거)
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

// shift 매핑
function mapShift(value: string): Shift | null {
  const normalized = normalize(value);
  // 정확 매칭
  if (SHIFT_MAP[value]) return SHIFT_MAP[value];
  if (SHIFT_MAP[normalized]) return SHIFT_MAP[normalized];
  return null;
}

// product 매핑
function mapProduct(value: string): Product | null {
  const normalized = normalize(value);
  if (PRODUCT_MAP[value]) return PRODUCT_MAP[value];
  if (PRODUCT_MAP[normalized]) return PRODUCT_MAP[normalized];
  return null;
}

// item 매핑
function mapItem(value: string): Item | null {
  const normalized = normalize(value);
  if (ITEM_MAP[value]) return ITEM_MAP[value];
  if (ITEM_MAP[normalized]) return ITEM_MAP[normalized];
  return null;
}

// 숫자 파싱
function parseNumber(value: string | number): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return null;
    return parsed;
  }
  return null;
}

// Unique Key 생성 (recordDate는 나중에 추가, 일단 shift+product+item만)
function generateKey(shift: string, product: string, item: string): string {
  return `${shift}_${product}_${item}`;
}

// 단일 행 검증
function validateRow(row: ParsedRow, recordDate: string): ValidatedRow {
  const errors: ValidationError[] = [];
  let status: ValidationStatus = "OK";

  // 필수값 검증
  if (!row.shift || String(row.shift).trim() === "") {
    errors.push({
      code: "missing_required",
      column: "shift",
      message: "근무 시간대 누락",
    });
  }
  if (!row.product || String(row.product).trim() === "") {
    errors.push({
      code: "missing_required",
      column: "product",
      message: "생산품 누락",
    });
  }
  if (!row.item || String(row.item).trim() === "") {
    errors.push({
      code: "missing_required",
      column: "item",
      message: "품목 누락",
    });
  }
  if (!row.bags || String(row.bags).trim() === "") {
    errors.push({
      code: "missing_required",
      column: "bags",
      message: "자루 수 누락",
    });
  }

  // 허용값 검증 (shift)
  let validatedShift: Shift = "주간";
  if (row.shift && String(row.shift).trim() !== "") {
    const mapped = mapShift(String(row.shift));
    if (!mapped) {
      errors.push({
        code: "unknown_value",
        column: "shift",
        message: `허용되지 않은 근무 시간대: ${row.shift}`,
      });
    } else {
      validatedShift = mapped;
    }
  }

  // 허용값 검증 (product)
  let validatedProduct: Product = "분쇄품";
  if (row.product && String(row.product).trim() !== "") {
    const mapped = mapProduct(String(row.product));
    if (!mapped) {
      errors.push({
        code: "unknown_value",
        column: "product",
        message: `허용되지 않은 생산품: ${row.product}`,
      });
    } else {
      validatedProduct = mapped;
    }
  }

  // 허용값 검증 (item)
  let validatedItem: Item = "PP";
  if (row.item && String(row.item).trim() !== "") {
    const mapped = mapItem(String(row.item));
    if (!mapped) {
      errors.push({
        code: "unknown_value",
        column: "item",
        message: `허용되지 않은 품목: ${row.item}`,
      });
    } else {
      validatedItem = mapped;
    }
  }

  // 타입 검증 (bags)
  let validatedBags = 0;
  if (row.bags !== undefined && row.bags !== null) {
    const parsed = parseNumber(row.bags);
    if (parsed === null) {
      errors.push({
        code: "bad_number",
        column: "bags",
        message: `숫자 변환 실패: ${row.bags}`,
      });
    } else {
      validatedBags = parsed;
    }
  }

  // 타입 검증 (kg, 선택)
  let validatedKg = 0;
  if (row.kg !== undefined && row.kg !== null && String(row.kg).trim() !== "") {
    const parsed = parseNumber(row.kg);
    if (parsed === null) {
      errors.push({
        code: "bad_number",
        column: "kg",
        message: `숫자 변환 실패: ${row.kg}`,
      });
    } else {
      validatedKg = parsed;
    }
  }

  // memo (선택, 문자열 그대로)
  const validatedMemo = row.memo ? String(row.memo).trim() : "";

  // Unique Key 생성
  const key = `${recordDate}_${generateKey(validatedShift, validatedProduct, validatedItem)}`;

  // 상태 결정
  if (errors.length > 0) {
    status = "FAIL";
  }

  return {
    rowIndex: row.rowIndex,
    status,
    data: {
      shift: validatedShift,
      product: validatedProduct,
      item: validatedItem,
      bags: validatedBags,
      kg: validatedKg,
      memo: validatedMemo,
    },
    errors,
    key,
  };
}

// 전체 검증 (중복키 포함)
export function validateRows(
  rows: ParsedRow[],
  recordDate: string
): ValidationResult {
  // 1단계: 개별 행 검증
  const validatedRows = rows.map((row) => validateRow(row, recordDate));

  // 2단계: 중복키 검증 (엑셀 내부 중복)
  const keyMap: Record<string, number[]> = {};
  validatedRows.forEach((row) => {
    if (!keyMap[row.key]) keyMap[row.key] = [];
    keyMap[row.key].push(row.rowIndex);
  });

  // 중복키 발견 시 FAIL 처리
  Object.entries(keyMap).forEach(([_key, rowIndexes]) => {
    if (rowIndexes.length > 1) {
      rowIndexes.forEach((rowIndex) => {
        const row = validatedRows.find((r) => r.rowIndex === rowIndex);
        if (row) {
          row.status = "FAIL";
          row.errors.push({
            code: "dup_key",
            column: "key",
            message: `중복키 발견 (행 ${rowIndexes.join(", ")})`,
          });
        }
      });
    }
  });

  // 3단계: 통계 계산
  const totalRows = validatedRows.length;
  const okRows = validatedRows.filter((r) => r.status === "OK").length;
  const failRows = validatedRows.filter((r) => r.status === "FAIL").length;
  const warnRows = validatedRows.filter((r) => r.status === "WARN").length;

  // Policy A: FAIL 1건이라도 있으면 저장 불가
  const canSave = failRows === 0;

  return {
    totalRows,
    okRows,
    failRows,
    warnRows,
    rows: validatedRows,
    canSave,
  };
}

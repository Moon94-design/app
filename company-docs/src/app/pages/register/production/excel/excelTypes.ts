/**
 * excelTypes.ts
 * 엑셀 업로드 관련 타입 정의
 */

import type { Shift, Product, Item } from "../../../../../ssot";

// 파싱된 행 데이터
export type ParsedRow = {
  rowIndex: number; // 1-based (엑셀 행 번호)
  shift: string;
  product: string;
  item: string;
  bags: string | number;
  kg?: string | number;
  memo?: string;
};

// 검증 결과 상태
export type ValidationStatus = "OK" | "FAIL" | "WARN";

// 에러 코드
export type ErrorCode =
  | "missing_required"
  | "bad_number"
  | "unknown_value"
  | "dup_key"
  | "invalid_format";

// 검증 에러
export type ValidationError = {
  code: ErrorCode;
  column: string;
  message: string;
};

// 검증된 행
export type ValidatedRow = {
  rowIndex: number;
  status: ValidationStatus;
  data: {
    shift: Shift;
    product: Product;
    item: Item;
    bags: number;
    kg: number;
    memo: string;
  };
  errors: ValidationError[];
  key: string; // Unique Key (recordDate + shift + product + item)
};

// 파싱 결과
export type ParseResult = {
  success: boolean;
  rows: ParsedRow[];
  templateVersion?: string;
  error?: string;
};

// 검증 결과
export type ValidationResult = {
  totalRows: number;
  okRows: number;
  failRows: number;
  warnRows: number;
  rows: ValidatedRow[];
  canSave: boolean; // Policy A: failRows === 0
};

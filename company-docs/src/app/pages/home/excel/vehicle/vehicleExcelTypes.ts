/**
 * vehicleExcelTypes.ts
 * 차량 엑셀 파싱 관련 타입
 */

import type { Vehicle } from "./vehicleTypes";

/**
 * 엑셀 원본 행 타입
 */
export interface VehicleExcelRow {
  [key: string]: any;
}

/**
 * 파싱 상태
 */
export type ParseStatus = "OK" | "INCOMPLETE" | "FAIL";

/**
 * 파싱된 행
 */
export interface VehicleParsedRow {
  rowIndex: number; // 엑셀 행 번호 (1-based)
  status: ParseStatus;
  errors: string[]; // FAIL 이유
  warnings: string[]; // INCOMPLETE 이유
  data: Partial<Vehicle>; // 파싱된 데이터
}

/**
 * 파싱 결과
 */
export interface VehicleParseResult {
  total: number; // 전체 행 수
  ok: number; // OK 상태 수
  incomplete: number; // INCOMPLETE 상태 수
  fail: number; // FAIL 상태 수
  rows: VehicleParsedRow[]; // 모든 파싱 행
  duplicates: string[]; // 엑셀 내부 중복 차량번호
  dbConflicts: string[]; // DB 충돌 차량번호
}

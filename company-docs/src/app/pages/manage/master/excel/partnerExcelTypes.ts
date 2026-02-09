/**
 * partnerExcelTypes.ts
 * 거래처 엑셀 업로드 타입 정의
 */

import type { PartnerBase } from "../../../register/partner/partnerV2Types";

// 엑셀 원본 행 (파싱 전)
export type PartnerExcelRow = {
  거래처코드?: string;
  거래처명?: string;
  대표자명?: string;
  전화?: string;
  우편번호?: string;
  주소?: string;
  상세주소?: string;
  담당자?: string;
  핸드폰?: string;
  사업자번호?: string;
  이메일?: string;
  팩스?: string;
  업태?: string;
  종목?: string;
  법인번호?: string;
};

// 파싱 결과 (PartnerBase로 매핑)
export type PartnerParsedRow = {
  rowIndex: number; // 엑셀 행 번호 (1-based)
  status: "OK" | "FAIL";
  errors: string[]; // 에러 메시지 배열
  data: PartnerBase | null; // 파싱 성공 시 데이터
};

// 파싱 전체 결과
export type PartnerParseResult = {
  total: number;
  ok: number;
  fail: number;
  rows: PartnerParsedRow[];
  duplicates: string[]; // 엑셀 내부 중복 partnerCode
  dbConflicts: string[]; // DB와 충돌하는 partnerCode
};

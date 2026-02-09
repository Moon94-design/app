/**
 * weighingTypes.ts
 * 계량현황 엑셀 업로드 타입 정의
 */

/**
 * 계량현황 트랜잭션 (저장 모델)
 */
export type WeighingTransaction = {
  id: string;
  ticketNo: string; // 번호 (고유키)
  dateRaw: string; // 계량일자 원본 (엑셀 값 그대로)
  date: string; // 계량일자 (ISO 8601 YYYY-MM-DD, 파싱 실패 시 "")
  seq: number; // 순번
  directionRaw: string; // 구분 원문 (엑셀 값)
  direction: "BUY" | "SELL" | ""; // 구분 정규화 (BUY=매입, SELL=매출)
  inOut: "입고" | "출고" | ""; // 입출여부
  partnerCode: string; // 거래처ID (거래처 코드, 연계 키)
  partnerId?: string; // 거래처 ID (refs 연계 예정)
  partnerName: string; // 거래처명
  vehicleNo: string; // 차량번호
  itemCode: string; // 품목코드
  itemName: string; // 품목명
  gross: number; // 총중량
  tare: number; // 공차중량
  net: number; // 실중량
  handover: number; // 인계중량
  unitPrice: number; // 단가
  amount: number; // 금액
  note: string; // 비고
  isIncomplete: boolean; // 미완료 플래그 (gross/tare/unitPrice/amount 중 0)
  isPriceIncomplete: boolean; // 단가=0 플래그 (통계 제외용, 하위 호환)
  createdAt: string;
  updatedAt: string;
};

/**
 * 엑셀 원본 행 (헤더 매핑 전)
 */
export type WeighingExcelRow = {
  [key: string]: string | number | Date | undefined | null;
};

/**
 * 파싱된 행 상태
 */
export type WeighingParsedRow = {
  rowIndex: number;
  status: "OK" | "FAIL" | "INCOMPLETE"; // INCOMPLETE = 단가=0
  data: Partial<WeighingTransaction> | null;
  errors: string[];
};

/**
 * 파싱 결과
 */
export type WeighingParseResult = {
  total: number;
  ok: number;
  fail: number;
  incomplete: number; // 단가=0 건수
  rows: WeighingParsedRow[];
  duplicates: string[]; // 중복 ticketNo
  debug?: DebugInfo; // 디버그 정보 (선택)
};

/**
 * 디버그 정보
 */
export type DebugInfo = {
  headerRowIndex: number; // 탐지된 헤더 행 번호
  sheetName: string; // 사용된 시트 이름
  totalSheetRows: number; // 시트 전체 행 수
  rawRowsCount: number; // JSON 변환 후 raw 행 수
  afterFilterCount: number; // 데이터 행 필터 후 행 수
  headerColumns: string[]; // 탐지된 헤더 컬럼들
  mappedFields: string[]; // 매핑된 필드들
  sampleRawRows: any[][]; // 상단 5행 미리보기 (2D array)
};

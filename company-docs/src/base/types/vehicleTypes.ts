/**
 * vehicleTypes.ts
 * 차량 관리 타입 정의
 */

export interface Vehicle {
  id: string;
  vehicleNo: string; // 차량번호 (필수/고유)
  tonClass: "1t" | "5t" | "25t" | ""; // 톤수 분류 (미완성 가능)
  bodyType: "카고" | "윙" | "방통" | ""; // 형태 (미완성 가능)
  carrierName: string; // 운송사
  driverName: string; // 기사명
  driverPhone: string; // 기사 연락처
  tagsText: string; // 태그 (UI 입력)
  memo: string; // 참고사항
  source: "excel" | "manual"; // 등록 출처
  createdAt: number; // 생성 시각 (timestamp)
  updatedAt: number; // 수정 시각 (timestamp)
}

/**
 * 차량 완성도 체크
 */
export function isVehicleComplete(v: Vehicle): boolean {
  return v.tonClass !== "" && v.bodyType !== "";
}

/**
 * 차량 검증
 */
export function validateVehicle(v: Partial<Vehicle>): string[] {
  const errors: string[] = [];
  
  if (!v.vehicleNo || !v.vehicleNo.trim()) {
    errors.push("차량번호는 필수입니다");
  }
  
  return errors;
}

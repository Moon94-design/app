/**
 * vehicleTypes.ts
 * 차량 관련 타입 정의
 */

export type TonClass = "1t" | "5t" | "25t" | "";
export type BodyType = "카고" | "윙" | "방통" | "";
export type VehicleStatus = "incomplete" | "pending" | "complete";

/**
 * Vehicle: 차량 기준정보
 */
export interface Vehicle {
  id: string; // uuid
  vehicleNo: string; // 차량번호 (필수/고유)
  tonClass: TonClass; // 톤수 분류
  bodyType: BodyType; // 형태 분류
  carrierName?: string; // 운송사
  driverName?: string; // 기사명
  driverPhone?: string; // 기사 연락처
  tagsText?: string; // 태그 (UI 입력용)
  memo?: string; // 참고사항
  source?: "excel" | "manual"; // 등록 출처
  status?: VehicleStatus; // 상태 (미입력/보류/완료) - 기본: incomplete
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * 차량 완료 여부 판정 (status 기반)
 */
export function isVehicleComplete(vehicle: Vehicle): boolean {
  const status = vehicle.status || "incomplete";
  return status === "complete";
}

/**
 * 차량 미완성 여부 판정
 */
export function isVehicleIncomplete(vehicle: Vehicle): boolean {
  const status = vehicle.status || "incomplete";
  return status === "incomplete";
}

/**
 * 차량 보류 여부 판정
 */
export function isVehiclePending(vehicle: Vehicle): boolean {
  const status = vehicle.status || "incomplete";
  return status === "pending";
}

/**
 * 차량 완료 가능 여부 (필수 정보 모두 입력됨)
 */
export function canVehicleBeComplete(vehicle: Vehicle): boolean {
  return Boolean(
    vehicle.tonClass &&
    vehicle.bodyType &&
    vehicle.carrierName?.trim() &&
    vehicle.driverName?.trim() &&
    vehicle.driverPhone?.trim()
  );
}

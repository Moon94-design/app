import type { Vehicle, VehicleDraft, VehicleStatus } from "./vehicleTypes";
import { canVehicleBeComplete } from "./vehicleTypes";

export function resolveVehicleStatusFromDraft(
  draft: VehicleDraft,
  currentStatus?: VehicleStatus
): VehicleStatus {
  if (currentStatus === "pending") return "pending";
  return canVehicleBeComplete(draft) ? "complete" : "incomplete";
}

export function resolveVehicleStatusFromRecord(vehicle: Vehicle): VehicleStatus {
  if (vehicle.status === "pending") return "pending";
  return canVehicleBeComplete({
    vehicleNo: vehicle.vehicleNo,
    tonClass: vehicle.tonClass,
    bodyType: vehicle.bodyType,
    carrierName: vehicle.carrierName,
    driverName: vehicle.driverName,
    driverPhone: vehicle.driverPhone,
    tagsText: vehicle.tagsText,
    memo: vehicle.memo,
  })
    ? "complete"
    : "incomplete";
}

export function isVehiclePending(vehicle: Vehicle): boolean {
  return resolveVehicleStatusFromRecord(vehicle) === "pending";
}

export function isVehicleComplete(vehicle: Vehicle): boolean {
  return resolveVehicleStatusFromRecord(vehicle) === "complete";
}

export function isVehicleIncomplete(vehicle: Vehicle): boolean {
  return resolveVehicleStatusFromRecord(vehicle) === "incomplete";
}

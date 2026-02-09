// ORIGIN: copied from src/app/pages/home/excel/vehicle/vehicleTypes.ts (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

export type VehicleTonClass = "" | "1t" | "5t" | "25t";
export type VehicleBodyType = "" | "카고" | "윙" | "방통";
export type VehicleStatus = "incomplete" | "pending" | "complete";

export type Vehicle = {
  id: string;
  vehicleNo: string;
  tonClass: VehicleTonClass;
  bodyType: VehicleBodyType;
  carrierName: string;
  driverName: string;
  driverPhone: string;
  tagsText: string;
  memo: string;
  source: "excel" | "manual";
  status: VehicleStatus;
  createdAt: number;
  updatedAt: number;
};

export type VehicleDraft = {
  vehicleNo: string;
  tonClass: VehicleTonClass;
  bodyType: VehicleBodyType;
  carrierName: string;
  driverName: string;
  driverPhone: string;
  tagsText: string;
  memo: string;
};

export function defaultVehicleDraft(): VehicleDraft {
  return {
    vehicleNo: "",
    tonClass: "",
    bodyType: "",
    carrierName: "",
    driverName: "",
    driverPhone: "",
    tagsText: "",
    memo: "",
  };
}

export function canVehicleBeComplete(draft: VehicleDraft): boolean {
  return Boolean(
    draft.tonClass &&
      draft.bodyType &&
      draft.carrierName.trim() &&
      draft.driverName.trim() &&
      draft.driverPhone.trim()
  );
}

export function resolveVehicleStatus(draft: VehicleDraft): VehicleStatus {
  return canVehicleBeComplete(draft) ? "complete" : "incomplete";
}

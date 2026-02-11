import {
  parsePartnerExcelViaLegacy,
  parseVehicleExcelViaLegacy,
  parseWeighingExcelViaLegacy,
} from "../adapters";

export function useExcelImportHubPage() {
  return {
    migrationStage: "bridge",
    parserBridge: {
      partner: parsePartnerExcelViaLegacy,
      weighing: parseWeighingExcelViaLegacy,
      vehicle: parseVehicleExcelViaLegacy,
    },
  } as const;
}

import { createEmptyParseResult, type ExcelParseResult } from "../../common";

const KORA_VEHICLE_SOURCE_ID = "kora.vehicle";

export function parseKoraVehicleWorkbook(): ExcelParseResult {
  // 2차 이관에서 실제 파서를 연결한다.
  return createEmptyParseResult({
    sourceId: KORA_VEHICLE_SOURCE_ID,
    importedAt: new Date().toISOString(),
  });
}


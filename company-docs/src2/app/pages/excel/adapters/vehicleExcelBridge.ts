import { parseVehicleExcel } from "@legacy/app/pages/home/excel/vehicle/vehicleExcelParser";
import type { ExcelParseResult, ExcelRowError } from "@kernel/adapters";

export async function parseVehicleExcelViaLegacy(
  file: File,
  existingVehicleNos: string[],
): Promise<ExcelParseResult> {
  const result = await parseVehicleExcel(file, existingVehicleNos);

  const errors: ExcelRowError[] = result.rows
    .filter((row) => row.status === "FAIL")
    .flatMap((row) => row.errors.map((message) => ({ rowIndex: row.rowIndex, message })));

  const records = result.rows
    .filter((row) => row.status === "OK" || row.status === "INCOMPLETE")
    .map((row) => ({
      sourceRowId: String(row.rowIndex),
      matchKey: typeof row.data?.vehicleNo === "string" ? row.data.vehicleNo : undefined,
      fields: {
        ...(row.data ?? {}),
      },
    }));

  return {
    meta: {
      sourceId: "kora.vehicle",
      importedAt: new Date().toISOString(),
      fileName: file.name,
    },
    total: result.total,
    ok: result.ok + result.incomplete,
    fail: result.fail,
    records,
    errors,
  };
}


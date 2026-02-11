import { parseWeighingExcel } from "@legacy/app/pages/home/excel/weighing/weighingParser";
import type { ExcelParseResult, ExcelRowError } from "@kernel/adapters";

export async function parseWeighingExcelViaLegacy(
  file: File,
  existingTicketNos: string[],
): Promise<ExcelParseResult> {
  const result = await parseWeighingExcel(file, existingTicketNos);

  const errors: ExcelRowError[] = result.rows
    .filter((row) => row.status === "FAIL")
    .flatMap((row) => row.errors.map((message) => ({ rowIndex: row.rowIndex, message })));

  const records = result.rows
    .filter((row) => row.status === "OK" || row.status === "INCOMPLETE")
    .map((row) => ({
      sourceRowId: String(row.rowIndex),
      matchKey: typeof row.data?.ticketNo === "string" ? row.data.ticketNo : undefined,
      fields: {
        ...(row.data ?? {}),
      },
    }));

  return {
    meta: {
      sourceId: "kora.weighing",
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


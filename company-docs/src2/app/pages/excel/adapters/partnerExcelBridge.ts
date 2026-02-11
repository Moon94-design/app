import { parsePartnerExcel } from "@legacy/app/pages/manage/master/excel/partnerExcelParser";
import type { ExcelParseResult, ExcelRowError } from "@kernel/adapters";

export async function parsePartnerExcelViaLegacy(
  file: File,
  existingCodes: string[],
): Promise<ExcelParseResult> {
  const result = await parsePartnerExcel(file, existingCodes);

  const errors: ExcelRowError[] = result.rows
    .filter((row) => row.status === "FAIL")
    .flatMap((row) => row.errors.map((message) => ({ rowIndex: row.rowIndex, message })));

  const records = result.rows
    .filter((row) => row.status === "OK" && row.data)
    .map((row) => ({
      sourceRowId: String(row.rowIndex),
      matchKey: row.data?.partnerCode || undefined,
      fields: {
        ...row.data,
      },
    }));

  return {
    meta: {
      sourceId: "kora.partner",
      importedAt: new Date().toISOString(),
      fileName: file.name,
    },
    total: result.total,
    ok: result.ok,
    fail: result.fail,
    records,
    errors,
  };
}


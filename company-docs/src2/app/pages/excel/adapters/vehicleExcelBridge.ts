import * as XLSX from "xlsx";
import type { VehicleParseResult, VehicleParsedRow } from "../types/excelUploadTypes";

function readWorkbookWithFallback(data: ArrayBuffer): XLSX.WorkBook {
  const attempts: Array<() => XLSX.WorkBook> = [
    () => XLSX.read(data, { type: "array" }),
    () => XLSX.read(data, { type: "array", codepage: 949 }),
    () => {
      const bytes = new Uint8Array(data);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return XLSX.read(binary, { type: "binary", codepage: 949 });
    },
  ];
  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      return attempt();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("엑셀 파싱 실패");
}

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = 0; r <= range.e.r; r++) {
    const row: string[] = [];
    for (let c = 0; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      row.push(cell ? String(cell.v || "").trim() : "");
    }
    if (row.includes("차량번호")) return r;
  }
  return 0;
}

function normalizeVehicleNo(raw: unknown): string | null {
  const value = String(raw || "").trim().replace(/\s+/g, "");
  return value === "" ? null : value;
}

function normalizeTon(raw: unknown): "" | "1t" | "5t" | "25t" {
  const num = parseFloat(String(raw || "").trim());
  if (Number.isNaN(num)) return "";
  if (num === 0.5 || num === 1) return "1t";
  if (num === 5) return "5t";
  if (num === 25) return "25t";
  return "";
}

function normalizeBodyType(raw: unknown): "" | "카고" | "윙" | "방통" {
  const value = String(raw || "").trim();
  if (value.includes("카고")) return "카고";
  if (value.includes("윙")) return "윙";
  if (value.includes("방통")) return "방통";
  return "";
}

export async function parseVehicleExcelNative(file: File, existingVehicleNos: string[]): Promise<VehicleParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = readWorkbookWithFallback(buffer);
  const sheetName = workbook.SheetNames.find((name) => name.includes("차량")) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("시트가 없습니다");

  const headerRowIndex = findHeaderRow(sheet);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    range: headerRowIndex,
  });

  const seen = new Set<string>();
  const duplicates: string[] = [];
  const dbConflicts: string[] = [];
  const parsedRows: VehicleParsedRow[] = [];

  rawRows.forEach((row, idx) => {
    const rowIndex = headerRowIndex + idx + 2;
    const errors: string[] = [];
    const warnings: string[] = [];
    const vehicleNo = normalizeVehicleNo(row["차량번호"]);

    if (!vehicleNo) errors.push("차량번호 필수");

    if (vehicleNo) {
      if (seen.has(vehicleNo)) {
        errors.push(`엑셀 내부 중복 (${vehicleNo})`);
        if (!duplicates.includes(vehicleNo)) duplicates.push(vehicleNo);
      } else {
        seen.add(vehicleNo);
      }
      if (existingVehicleNos.includes(vehicleNo)) {
        errors.push(`DB 충돌 (${vehicleNo})`);
        if (!dbConflicts.includes(vehicleNo)) dbConflicts.push(vehicleNo);
      }
    }

    const tonClass = normalizeTon(row["차량규격"]);
    const bodyType = normalizeBodyType(row["차량종류"]);
    if (!tonClass) warnings.push("톤수 미완성 (수동 입력 필요)");
    if (!bodyType) warnings.push("형태 미완성 (수동 입력 필요)");
    warnings.push("운송사/기사명/연락처 미입력 (관리에서 추가 필요)");

    const status: VehicleParsedRow["status"] = errors.length > 0 ? "FAIL" : "INCOMPLETE";
    parsedRows.push({
      rowIndex,
      status,
      errors,
      warnings,
      data: {
        vehicleNo: vehicleNo || "",
        tonClass,
        bodyType,
        source: "excel",
      },
    });
  });

  const ok = parsedRows.filter((row) => row.status === "OK").length;
  const incomplete = parsedRows.filter((row) => row.status === "INCOMPLETE").length;
  const fail = parsedRows.filter((row) => row.status === "FAIL").length;

  return {
    total: parsedRows.length,
    ok,
    incomplete,
    fail,
    rows: parsedRows,
    duplicates,
    dbConflicts,
  };
}

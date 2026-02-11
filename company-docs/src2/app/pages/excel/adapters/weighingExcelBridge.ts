import * as XLSX from "xlsx";
import { normalizeDate, normalizeNumber } from "@kernel/schema/excel";
import type {
  ExcelSite,
  WeighingParseResult,
  WeighingParsedRow,
  WeighingTransaction,
} from "../types/excelUploadTypes";

const HEADER_MAP: Record<string, keyof WeighingTransaction> = {
  번호: "ticketNo",
  계량일자: "date",
  순번: "seq",
  구분: "directionRaw",
  입출여부: "inOut",
  거래처ID: "partnerCode",
  거래처: "partnerName",
  거래처명: "partnerName",
  차량번호: "vehicleNo",
  품목: "itemName",
  품목명: "itemName",
  품명: "itemName",
  품목코드: "itemCode",
  총중량: "gross",
  공차중량: "tare",
  실중량: "net",
  인계중량: "handover",
  인계량: "handover",
  단가: "unitPrice",
  금액: "amount",
  비고: "note",
};

function readWorkbookWithFallback(data: ArrayBuffer): XLSX.WorkBook {
  const attempts: Array<() => XLSX.WorkBook> = [
    () => XLSX.read(data, { type: "array", cellDates: true }),
    () => XLSX.read(data, { type: "array", cellDates: true, codepage: 949 }),
    () => {
      const bytes = new Uint8Array(data);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return XLSX.read(binary, { type: "binary", cellDates: true, codepage: 949 });
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

function getHeaderRow(sheet: XLSX.WorkSheet): number {
  const fixedIndex = 5; // 6번째 행
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const row: string[] = [];
  for (let c = 0; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: fixedIndex, c })];
    row.push(cell ? String(cell.v || "").trim() : "");
  }
  if (row.includes("번호")) return fixedIndex;
  return fixedIndex;
}

function isDataRow(mapped: Partial<WeighingTransaction>): boolean {
  const ticketNo = String(mapped.ticketNo || "").trim();
  const dateRaw = String(mapped.dateRaw || "").trim();
  const combined = `${ticketNo} ${dateRaw}`.toLowerCase();
  if (!ticketNo && !dateRaw) return false;
  if (combined.includes("운행수")) return false;
  if (combined.includes("소계") || combined.includes("합계")) return false;
  if (combined.includes("[") || combined.includes("]")) return false;
  return true;
}

function buildWeighingKey(site: ExcelSite, ticketNo: string): string {
  return `${site}:${ticketNo}`.toLowerCase();
}

export async function parseWeighingExcelNative(
  file: File,
  existingTicketKeys: string[],
  site: ExcelSite,
): Promise<WeighingParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = readWorkbookWithFallback(buffer);
  const sheetName = workbook.SheetNames.find((name) => name.includes("계량현황")) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("시트가 없습니다");

  const headerRowIndex = getHeaderRow(sheet);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    range: headerRowIndex,
    raw: true,
  });

  const seen = new Set<string>();
  const duplicates: string[] = [];
  const parsedRows: WeighingParsedRow[] = [];

  rawRows.forEach((row, idx) => {
    const rowIndex = headerRowIndex + idx + 2;
    const mapped: Partial<WeighingTransaction> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [header, value] of Object.entries(row)) {
      const field = HEADER_MAP[header];
      if (!field) continue;

      if (field === "date") {
        mapped.dateRaw = String(value || "");
        const normalized = normalizeDate(value);
        mapped.date = normalized.value ?? "";
        if (normalized.error === "parse_failed") warnings.push(`날짜 파싱 실패 (${String(value)})`);
      } else if (field === "directionRaw") {
        const raw = String(value || "").trim();
        mapped.directionRaw = raw;
        if (raw.includes("매입")) mapped.direction = "BUY";
        else if (raw.includes("매출")) mapped.direction = "SELL";
        else mapped.direction = "";
      } else if (["seq", "gross", "tare", "net", "handover", "unitPrice", "amount"].includes(field)) {
        (mapped as Record<string, unknown>)[field] = normalizeNumber(value) ?? 0;
      } else {
        (mapped as Record<string, unknown>)[field] = String(value || "").trim();
      }
    }

    if (!mapped.direction) {
      const inOut = String(mapped.inOut || "");
      if (inOut.includes("입고") || inOut.startsWith("1")) mapped.direction = "BUY";
      if (inOut.includes("출고") || inOut.startsWith("2")) mapped.direction = "SELL";
    }

    if (!isDataRow(mapped)) return;
    mapped.site = site;

    if (!mapped.ticketNo) errors.push("ticketNo 필수");
    if (mapped.ticketNo) {
      const dedupeKey = buildWeighingKey(site, mapped.ticketNo);
      if (seen.has(dedupeKey)) {
        errors.push(`엑셀 내부 중복 (${site}:${mapped.ticketNo})`);
        if (!duplicates.includes(`${site}:${mapped.ticketNo}`)) duplicates.push(`${site}:${mapped.ticketNo}`);
      } else {
        seen.add(dedupeKey);
      }
      if (existingTicketKeys.includes(dedupeKey)) {
        errors.push(`DB 충돌 (${site}:${mapped.ticketNo})`);
        if (!duplicates.includes(`${site}:${mapped.ticketNo}`)) duplicates.push(`${site}:${mapped.ticketNo}`);
      }
    }

    const gross = mapped.gross || 0;
    const tare = mapped.tare || 0;
    const isIncomplete = gross === 0 || tare === 0 || !mapped.date;
    const isPriceIncomplete = (mapped.unitPrice || 0) === 0;
    mapped.isIncomplete = isIncomplete;
    mapped.isPriceIncomplete = isPriceIncomplete;

    if (warnings.length > 0) errors.push(...warnings.map((w) => `⚠️ ${w}`));

    let status: WeighingParsedRow["status"] = "OK";
    if (errors.filter((e) => !e.startsWith("⚠️")).length > 0) status = "FAIL";
    else if (isIncomplete || isPriceIncomplete) status = "INCOMPLETE";

    parsedRows.push({
      rowIndex,
      status,
      data: status === "FAIL" ? null : mapped,
      errors,
    });
  });

  const ok = parsedRows.filter((row) => row.status === "OK").length;
  const fail = parsedRows.filter((row) => row.status === "FAIL").length;
  const incomplete = parsedRows.filter((row) => row.status === "INCOMPLETE").length;

  return {
    total: parsedRows.length,
    ok,
    fail,
    incomplete,
    rows: parsedRows,
    duplicates,
  };
}

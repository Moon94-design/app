import * as XLSX from "xlsx";
import type { PartnerBase } from "@kernel/schema/partner";
import type { PartnerParseResult, PartnerParsedRow } from "../types/excelUploadTypes";

const HEADER_MAP: Record<string, keyof PartnerBase> = {
  거래처코드: "partnerCode",
  거래처명: "partnerName",
  대표자명: "ceoName",
  전화: "phone",
  우편번호: "zip",
  주소: "addr1",
  상세주소: "addr2",
  담당자: "contactName",
  핸드폰: "contactPhone",
  사업자번호: "businessNo",
  이메일: "email",
  팩스: "fax",
  업태: "businessType",
  종목: "businessItem",
  법인번호: "corporateNo",
};

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
    if (row.includes("거래처코드") && row.includes("거래처명")) return r;
  }
  return 0;
}

function emptyBase(): PartnerBase {
  return {
    partnerCode: "",
    partnerName: "",
    ceoName: "",
    phone: "",
    zip: "",
    addr1: "",
    addr2: "",
    contactName: "",
    contactPhone: "",
    businessNo: "",
    email: "",
    fax: "",
    businessType: "",
    businessItem: "",
    corporateNo: "",
  };
}

export async function parsePartnerExcelNative(file: File, existingCodes: string[]): Promise<PartnerParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = readWorkbookWithFallback(buffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw new Error("시트가 없습니다");

  const headerRowIndex = findHeaderRow(firstSheet);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    range: headerRowIndex,
  });

  const seen = new Set<string>();
  const duplicates: string[] = [];
  const dbConflicts: string[] = [];
  const parsedRows: PartnerParsedRow[] = [];

  rawRows.forEach((row, idx) => {
    const rowIndex = headerRowIndex + idx + 2;
    const mapped = emptyBase();
    const errors: string[] = [];

    for (const [header, value] of Object.entries(row)) {
      const field = HEADER_MAP[header];
      if (field) mapped[field] = String(value || "").trim();
    }

    if (!mapped.partnerCode) errors.push("partnerCode 필수");
    if (!mapped.partnerName) errors.push("partnerName 필수");

    if (mapped.partnerCode) {
      if (seen.has(mapped.partnerCode)) {
        errors.push(`엑셀 내부 중복 (${mapped.partnerCode})`);
        if (!duplicates.includes(mapped.partnerCode)) duplicates.push(mapped.partnerCode);
      } else {
        seen.add(mapped.partnerCode);
      }

      if (existingCodes.includes(mapped.partnerCode)) {
        errors.push(`DB 충돌 (${mapped.partnerCode})`);
        if (!dbConflicts.includes(mapped.partnerCode)) dbConflicts.push(mapped.partnerCode);
      }
    }

    parsedRows.push({
      rowIndex,
      status: errors.length > 0 ? "FAIL" : "OK",
      errors,
      data: errors.length > 0 ? null : mapped,
    });
  });

  const ok = parsedRows.filter((r) => r.status === "OK").length;
  const fail = parsedRows.filter((r) => r.status === "FAIL").length;

  return {
    total: parsedRows.length,
    ok,
    fail,
    rows: parsedRows,
    duplicates,
    dbConflicts,
  };
}

import XLSX from "xlsx";
import fs from "fs";

const excelPath = "./docs/PARTNER_EXEL_TEST.xlsx";
const HEADER_MAP = {
  "거래처코드": "partnerCode", "거래처명": "partnerName", "대표자명": "ceoName",
  "전화": "phone", "우편번호": "zip", "주소": "addr1", "상세주소": "addr2",
  "담당자": "contactName", "핸드폰": "contactPhone", "사업자번호": "businessNo",
  "이메일": "email", "팩스": "fax", "업태": "businessType",
  "종목": "businessItem", "법인번호": "corporateNo",
};
const REQUIRED_FIELDS = ["partnerCode", "partnerName"];

function findHeaderRow(sheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = 0; r <= range.e.r; r++) {
    const row = [];
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      row.push(cell ? String(cell.v || "").trim() : "");
    }
    if (row.includes("거래처코드") && row.includes("거래처명")) return r;
  }
  return 0;
}

const existingCodes = ["1034348", "1005289", "1004067"];
console.log("기존 DB:", existingCodes.join(", "), "\n");

const data = fs.readFileSync(excelPath);
const workbook = XLSX.read(data, { type: "buffer" });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const headerRowIndex = findHeaderRow(firstSheet);
const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", range: headerRowIndex });

console.log(`총 ${rawRows.length}행\n`);

const parsedRows = [];
const seenCodes = new Set();
const duplicates = [];
const dbConflicts = [];

rawRows.forEach((row, idx) => {
  const rowIndex = headerRowIndex + idx + 2;
  const errors = [];
  const mapped = {};
  let faxMapped = false;

  Object.entries(row).forEach(([header, value]) => {
    const field = HEADER_MAP[header];
    if (field) {
      if (field === "fax" && faxMapped) return;
      mapped[field] = String(value || "").trim();
      if (field === "fax") faxMapped = true;
    }
  });

  REQUIRED_FIELDS.forEach((field) => {
    if (!mapped[field] || mapped[field] === "") {
      errors.push(`${field} 필수`);
    }
  });

  const code = mapped.partnerCode || "";
  if (code) {
    if (seenCodes.has(code)) {
      errors.push(`엑셀 내부 중복`);
      if (!duplicates.includes(code)) duplicates.push(code);
    } else {
      seenCodes.add(code);
    }
    if (existingCodes.includes(code)) {
      errors.push(`DB 충돌`);
      if (!dbConflicts.includes(code)) dbConflicts.push(code);
    }
  }

  parsedRows.push({
    rowIndex, status: errors.length > 0 ? "FAIL" : "OK", errors,
    partnerName: mapped.partnerName || "-", partnerCode: code,
  });
});

const ok = parsedRows.filter((r) => r.status === "OK").length;
const fail = parsedRows.filter((r) => r.status === "FAIL").length;

console.log(`OK: ${ok}건, FAIL: ${fail}건`);
console.log(`DB 충돌: ${dbConflicts.join(", ") || "없음"}\n`);

parsedRows.forEach((r) => {
  const s = r.status === "OK" ? "✅" : "❌";
  console.log(`${s} ${r.partnerName} (${r.partnerCode}) - ${r.errors.join(", ") || "OK"}`);
});

console.log(`\n등록될 항목: ${ok}건`);
parsedRows.filter(r => r.status === "OK").forEach(r => {
  console.log(`  ✓ ${r.partnerName}`);
});

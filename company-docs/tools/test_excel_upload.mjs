/**
 * 엑셀 업로드 로직 테스트 (중복 처리)
 */
import XLSX from "xlsx";
import fs from "fs";

const excelPath = "./docs/PARTNER_EXEL_TEST.xlsx";

// 컬럼 헤더 alias 매핑
const HEADER_MAP = {
  "거래처코드": "partnerCode",
  "거래처명": "partnerName",
  "대표자명": "ceoName",
  "전화": "phone",
  "우편번호": "zip",
  "주소": "addr1",
  "상세주소": "addr2",
  "담당자": "contactName",
  "핸드폰": "contactPhone",
  "사업자번호": "businessNo",
  "이메일": "email",
  "팩스": "fax",
  "업태": "businessType",
  "종목": "businessItem",
  "법인번호": "corporateNo",
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
    if (row.includes("거래처코드") && row.includes("거래처명")) {
      return r;
    }
  }
  return 0;
}

// 기존 DB에 있다고 가정 (첫 3개)
const existingCodes = ["1034348", "1005289", "1004067"];

console.log("=== 엑셀 업로드 로직 테스트 ===\n");
console.log("기존 DB 코드:", existingCodes.join(", "));

// 파일 읽기
const data = fs.readFileSync(excelPath);
const workbook = XLSX.read(data, { type: "buffer" });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

// 헤더 행 찾기
const headerRowIndex = findHeaderRow(firstSheet);
console.log(`헤더 행: Row ${headerRowIndex + 1} (인덱스 ${headerRowIndex})\n`);

// JSON 변환
const rawRows = XLSX.utils.sheet_to_json(firstSheet, { 
  defval: "",
  range: headerRowIndex,
});

console.log(`총 데이터 행 수: ${rawRows.length}\n`);

// 파싱 & 검증
const parsedRows = [];
const seenCodes = new Set();
const duplicates = [];
const dbConflicts = [];

rawRows.forEach((row, idx) => {
  const rowIndex = headerRowIndex + idx + 2;
  const errors = [];
  const mapped = {};
  let faxMapped = false;

  // 헤더 매핑
  Object.entries(row).forEach(([header, value]) => {
    const field = HEADER_MAP[header];
    if (field) {
      if (field === "fax" && faxMapped) return;
      mapped[field] = String(value || "").trim();
      if (field === "fax") faxMapped = true;
    }
  });

  // 필수 검증
  REQUIRED_FIELDS.forEach((field) => {
    if (!mapped[field] || mapped[field] === "") {
      errors.push(`${field} 필수`);
    }
  });

  // 중복 검증
  const code = mapped.partnerCode || "";
  if (code) {
    if (seenCodes.has(code)) {
      errors.push(`엑셀 내부 중복 (${code})`);
      if (!duplicates.includes(code)) duplicates.push(code);
    } else {
      seenCodes.add(code);
    }

    if (existingCodes.includes(code)) {
      errors.push(`DB 충돌 (${code})`);
      if (!dbConflicts.includes(code)) dbConflicts.push(code);
    }
  }

  parsedRows.push({
    rowIndex,
    status: errors.length > 0 ? "FAIL" : "OK",
    errors,
    partnerName: mapped.partnerName || "-",
    partnerCode: code,
  });
});

const ok = parsedRows.filter((r) => r.status === "OK").length;
const fail = parsedRows.filter((r) => r.status === "FAIL").length;

console.log("=== 파싱 결과 ===");
console.log(`총: ${parsedRows.length}건`);
console.log(`OK: ${ok}건`);
console.log(`FAIL: ${fail}건`);
console.log(`엑셀 내부 중복: ${duplicates.join(", ") || "없음"}`);
console.log(`DB 충돌: ${dbConflicts.join(", ") || "없음"}`);

console.log("\n=== 행별 상세 ===");
parsedRows.forEach((r) => {
  const status = r.status === "OK" ? "✅" : "❌";
  console.log(`${status} Row ${r.rowIndex}: ${r.partnerName} (${r.partnerCode}) - ${r.errors.join(", ") || "성공"}`);
});

console.log("\n=== 등록 시뮬레이션 ===");
const toRegister = parsedRows.filter((r) => r.status === "OK");
console.log(`등록할 항목 (${toRegister.length}건):`);
toRegister.forEach((r) => {
  console.log(`  - ${r.partnerName} (${r.partnerCode})`);
});

if (fail > 0) {
  const failedNames = parsedRows
    .filter((r) => r.status === "FAIL")
    .map((r) => r.partnerName);
  console.log(`\n⚠️ 중복으로 제외될 항목 (${fail}건):`);
  failedNames.forEach(name => console.log(`  - ${name}`));
}

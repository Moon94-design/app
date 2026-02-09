/**
 * inspect_excel.mjs
 * 엑셀 파일 구조 확인 스크립트
 */

import * as XLSX from "xlsx";
import * as fs from "fs";

const filePath = process.argv[2] || "./1/3.xls";

console.log(`\n=== 엑셀 파일 구조 분석: ${filePath} ===\n`);

if (!fs.existsSync(filePath)) {
  console.error(`❌ 파일이 없습니다: ${filePath}`);
  process.exit(1);
}

// 파일 읽기
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: "buffer" });

console.log(`📄 시트 목록: ${workbook.SheetNames.join(", ")}\n`);

// 첫 번째 시트 분석
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

console.log(`📊 시트명: ${sheetName}`);

// 범위 확인
const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
console.log(`📏 범위: ${sheet["!ref"]} (행: ${range.e.r + 1}, 열: ${range.e.c + 1})`);

// 1-15행 전체 출력 (구조 파악용)
console.log("\n=== 상단 15행 내용 (raw) ===\n");
for (let r = 0; r <= Math.min(14, range.e.r); r++) {
  const row = [];
  for (let c = 0; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[addr];
    if (cell) {
      row.push(`${String.fromCharCode(65 + c)}:${cell.v}`);
    } else {
      row.push(`${String.fromCharCode(65 + c)}:-`);
    }
  }
  console.log(`Row ${r + 1}: ${row.slice(0, 15).join(" | ")}`);
}

// 6행 (헤더 후보) 상세 출력
console.log("\n=== 6행 (헤더 후보) 상세 ===\n");
const headerRow = 5; // 0-indexed
const headers = [];
for (let c = 0; c <= range.e.c; c++) {
  const addr = XLSX.utils.encode_cell({ r: headerRow, c });
  const cell = sheet[addr];
  const colName = String.fromCharCode(65 + c);
  const value = cell ? String(cell.v) : "";
  headers.push({ col: colName, value });
  if (value) {
    console.log(`  ${colName}열: "${value}"`);
  }
}

// 7행 (데이터 시작 후보) 샘플
console.log("\n=== 7행 (데이터 첫 행 후보) 샘플 ===\n");
const dataRow = 6; // 0-indexed
for (let c = 0; c <= Math.min(range.e.c, 20); c++) {
  const addr = XLSX.utils.encode_cell({ r: dataRow, c });
  const cell = sheet[addr];
  const colName = String.fromCharCode(65 + c);
  const headerVal = headers[c]?.value || "?";
  const value = cell ? (typeof cell.v === "number" ? cell.v : String(cell.v)) : "";
  if (value) {
    console.log(`  ${colName}열 (${headerVal}): ${value}`);
  }
}

// N열 (거래처ID 후보) 확인
console.log("\n=== N열 (거래처ID 후보) 샘플 (7-11행) ===\n");
const nColIndex = 13; // N = 14번째 = index 13
for (let r = 6; r <= Math.min(10, range.e.r); r++) {
  const addr = XLSX.utils.encode_cell({ r: nColIndex, c: r });
  const cell = sheet[addr];
  const value = cell ? cell.v : "";
  console.log(`  Row ${r + 1}: ${value}`);
}

// D열 (구분 후보) 샘플
console.log("\n=== D열 (구분 - 방향 후보) 샘플 (7-11행) ===\n");
const dColIndex = 3; // D = 4번째 = index 3
for (let r = 6; r <= Math.min(10, range.e.r); r++) {
  const addr = XLSX.utils.encode_cell({ r: dColIndex, c: r });
  const cell = sheet[addr];
  const value = cell ? cell.v : "";
  if (value) {
    console.log(`  Row ${r + 1}: "${value}"`);
  }
}

// JSON 변환 테스트 (헤더=5, 데이터=6부터)
console.log("\n=== JSON 변환 테스트 (헤더=6행, 데이터=7행부터, 처음 5건) ===\n");
const jsonData = XLSX.utils.sheet_to_json(sheet, {
  range: 5, // 6행(0-indexed=5)부터 헤더로
  defval: "",
  raw: true,
});

console.log(`변환된 행 수: ${jsonData.length}`);
jsonData.slice(0, 5).forEach((row, idx) => {
  console.log(`\n[${idx + 1}] ${JSON.stringify(row, null, 2).substring(0, 500)}...`);
});

console.log("\n=== 분석 완료 ===\n");

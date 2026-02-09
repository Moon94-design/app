/**
 * test_parser.mjs
 * weighingParser.ts 파싱 로직 테스트 (Node.js 환경에서 실행)
 */

import * as XLSX from "xlsx";
import * as fs from "fs";

const filePath = process.argv[2] || "./1/3.xls";

console.log(`\n=== 계량현황 파서 테스트: ${filePath} ===\n`);

if (!fs.existsSync(filePath)) {
  console.error(`❌ 파일이 없습니다: ${filePath}`);
  process.exit(1);
}

// 파일 읽기
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: "buffer" });

// 시트 선택: "계량현황" 우선
let sheetName = workbook.SheetNames.find(name => name.includes("계량현황"));
if (!sheetName) sheetName = workbook.SheetNames[0];

const sheet = workbook.Sheets[sheetName];
console.log(`📊 시트: ${sheetName}`);

// 헤더 행 고정 (6행 = 0-indexed 5)
const HEADER_ROW_INDEX = 5;
const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

console.log(`📏 범위: ${sheet["!ref"]} (행: ${range.e.r + 1}, 열: ${range.e.c + 1})`);
console.log(`📌 헤더 행: ${HEADER_ROW_INDEX + 1}행 (고정)\n`);

// 헤더 추출
const headers = [];
for (let c = 0; c <= range.e.c; c++) {
  const addr = XLSX.utils.encode_cell({ r: HEADER_ROW_INDEX, c });
  const cell = sheet[addr];
  headers.push(cell ? String(cell.v || "").trim() : "");
}

console.log("=== 헤더 (6행) ===");
headers.forEach((h, idx) => {
  if (h) {
    const colName = String.fromCharCode(65 + idx);
    console.log(`  ${colName}열: "${h}"`);
  }
});

// JSON 변환 (헤더=6행, 데이터=7행부터)
const rawRows = XLSX.utils.sheet_to_json(sheet, {
  defval: "",
  range: HEADER_ROW_INDEX,
  raw: true,
});

console.log(`\n=== JSON 변환 결과 ===`);
console.log(`변환된 행 수: ${rawRows.length}건\n`);

// 처음 3건 샘플
console.log("=== 샘플 (처음 3건) ===");
rawRows.slice(0, 3).forEach((row, idx) => {
  console.log(`\n[${idx + 1}] ${JSON.stringify(row, null, 2)}`);
});

// 헤더 매핑 확인
const HEADER_MAP = {
  "번호": "ticketNo",
  "계량일자": "date",
  "순번": "seq",
  "구분": "directionRaw",
  "입출여부": "inOut",
  "거래처ID": "partnerCode",
  "거래처": "partnerName",
  "차량번호": "vehicleNo",
  "품목코드": "itemCode",
  "품명": "itemName",
  "총중량": "gross",
  "공차중량": "tare",
  "실중량": "net",
  "인계중량": "handover",
  "인계량": "handover",
  "단가": "unitPrice",
  "금액": "amount",
  "비고": "note",
};

console.log(`\n=== 헤더 매핑 ===`);
Object.entries(rawRows[0] || {}).forEach(([header, value]) => {
  const field = HEADER_MAP[header];
  if (field) {
    console.log(`✅ "${header}" → ${field} (예: ${value})`);
  } else {
    console.log(`⚠️ "${header}" → (매핑 없음)`);
  }
});

// 데이터 행 판정 테스트
console.log(`\n=== 데이터 행 판정 (끝 10행) ===`);
rawRows.slice(-10).forEach((row, idx) => {
  const ticketNo = String(row["번호"] || "").trim();
  const dateRaw = String(row["계량일자"] || "").trim();
  const combinedText = `${ticketNo} ${dateRaw}`.toLowerCase();
  
  let isData = true;
  let reason = "OK";
  
  if (!ticketNo && !dateRaw) {
    isData = false;
    reason = "ticketNo/dateRaw 둘 다 없음";
  } else if (combinedText.includes("운행수") || combinedText.includes("소계") || combinedText.includes("합계") || combinedText.includes("[")) {
    isData = false;
    reason = "요약행 패턴 발견";
  }
  
  console.log(`  Row ${rawRows.length - 10 + idx + 1} (실제 ${HEADER_ROW_INDEX + 1 + rawRows.length - 10 + idx + 1}행): ${isData ? "✅ DATA" : "❌ SKIP"} - ${reason} (ticketNo: "${ticketNo}", date: "${dateRaw}")`);
});

// 미완료 판정 테스트
console.log(`\n=== 미완료 판정 (처음 10건) ===`);
rawRows.slice(0, 10).forEach((row, idx) => {
  const gross = Number(row["총중량"] || 0);
  const tare = Number(row["공차중량"] || 0);
  const unitPrice = Number(row["단가"] || 0);
  const amount = Number(row["금액"] || 0);
  const isIncomplete = gross === 0 || tare === 0;
  
  console.log(`  [${idx + 1}] ${isIncomplete ? "❌ INCOMPLETE" : "✅ OK"} - gross: ${gross}, tare: ${tare} (unitPrice: ${unitPrice}, amount: ${amount})`);
});

// 방향 정규화 테스트
console.log(`\n=== 방향 정규화 (처음 10건) ===`);
rawRows.slice(0, 10).forEach((row, idx) => {
  const directionRaw = String(row["구분"] || "").trim();
  const inOut = String(row["입출여부"] || "").trim();
  
  let direction = "";
  if (directionRaw.includes("매입") || directionRaw.toUpperCase().includes("BUY")) {
    direction = "BUY";
  } else if (directionRaw.includes("매출") || directionRaw.toUpperCase().includes("SELL")) {
    direction = "SELL";
  } else {
    // inOut으로 fallback
    if (inOut.includes("입고") || inOut.startsWith("1")) {
      direction = "BUY";
    } else if (inOut.includes("출고") || inOut.startsWith("2")) {
      direction = "SELL";
    }
  }
  
  console.log(`  [${idx + 1}] directionRaw: "${directionRaw}", inOut: "${inOut}" → direction: "${direction}"`);
});

console.log(`\n=== 테스트 완료 ===\n`);

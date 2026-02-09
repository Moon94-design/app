/**
 * 엑셀 파서 테스트 스크립트
 */
import XLSX from "xlsx";
import fs from "fs";

const excelPath = "./docs/PARTNER_EXEL.xlsx";

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

/**
 * 헤더 행 탐색
 */
function findHeaderRow(sheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = 0; r <= range.e.r; r++) {
    const row = [];
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      row.push(cell ? String(cell.v || "").trim() : "");
    }
    // 필수 헤더 존재 확인
    if (row.includes("거래처코드") && row.includes("거래처명")) {
      console.log(`✓ 헤더 행 발견: Row ${r + 1} (인덱스 ${r})`);
      console.log(`  헤더: ${row.filter(v => v).slice(0, 10).join(", ")}...`);
      return r;
    }
  }
  return 0;
}

// 파일 읽기
const data = fs.readFileSync(excelPath);
const workbook = XLSX.read(data, { type: "buffer" });
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

// 헤더 행 찾기
const headerRowIndex = findHeaderRow(firstSheet);

// JSON 변환 (헤더 행 지정)
const rawRows = XLSX.utils.sheet_to_json(firstSheet, { 
  defval: "",
  range: headerRowIndex, 
});

console.log(`\n✓ 총 데이터 행 수: ${rawRows.length}`);

// 첫 3행 샘플 출력
console.log("\n=== 처음 3행 샘플 ===");
rawRows.slice(0, 3).forEach((row, idx) => {
  const rowNum = headerRowIndex + idx + 2;
  console.log(`\nRow ${rowNum}:`);
  
  const mapped = {};
  let faxMapped = false;
  
  Object.entries(row).forEach(([header, value]) => {
    const field = HEADER_MAP[header];
    if (field) {
      // 팩스 중복 처리
      if (field === "fax" && faxMapped) {
        return;
      }
      mapped[field] = String(value || "").trim();
      if (field === "fax") {
        faxMapped = true;
      }
    }
  });
  
  console.log("  매핑 결과:");
  console.log(`    - 거래처코드: ${mapped.partnerCode || "(없음)"}`);
  console.log(`    - 거래처명: ${mapped.partnerName || "(없음)"}`);
  console.log(`    - 대표자명: ${mapped.ceoName || "(없음)"}`);
  console.log(`    - 전화: ${mapped.phone || "(없음)"}`);
  console.log(`    - 사업자번호: ${mapped.businessNo || "(없음)"}`);
  console.log(`    - 이메일: ${mapped.email || "(없음)"}`);
  console.log(`    - 팩스: ${mapped.fax || "(없음)"}`);
  console.log(`    - 업태: ${mapped.businessType || "(없음)"}`);
  console.log(`    - 종목: ${mapped.businessItem || "(없음)"}`);
  console.log(`    - 법인번호: ${mapped.corporateNo || "(없음)"}`);
});

console.log("\n✓ 테스트 완료");

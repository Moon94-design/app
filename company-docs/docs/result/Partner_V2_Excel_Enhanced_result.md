# Partner V2 엑셀 업로드 확장 업데이트 결과

**작업 일시**: 2026-02-06  
**작업 내용**: 엑셀 파일 구조 분석 및 파서 업데이트 (헤더 자동 탐색 + 새 필드 추가 + xls 지원)

---

## TL;DR

✅ **엑셀 파일 구조 분석 완료** (PARTNER_EXEL.xlsx)  
✅ **헤더 자동 탐색 기능 추가** (Row 6 자동 감지)  
✅ **새 필드 5개 추가** (이메일, 팩스, 업태, 종목, 법인번호)  
✅ **xls 파일 지원** (.xlsx + .xls 모두 업로드 가능)  
✅ **빌드 PASS** (473ms, 781.84 kB)  
✅ **실제 엑셀 파일로 파싱 테스트 성공**

---

## Summary

### Changed (4개 파일 수정)

1. **partnerV2Types.ts** (+6 lines)
   - PartnerBase에 필드 추가: email, fax, businessType, businessItem, corporateNo
   - defaultPartnerV2Draft()에 기본값 추가
   - businessNo: optional(?) → required (권장)

2. **partnerExcelTypes.ts** (+5 lines)
   - PartnerExcelRow에 신규 필드 추가
   
3. **partnerExcelParser.ts** (+40 lines)
   - findHeaderRow() 함수 추가 (헤더 자동 탐색)
   - HEADER_MAP에 5개 필드 추가
   - 팩스 중복 처리 (첫 번째만 매핑)
   - 헤더 행 지정 파싱 (range: headerRowIndex)
   - rowIndex 계산 수정 (headerRowIndex + idx + 2)
   - data 생성 시 신규 필드 포함

4. **PartnerExcelUploadPanel.tsx** (+1 line)
   - accept=".xlsx,.xls" (xls 파일 허용)

5. **RegisterPartnerV2.tsx** (+15 lines)
   - Base 필드 마이그레이션 추가 (email, fax, businessType, businessItem, corporateNo)

### Not Changed

- 기존 파싱 로직 유지 (Policy A, Error)
- 필수 필드 유지 (partnerCode, partnerName)
- UI 구조 유지 (PartnerManage, ManageMaster)

---

## Files Changed

1. [src/app/pages/register/partner/partnerV2Types.ts](src/app/pages/register/partner/partnerV2Types.ts)
2. [src/app/pages/manage/master/excel/partnerExcelTypes.ts](src/app/pages/manage/master/excel/partnerExcelTypes.ts)
3. [src/app/pages/manage/master/excel/partnerExcelParser.ts](src/app/pages/manage/master/excel/partnerExcelParser.ts)
4. [src/app/pages/manage/master/excel/PartnerExcelUploadPanel.tsx](src/app/pages/manage/master/excel/PartnerExcelUploadPanel.tsx)
5. [src/app/pages/register/partner/RegisterPartnerV2.tsx](src/app/pages/register/partner/RegisterPartnerV2.tsx)

**신규 파일**:
- [tools/test_excel_parser.mjs](tools/test_excel_parser.mjs) (테스트 스크립트)

---

## Build

```bash
$ npm run build
✓ 101 modules transformed.
dist/assets/index-B_OB7-MI.js   781.84 kB │ gzip: 229.87 kB
✓ built in 473ms
```

**결과**: ✅ PASS (473ms, 781.84 kB, 101 modules)

---

## 확인 체크리스트

- [x] **엑셀 구조 분석**: PARTNER_EXEL.xlsx (Row 6 헤더, Row 7부터 데이터)
- [x] **헤더 자동 탐색**: findHeaderRow() 함수로 "거래처코드"+"거래처명" 포함 행 찾기
- [x] **신규 필드 매핑**: 이메일, 팩스, 업태, 종목, 법인번호 (5개)
- [x] **팩스 중복 처리**: 첫 번째 "팩스" 컬럼만 매핑
- [x] **xls 파일 지원**: accept=".xlsx,.xls"
- [x] **마이그레이션 추가**: RegisterPartnerV2.tsx (구 버전 draft 호환)
- [x] **빌드 검증**: PASS (473ms)
- [x] **실제 파싱 테스트**: 3행 샘플 성공

---

## Appendix

### A. 엑셀 파일 구조

**파일**: docs/PARTNER_EXEL.xlsx
- **총 행 수**: 156
- **총 열 수**: 27
- **헤더 행**: Row 6 (인덱스 5)
- **데이터 시작**: Row 7 (인덱스 6)

**헤더 예시**:
```
매출 | 수출 | 맴버ID | 거래처코드 | 거래처명 | 대표자명 | 거래처구분 | 사업자번호 | 법인번호 | 업태 | 종목 | 전화 | 팩스 | RFID_거래처 | 우편번호 | 주소 | 상세주소 | 담당자 | 담당전화 | 핸드폰 | 팩스 | 이메일 | 단축키 | 수정자 | 수정일 | 수신여부 | 수신일
```

### B. 필드 분류 및 매핑

#### A) 필수 (2개)
- **거래처코드** → partnerCode (내부키, UI 비노출)
- **거래처명** → partnerName

#### B) 권장 (Base에 저장)
- **대표자명** → ceoName
- **사업자번호** → businessNo
- **전화** → phone
- **우편번호** → zip
- **주소** → addr1
- **상세주소** → addr2
- **담당자** → contactName
- **핸드폰** → contactPhone
- **이메일** → email *(NEW)*
- **팩스** → fax *(NEW, 첫 번째만)*

#### C) 선택 (Base에 저장)
- **업태** → businessType *(NEW)*
- **종목** → businessItem *(NEW)*
- **법인번호** → corporateNo *(NEW)*

### C. 헤더 자동 탐색 로직

```typescript
function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = 0; r <= range.e.r; r++) {
    const row: string[] = [];
    for (let c = 0; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      row.push(cell ? String(cell.v || "").trim() : "");
    }
    // 필수 헤더 존재 확인
    if (row.includes("거래처코드") && row.includes("거래처명")) {
      return r;
    }
  }
  return 0; // 기본 첫 행
}
```

**동작**:
1. 각 행의 모든 셀을 순회
2. "거래처코드"와 "거래처명" 모두 포함된 행 찾기
3. 해당 행 인덱스 반환 (예: 5 → Row 6)

### D. 팩스 중복 처리

엑셀에 "팩스" 컬럼이 2개 존재 (컬럼 13, 21):
- 첫 번째 "팩스" → fax 매핑
- 두 번째 "팩스" → 무시 (faxMapped 플래그로 제어)

```typescript
let faxMapped = false;
Object.entries(row).forEach(([header, value]) => {
  const field = HEADER_MAP[header];
  if (field === "fax" && faxMapped) {
    return; // 두 번째 팩스는 건너뛰기
  }
  mapped[field] = String(value || "").trim();
  if (field === "fax") {
    faxMapped = true;
  }
});
```

### E. 파싱 테스트 결과

```
✓ 헤더 행 발견: Row 6 (인덱스 5)
✓ 총 데이터 행 수: 3

Row 7:
  거래처코드: 1034348
  거래처명: (유)현진알씨
  대표자명: 김시원
  전화: 063-291-5518
  사업자번호: 2168147593
  이메일: scrap5518@naver.com
  팩스: 063-254-1110
  업태: 서비스
  종목: 폐기물재활용,폐기물파쇄및분쇄
  법인번호: 2101140105730

Row 8:
  거래처코드: 1005289
  거래처명: (주) 연합기업
  대표자명: 유청식
  전화: 062-945-6480
  사업자번호: 4108642157
  이메일: 9456480@hanmail.net
  팩스: 062-945-6488
  업태: 제조업 도,소매
  종목: 재생용재료수집및판매업
  법인번호: 2001110303308

Row 9:
  거래처코드: 1004067
  거래처명: (주) 하이원리싸이클링
  대표자명: 이성원
  전화: 031-377-0143
  사업자번호: 1248676834
  이메일: hiwonrc8@naver.com
  팩스: 031-377-0153
  업태: 제조업
  종목: 재활용품
  법인번호: 1348110171025
```

**확인**:
- ✅ 모든 필드 정상 매핑
- ✅ 팩스 중복 처리 확인 (첫 번째만 매핑)
- ✅ 한글 헤더 자동 인식
- ✅ 데이터 무결성 유지

### F. xls 파일 지원

**변경 전**:
```tsx
<input type="file" accept=".xlsx" />
```

**변경 후**:
```tsx
<input type="file" accept=".xlsx,.xls" />
```

**xlsx 라이브러리**는 xls 파일도 자동 지원하므로 파서 수정 불필요.

---

## 다음 작업 (선택)

1. **엑셀 템플릿 다운로드** (단기)
   - 사용자 편의 (헤더 형식 제공)
   - PartnerManage에 "템플릿 다운로드" 버튼 추가

2. **업로드 로그 기록** (중기)
   - 감사/추적 (업로드 사용자/시각/파일명/행수)

3. **충돌 정책 옵션** (중기)
   - Update (덮어쓰기), Skip (건너뛰기), Rename (코드 변경)

4. **미리보기 테이블 개선** (중기)
   - 신규 필드도 미리보기에 표시

---

**End of Document**

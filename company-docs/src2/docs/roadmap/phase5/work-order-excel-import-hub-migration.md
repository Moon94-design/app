# 공장 방식 작업 순서표 - /excel (Excel Import Hub)

작성일: 2026-02-10
목적: 기존 `src` 엑셀등록 허브를 `src2`로 우선 이관하되, 다중 포맷 통합(미래)까지 고려한 구조를 선반영

================================================================================
대상 페이지
- 라우트: `/excel`
- 도메인: `excel-import-hub`
- 목표 상태: 1차 `MIGRATED` (동작 보존), 2차 확장 준비(다중 포맷 병합)

================================================================================
범위 원칙 (이번 작업)
- [x] 이번 1차 이관은 "행동 동일성" 우선: 레거시 기능을 깨지 않게 `src2`로 이동
- [x] 신규 업로드 포맷/병합 엔진 구현은 하지 않음 (구조만 선반영)
- [x] `@kernel` 경계만 정리: parser/adapter/merge 규칙이 들어갈 자리 확보

================================================================================
권장 폴더/파일 구조 (확장 대비)
- `src2/app/pages/excel/ExcelImportHubPage.tsx`
  - 허브 조립 페이지 (탭/레이아웃/섹션 조합)
- `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
  - 활성 탭/요약 상태/적용 버튼 흐름
- `src2/app/pages/excel/sections/`
  - `ExcelSourceGroupSection.tsx` (KORA 1열/기타 2열 그룹 UI)
  - `ExcelPartnerUploadSection.tsx`
  - `ExcelWeighingUploadSection.tsx`
  - `ExcelVehicleUploadSection.tsx`

- `src2/kernel/adapters/excel/`
  - `common/` (공통 파싱 결과 타입, 오류 포맷)
  - `kora/partner/` (KORA 거래처 파서/타입)
  - `kora/weighing/` (KORA 계량현황 파서/타입)
  - `kora/vehicle/` (KORA 차량 파서/타입)
  - `index.ts`

- `src2/kernel/schema/excel/` (미래 통합용, 1차에서는 최소 골격만)
  - `canonicalTypes.ts` (통합 엔티티 타입)
  - `sourceTypes.ts` (소스별 원본 타입)
  - `mergePolicy.ts` (필드 우선순위/충돌 규칙 인터페이스)

- `src2/kernel/repo/domain/` (기존 repo 재사용)
  - partner/vehicle/weighing 저장은 기존 domain repo를 경유

================================================================================
데이터 통합 대비 설계 포인트 (미래 2차)
- [x] 소스 식별자: `sourceId`(예: `kora.partner`, `kora.weighing`)
- [x] 레코드 식별: `sourceRowId` + 도메인 키(예: 차량번호, 거래처코드)
- [x] 통합 식별: `canonicalId` 1개에 여러 소스 필드 매핑 가능
- [ ] 필드 출처 추적: 값마다 `origin(sourceId, rowId, importedAt)` 보관 가능 구조
- [x] 충돌 처리: "덮어쓰기"가 아니라 `mergePolicy`로 규칙화(우선순위/보완)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: `/excel` 1개 라우트만 대상으로 한다
- [x] 1) 레거시 구조 분해: partner/weighing/vehicle 패널 의존 경로 목록화
- [x] 2) src2 페이지 골격 생성: page/hooks/sections 분리
- [x] 3) kernel adapters 자리 생성: `adapters/excel/*` 경로와 index 정리
- [x] 4) 기존 파서/타입 이동 또는 래핑: 동작 동일성 우선, 로직 변경 최소화
- [x] 5) 저장 경로 점검: partner/weighing는 repo 키 연계 확인, vehicle 키 단일화는 치환 단계에서 처리
- [x] 6) nav loader 교체: `/excel` -> `@app2/pages/excel/ExcelImportHubPage`
- [x] 6.5) UI 점진 치환: legacy 허브 직접 렌더 -> src2 탭/섹션 조립으로 전환
- [ ] 7) 게이트
- [x] `npm run build`
- [ ] `npm run test:smoke` (현재 환경 timeout, 후속 재검증)
- [x] `/excel` 직접 URL + 새로고침 동작 확인 (`http://localhost:5173/excel` 200)
- [x] 대체 게이트: build + 소스별(거래처/계량/차량) 최소 샘플 수동 업로드 시나리오 고정
- [ ] 수동 시나리오 1: partner 엑셀 1회 업로드 -> 관리/조회 반영 확인
- [ ] 수동 시나리오 2: weighing 엑셀 1회 업로드 -> 관리/조회 반영 확인
- [ ] 수동 시나리오 3: vehicle 엑셀 1회 업로드 -> 관리/조회 반영 확인
- [ ] 8) 문서
- [x] MIGRATION_STATUS 상태/메모 갱신
- [x] result 기록

================================================================================
중요 금지(재작업 방지)
- 1차 이관 중 merge 엔진까지 한 번에 구현하지 않는다
- `src2/kernel/**`에서 `@legacy` import 금지
- 로컬 스토리지 직접 접근 금지 (repo/domain만 사용)
- 엑셀 소스별 파서가 상호 참조하지 않도록 분리 유지

================================================================================
완료 정의(1차 MIGRATED)
- `/excel` loader가 src2 페이지를 가리킨다
- 기존 partner/weighing/vehicle 업로드 플로우가 깨지지 않는다
- 저장은 domain repo 경유로 동작한다
- build/smoke/URL 새로고침 게이트를 통과한다
- 2차(다중 포맷 통합) 확장을 위한 adapters/schema 골격이 문서와 일치한다

# SSOT 공통섹션 작업 순서표 - Status helper + StatusBadge (Partner + Vendor)

작성일: 2026-02-10
목적: 상태 판정은 도메인 helper로 유지하고, 배지는 공통 표시 컴포넌트로 통일

================================================================================
대상 공통섹션
- 섹션명: `StatusBadge`
- 적용 도메인: `partner`, `vendor`
- 목표: kernel SSOT + 재사용 2도메인 + build 통과
- 범위 경계: 상태 계산 규칙은 schema helper에서 수행, 배지는 표시만 수행

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정(섹션 1개)
- [x] 1) kernel 컴포넌트 생성
  - [x] `src2/kernel/components/status/StatusBadge.tsx`
  - [x] `src2/kernel/components/status/index.ts`
  - [x] `src2/kernel/components/index.ts` export 연결
- [x] 2) 도메인 helper 구성
  - [x] `src2/kernel/schema/partner/statusHelpers.ts`
  - [x] `src2/kernel/schema/vendor/statusHelpers.ts`
  - [x] 각 domain `index.ts` export 연결
- [x] 3) 도메인 적용
  - [x] `PartnerRegisterPage.tsx`에서 helper 계산 + `StatusBadge` 렌더
  - [x] `VendorRegisterPage.tsx`에서 helper 계산 + `StatusBadge` 렌더
- [x] 4) 규칙 검증
  - [x] `StatusBadge.tsx`에 schema/helper import 없음(표시 전용)
- [x] 5) 게이트
  - [x] `npm run build`
  - [x] `grep` 재사용 확인
- [x] 6) 문서
  - [x] result 기록

================================================================================
완료판정
- [x] 상태 계산과 표시 책임이 분리됨(helper vs badge)
- [x] 서로 다른 2도메인에서 `StatusBadge` import 확인
- [x] `StatusBadge`는 표시만 수행
- [x] 게이트 통과 + 문서 기록 완료

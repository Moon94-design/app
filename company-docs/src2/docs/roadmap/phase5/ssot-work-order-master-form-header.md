# SSOT 공통섹션 작업 순서표 - MasterFormHeader (Partner + Vendor)

작성일: 2026-02-10
목적: 공통 상단 헤더를 kernel SSOT로 고정하고 2도메인 재사용 검증

================================================================================
대상 공통섹션
- 섹션명: `MasterFormHeader`
- 적용 도메인: `partner`, `vendor`
- 목표: kernel SSOT + 재사용 2회 이상 + build 통과
- 범위 경계: 공통섹션만 적용, nav loader 교체/신규 페이지 이관 없음

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정(섹션 1개)
- [x] 1) kernel 컴포넌트 생성
  - [x] `src2/kernel/components/master/MasterFormHeader.tsx`
  - [x] `src2/kernel/components/master/index.ts`
  - [x] `src2/kernel/components/index.ts`, `src2/kernel/index.ts` export 연결
- [x] 2) 도메인 helper 연결(필요 시)
  - [x] 헤더는 도메인 규칙 직접 결합 없음(배지/문구는 props로 주입)
- [x] 3) 도메인 1 적용(Partner)
  - [x] `PartnerRegisterPage.tsx`에서 공통 헤더 사용
- [x] 4) 도메인 2 적용(Vendor)
  - [x] `VendorRegisterPage.tsx`에서 공통 헤더 사용
- [x] 5) 게이트
  - [x] `npm run build`
  - [x] 핵심 기능 확인(초기화/제목/배지 표시)
- [x] 6) 문서
  - [x] result 기록

================================================================================
완료판정
- [x] 공통 컴포넌트가 kernel에서 export된다.
- [x] 최소 2개 도메인이 같은 컴포넌트를 사용한다.
- [x] `grep`으로 `<ComponentName>` import가 서로 다른 2개 도메인 페이지에 존재함을 확인한다.
- [x] 페이지 파일은 조립 책임만 남는다.
- [x] 게이트 통과 + 문서 기록 완료.

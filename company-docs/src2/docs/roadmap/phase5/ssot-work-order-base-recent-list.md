# SSOT 공통섹션 작업 순서표 - BaseRecentList (Vendor + Agency)

작성일: 2026-02-10
목적: 최근 목록 렌더 패턴을 공통화하고 도메인별 어댑터(props 주입)로 분리

================================================================================
대상 공통섹션
- 섹션명: `BaseRecentList`
- 적용 도메인: `vendor`, `agency`
- 목표: kernel SSOT + 재사용 2도메인 + build 통과
- 범위 경계: BaseRecentList는 표시만 담당, 정렬/라벨/액션은 각 도메인 섹션에서 props 주입

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정(섹션 1개)
- [x] 1) kernel 컴포넌트 생성
  - [x] `src2/kernel/components/recent/BaseRecentList.tsx`
  - [x] `src2/kernel/components/recent/index.ts`
  - [x] `src2/kernel/components/index.ts` export 연결
- [x] 2) 도메인 적용(어댑터)
  - [x] `VendorRecentList.tsx` -> BaseRecentList 사용
  - [x] `AgencyRecentList.tsx` -> BaseRecentList 사용
- [x] 3) 규칙 검증
  - [x] BaseRecentList 내부 domain helper import 없음
  - [x] 도메인별 라벨/동작은 render props로 주입
- [x] 4) 게이트
  - [x] `npm run build`
  - [x] `grep` 재사용 확인
- [x] 5) 문서
  - [x] result 기록

================================================================================
완료판정
- [x] 공통 컴포넌트가 kernel에서 export된다.
- [x] 서로 다른 2도메인에서 같은 컴포넌트를 import한다.
- [x] 공통 컴포넌트에 domain 규칙 결합이 없다.
- [x] 게이트 통과 + 문서 기록 완료.

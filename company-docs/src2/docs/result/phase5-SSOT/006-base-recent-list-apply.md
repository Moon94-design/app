# BaseRecentList SSOT 적용 (Vendor + Agency)

> 작성일: 2026-02-10
> 주제: 최근 목록 공통 렌더를 kernel로 승격하고 도메인 어댑터 구조로 분리

---

## 변경 요약
- `BaseRecentList`를 kernel 공통 컴포넌트로 신규 도입.
- `VendorRecentList`, `AgencyRecentList`를 공통 컴포넌트 기반 어댑터로 전환.
- 공통 컴포넌트는 표시만 담당하고, 도메인 라벨/액션은 render props로 주입.

## 코드 변경
- 신규
  - `src2/kernel/components/recent/BaseRecentList.tsx`
  - `src2/kernel/components/recent/index.ts`
  - `src2/docs/roadmap/phase5/ssot-work-order-base-recent-list.md`

- 수정
  - `src2/kernel/components/index.ts` (`recent` export 추가)
  - `src2/app/pages/vendor/sections/VendorRecentList.tsx`
  - `src2/app/pages/agency/sections/AgencyRecentList.tsx`

## 재사용 검증(grep)
- `VendorRecentList.tsx`, `AgencyRecentList.tsx`에서 `BaseRecentList` import 확인
- 결과: 2도메인 재사용 조건 충족

## 규칙 검증
- `BaseRecentList.tsx`는 domain schema/helper import 없음
- 정렬/라벨/액션은 도메인 어댑터에서 props 주입으로 처리

## 게이트 확인
- `npm run build` 성공

다음 질문: SSOT 1차 5개가 완료됐으니, 다음은 Manage 편집 패널에 공통섹션(헤더/상태/연락처/프로필)을 연결할까?

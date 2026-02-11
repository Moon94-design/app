# Status helper + StatusBadge SSOT 적용 (Partner + Vendor)

> 작성일: 2026-02-10
> 주제: 상태 계산(helper)과 표시(badge) 책임 분리 후 2도메인 적용

---

## 변경 요약
- `StatusBadge`를 kernel 공통 컴포넌트로 추가(표시 전용).
- `partner/vendor`의 상태 계산은 도메인 schema helper에서 수행 후 badge에 props로 주입.
- "계산은 helper, 렌더는 badge" 규칙을 코드로 고정.

## 코드 변경
- 신규
  - `src2/kernel/components/status/StatusBadge.tsx`
  - `src2/kernel/components/status/index.ts`
  - `src2/kernel/schema/partner/statusHelpers.ts`
  - `src2/kernel/schema/vendor/statusHelpers.ts`
  - `src2/docs/roadmap/phase5/ssot-work-order-status-badge.md`

- 수정
  - `src2/kernel/components/index.ts` (`status` export 추가)
  - `src2/kernel/schema/partner/index.ts` (`statusHelpers` export 추가)
  - `src2/kernel/schema/vendor/index.ts` (`statusHelpers` export 추가)
  - `src2/app/pages/partner/PartnerRegisterPage.tsx`
  - `src2/app/pages/vendor/VendorRegisterPage.tsx`

## 재사용 검증(grep)
- `PartnerRegisterPage.tsx`, `VendorRegisterPage.tsx`에서 `StatusBadge` import 확인
- 결과: 2도메인 재사용 조건 충족

## 규칙 검증
- `StatusBadge.tsx`는 domain schema/helper import 없음(표시 전용)

## 게이트 확인
- `npm run build` 성공

다음 질문: SSOT 5순위인 `BaseRecentList + domain adapter`로 넘어갈까?

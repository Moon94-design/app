# MasterFormHeader SSOT 적용 (Partner + Vendor)

> 작성일: 2026-02-10
> 주제: 공통 상단 헤더를 kernel/components로 고정하고 2도메인 재사용 검증

---

## 변경 요약
- `MasterFormHeader`를 kernel 공통 컴포넌트로 신규 도입.
- `PartnerRegisterPage`, `VendorRegisterPage` 상단 헤더를 공통 컴포넌트로 교체.
- Partner 편집 모드 배지는 도메인 규칙이 아닌 `rightSlot` props로 주입해 결합도 분리.

## 코드 변경
- 신규
  - `src2/kernel/components/master/MasterFormHeader.tsx`
  - `src2/kernel/components/master/index.ts`
  - `src2/docs/roadmap/phase5/ssot-work-order-master-form-header.md`

- 수정
  - `src2/kernel/components/index.ts` (`master` export 추가)
  - `src2/kernel/index.ts` (`components` export 추가)
  - `src2/app/pages/partner/PartnerRegisterPage.tsx` (공통 헤더 적용)
  - `src2/app/pages/vendor/VendorRegisterPage.tsx` (공통 헤더 적용)

- 정리
  - `src2/app/pages/partner/sections/PartnerHeader.tsx` 제거(미사용)

## 재사용 검증(grep)
- `PartnerRegisterPage.tsx`, `VendorRegisterPage.tsx`에서 `MasterFormHeader` import 확인
- 결과: 2도메인 재사용 조건 충족

## 게이트 확인
- `npm run build` 성공

다음 질문: 다음 SSOT 2순위인 `ProfilesEditor + dedupe/merge`를 Partner/Vendor에 이어서 적용할까?

## 검증 메모 (안전성 확인)
- `PartnerHeader.tsx` 코드 참조 검색 결과: 0 (`company-docs/src2/app` 기준)
- `MasterFormHeader.tsx`의 domain 규칙 import 검색 결과: 0 (schema/helper 직접 import 없음, props 주입만 사용)

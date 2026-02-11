# ProfilesEditor SSOT 적용 (Partner Register + Bulk)

> 작성일: 2026-02-10
> 주제: 거래 프로필 편집 UI와 dedupe/merge 정책을 공통화해 중복 제거

---

## 변경 요약
- `ProfilesEditor`를 kernel 공통 컴포넌트로 신규 도입.
- Partner 등록 섹션과 Partner 일괄수정 패널이 같은 프로필 편집 UI를 재사용.
- 프로필 정책(기본값/키/dedupe/merge)을 `kernel/schema/partner/profileHelpers.ts`로 이동.

## 코드 변경
- 신규
  - `src2/kernel/components/profiles/ProfilesEditor.tsx`
  - `src2/kernel/components/profiles/index.ts`
  - `src2/kernel/schema/partner/profileHelpers.ts`
  - `src2/docs/roadmap/phase5/ssot-work-order-profiles-editor.md`

- 수정
  - `src2/kernel/components/index.ts` (`profiles` export 추가)
  - `src2/kernel/schema/partner/index.ts` (`profileHelpers` export 추가)
  - `src2/app/pages/partner/sections/PartnerProfilesSection.tsx`
  - `src2/app/pages/partner/sections/PartnerCreateFlow.tsx`
  - `src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx`
  - `src2/app/pages/partner/bulk/usePartnerBulkEdit.ts`
  - `src2/app/pages/partner/PartnerRegisterPage.tsx`

## 재사용 검증(grep)
- `PartnerProfilesSection.tsx`, `PartnerBulkEditPanel.tsx`에서 `ProfilesEditor` import 확인
- 결과: 공통 컴포넌트 재사용 2회 확인

## 게이트 확인
- `npm run build` 성공

## 메모
- Profiles는 현재 partner 도메인 특화 모델이라 1차는 partner 내부 재사용부터 고정.
- 다음 단계에서 vendor/agency 확장 시 adapter 규칙으로 연결 예정.

다음 질문: SSOT 3순위인 `ContactsEditor`를 `Vendor + Agency`에 바로 적용할까?

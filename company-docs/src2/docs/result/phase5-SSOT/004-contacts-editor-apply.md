# ContactsEditor SSOT 적용 (Vendor + Agency)

> 작성일: 2026-02-10
> 주제: 연락처 편집 UI를 kernel 공통 컴포넌트로 고정하고 2도메인 재사용 검증

---

## 변경 요약
- `ContactsEditor`를 kernel 공통 컴포넌트로 신규 도입.
- `VendorContactsSection`, `AgencyContactsSection`이 같은 컴포넌트를 재사용하도록 전환.
- 도메인 차이(email 입력 유무, placeholder)는 props로 주입해 공통성 유지.

## 코드 변경
- 신규
  - `src2/kernel/components/contacts/ContactsEditor.tsx`
  - `src2/kernel/components/contacts/index.ts`
  - `src2/docs/roadmap/phase5/ssot-work-order-contacts-editor.md`

- 수정
  - `src2/kernel/components/index.ts` (`contacts` export 추가)
  - `src2/app/pages/vendor/sections/VendorContactsSection.tsx`
  - `src2/app/pages/agency/sections/AgencyContactsSection.tsx`

## 문서 규칙 보강
- `src2/docs/roadmap/phase5/ssot-factory-roadmap.md`
  - 2도메인 재사용 기본 기준 + 1도메인 예외(DECISIONS_LOG 기록 의무) 추가
- `src2/docs/roadmap/phase5/ssot-factory-checklist.md`
  - 예외 승격 시 선기록 체크 항목 추가
- `src2/docs/rule/DECISIONS_LOG.md`
  - 2도메인 기본/예외 허용 정책 결정 기록 추가

## 재사용 검증(grep)
- `VendorContactsSection.tsx`, `AgencyContactsSection.tsx`에서 `ContactsEditor` import 확인
- 결과: 2도메인 재사용 조건 충족

## 게이트 확인
- `npm run build` 성공

## 메모
- `ContactsEditor`는 domain helper를 직접 import하지 않고, 차이는 props 주입으로 처리.

다음 질문: SSOT 4순위인 `Status helper + StatusBadge`를 partner부터 적용할까?

# Phase4 파일럿 — 거래처 V2 이관 적용

> 작성일: 2026-02-09
> 주제: Partner V2를 src2로 이관하고 loader 교체

---

## 작업 요약
- Partner V2 타입을 kernel/schema로 정본화
- 거래처 등록 단일 페이지를 src2/app/pages로 이관
- navConfig loader를 @app2 페이지로 교체
- draft 초기화 버튼을 페이지 우상단에 배치

## 변경 파일
- src2/kernel/schema/partner/partnerTypes.ts
- src2/kernel/schema/partner/index.ts
- src2/kernel/schema/index.ts
- src2/app/pages/partner/PartnerRegisterPage.tsx
- src2/app/pages/partner/index.ts
- src2/app/pages/partner/sections/PartnerHeader.tsx
- src2/app/pages/partner/sections/PartnerBaseSection.tsx
- src2/app/pages/partner/sections/PartnerExtraSection.tsx
- src2/app/pages/partner/sections/PartnerProfilesSection.tsx
- src2/app/pages/partner/sections/PartnerRecentList.tsx
- src2/app/nav/navConfig.ts
- src2/docs/rule/MIGRATION_STATUS.md

## 의견
- 타입을 kernel/schema로 옮겨두니 관리/조회/업로드로 확장할 때 SSOT 유지가 쉬워졌다.

## 다음 진행 질문
- G4 체크(등록/수정/초기화 동작 + build/dev 통과)까지 바로 확인할까?

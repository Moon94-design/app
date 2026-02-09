# Phase4 Partner V2 신규 등록 폼 재구성

> 작성일: 2026-02-09
> 주제: Create 모드 순서 기반 입력 폼 적용

---

## 작업 요약
- Create 모드에서 Base/Extra 분리 UX 제거
- 순서 기반 입력 폼(파트너 정보 → 주소/사업자 → 담당자 → 메모/계좌 → 중요도/관계 → 프로필) 적용
- Edit 모드는 기존 섹션 구조 유지

## 변경 파일
- src2/app/pages/partner/sections/PartnerCreateFlow.tsx
- src2/app/pages/partner/PartnerRegisterPage.tsx

## 의견
- Create 모드에서 입력 순서가 명확해져 신규 등록 흐름이 간결해졌고, Edit 모드 구조는 유지되어 리스크가 낮다.

## 다음 진행 질문
- G4 체크(등록/수정/초기화 동작 + build/dev 통과) 진행할까?

# Phase4 Partner V2 문구/흐름 보정

> 작성일: 2026-02-09
> 주제: 등록 화면 문구 정리 및 미완료 처리 동선 보정

---

## 작업 요약
- 등록/수정 화면에서 "V2" 문구 제거
- Create 모드에서 미완료 배지 숨김
- 미입력 문구를 "미완료"로 통일
- 등록 저장 후 미완료 시 관리 화면으로 이동

## 변경 파일
- src2/app/pages/partner/sections/PartnerHeader.tsx
- src2/app/pages/partner/PartnerRegisterPage.tsx
- src/app/pages/manage/master/PartnerManage.tsx
- src/app/pages/register/partner/RegisterPartnerV2.tsx

## 의견
- Create 모드 흐름이 더 간결해졌고, 미완료 항목은 관리 화면에서 처리하도록 분리돼 유지보수에 유리하다.

## 다음 진행 질문
- G4 체크(등록/수정/초기화 동작 + build/dev 통과)를 지금 진행할까?

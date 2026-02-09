# 거래처 관리 리스트 domain repo 읽기 연결

> 작성일: 2026-02-09
> 주제: 거래처 관리 화면에서 partnerRepo.getAll()로 리스트 읽기 연결

---

## 작업 요약
- 거래처 관리/조회 리스트 화면에서 partnerRepo.getAll()로 읽기 연결
- 파트너 키를 기존 저장 키와 정합되도록 맞춤

## 변경 파일
- src/app/pages/manage/master/PartnerManage.tsx
- src2/kernel/repo/keys.ts
- .github/copilot-instructions.md

## 의견
- 이 단계에서는 “읽기 경로만 domain repo로 통과”시키는 게 가장 안전했고, 기존 화면을 크게 건드리지 않아 리스크가 낮음.

## 다음 진행 질문
- 다음으로 “UI에서 domain repo 연결”을 어떤 화면에 이어서 붙일까요? (예: 거래처 등록, 차량 관리, 일일기록 조회)

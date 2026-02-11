# 공장 방식 작업 순서표 - /register/master/consumable

작성일: 2026-02-10
목적: 기준등록(소모품) 페이지 이관 실행 기록

================================================================================
대상 페이지
- 라우트: `/register/master/consumable`
- 도메인: `consumable`
- 목표 상태: MIGRATED (src2 페이지, @legacy 0, @kernel only)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: 대상 페이지 1개만 (다른 페이지/기능 추가 금지)
- [x] 1) `src2/app/pages/consumable/ConsumableRegisterPage.tsx` 생성 (페이지는 얇게)
- [x] 2) sections 분리
- [x] `ConsumableFormSection.tsx`
- [x] `ConsumableRecentList.tsx`
- [x] 3) hooks/state 분리(필요 시)
- [x] `useConsumableRegisterPage.ts`
- [x] 4) kernel 연결
- [x] schema helper 사용(`kernel/schema/consumable`, `kernel/schema/equipment`)
- [x] domain repo 사용(`createConsumableRepo`, `createEquipmentRepo`, `createVendorRepo`)
- [x] draft 사용(`DRAFT_KEYS.consumableRegister`) + resetDraft 적용
- [x] 키 하드코딩 0(`STORAGE_KEYS.consumable`)
- [x] 5) navConfig loader 교체(해당 path만)
- [x] 6) 게이트
- [x] `npm run build`
- [x] 직접 URL + 재요청(새로고침 대체) OK
- [x] 기능 최소 확인(저장/삭제/설비 연동/드래프트 초기화 코드 경로 점검)
- [x] 7) 문서
- [x] MIGRATION_STATUS 업데이트
- [x] result 기록

================================================================================
중요 금지(재작업 방지)
- src 수정 금지(예외는 DECISIONS_LOG에 이유/종료조건/1회 제한)
- component 필드 금지(loader only)
- impl 직접 import 금지(domain repo만)
- localStorage 직접 접근 금지(storage adapter/repo 경유)

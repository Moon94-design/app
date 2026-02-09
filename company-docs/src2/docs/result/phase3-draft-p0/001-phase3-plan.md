# Phase 3(draft P0) 계획

> 작성일: 2026-02-09
> 주제: draftKeys/useDraft/draftRepo P0 설계 및 최소 검증

---

## 목표
- draftKeys 기반 도메인 키 규칙 확정
- useDraft<T> P0(dirty/save/discard/load) 동작
- draftRepo가 jsonStorage adapter를 통해 저장

## 사전 조건
- Phase 2 repo/types + keys + localRepo 완료
- @legacy import는 src2/kernel에서 0 유지

## 작업 범위
1) draftKeys.ts
- 도메인 규칙으로 키 정의
- 예: draft:partner:v2, draft:daily:prod

2) draftRepo.ts
- jsonStorage adapter 사용
- 저장/로드/삭제 최소 API 제공

3) useDraft.ts (P0)
- dirty 상태 추적
- save/discard/load 제공
- autosave(P1)은 보류

4) index.ts 정리
- draft 관련 export 통제

## 최소 검증
- node 스크립트로 draft 저장/로드/삭제 1회 확인
- UI에 얇게 연결(예: 거래처 등록 임시 draft 복원) 1건

## 의견
- useDraft는 범용화를 우선하고, 도메인 특화 로직은 domain repo 또는 페이지 레벨로 유지하는 게 안전.

## 다음 진행 질문
- UI에서 draft 연결할 첫 화면을 어디로 할까요? (예: 거래처 등록, 일일기록 등록)

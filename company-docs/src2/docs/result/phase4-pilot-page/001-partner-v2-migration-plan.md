# Phase 4 파일럿 — 거래처 V2 단일 등록 페이지 이관 계획

> 작성일: 2026-02-09
> 주제: Partner V2를 src2로 이관해 거래처 등록 단일 페이지로 고정

---

## 목표
- 거래처 등록을 src2 단일 페이지로 전환(Partner V2 기준)
- navConfig loader를 @app2 페이지로 교체
- @legacy import 0, @kernel만 사용
- G4 게이트 통과

## 범위
- 대상 경로: /register/master/partner (라우트 유지)
- 대상 화면: 거래처 V2 등록/수정 UI를 단일 페이지로 통합

## 작업 단계
1) 구조 설계(SSOT 준수)
- src2/app/pages/partner/ 폴더 생성
- 500 LOC 초과 방지: 화면/섹션 분리(기본정보/추가정보/프로필/헤더 등)
- 페이지는 @kernel barrel 기반으로만 의존

2) 데이터/타입 정리
- Partner V2 타입을 src2/kernel/schema/partner/* 로 옮기거나 src2/app/pages/partner/types.ts로 정리
- draft는 @kernel/draft(useDraft + DRAFT_KEYS) 사용
- repo는 @kernel/repo domain repo만 사용(impl 직접 금지)

3) UI 페이지 구현
- Create/Edit 단일 페이지 구성(모드 전환은 query 또는 내부 상태)
- draft 초기화 버튼을 작성 페이지 오른쪽 상단에 배치
- 저장/수정/삭제는 domain repo를 통해 처리
- migrate 로직은 useDraft의 migrate로 유지

4) navConfig 이관
- /register/master/partner loader 교체
  - 전환 전: @legacy/app/pages/register/RegisterPartner
  - 전환 후: @app2/pages/partner/PartnerPage
- path/label은 그대로 유지

5) 검증(G4)
- build/dev 통과
- 화면 기본 동작(등록/수정/드래프트 저장/복원/초기화)
- @legacy import 0 확인

6) 문서 업데이트
- MIGRATION_STATUS: 해당 페이지 SHADOW → MIGRATED
- GATES_CHECKLIST: G4 항목 체크
- 결과 파일 작성

## 리스크/대응
- 레거시 타입 의존 잔존 가능 → 타입을 src2로 이동해 @legacy 의존 제거
- 파일 과대화 위험 → 섹션 컴포넌트 분리로 350~500 LOC 기준 준수

## 의견
- V2를 단일 등록 페이지로 고정하면 향후 마스터 이관의 기준점이 된다.

## 다음 진행 질문
- 타입 위치를 kernel/schema로 둘까, app/pages/partner 내부로 둘까?

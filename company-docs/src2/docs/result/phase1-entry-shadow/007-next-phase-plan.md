# 다음 단계 계획

> 작성일: 2026-02-09
> 주제: TS 빨간줄 분리 대응 및 Phase 2 계획

---

## TS 빨간줄 대응(런타임과 분리)
- 현상: main.tsx의 import App에서 에디터 진단만 남음
- 런타임/빌드는 정상(G0 통과). 우선순위는 런타임이므로 분리 대응
- 권장 순서
  1) TypeScript 서버 재시작
  2) VS Code 창 새로고침
  3) 워크스페이스 루트가 company-docs인지 확인
  4) 대소문자 경로 확인(App.tsx vs app.tsx)

## Phase 2 계획(roadmap 기준)
- 목표: kernel/repo 인프라 정본화(P0)
- 선행 조건: Phase 1 G1 통과 유지

### 2-1) keys.ts SSOT 생성
- 위치: src2/kernel/repo/keys.ts
- 저장소 키 상수 정의(하드코딩 금지 규칙 충족)

### 2-2) jsonStorage 단일 어댑터 확립
- 위치: src2/kernel/repo/storage/jsonStorage.ts
- localStorage 직접 접근 금지 규칙 준수

### 2-3) repo/types SSOT 확정
- 위치: src2/kernel/repo/types.ts
- RepoContract, DocRepoContract 정의 확정

### 2-4) localRepo/serverRepo 골격
- 위치: src2/kernel/repo/impl/localRepo.ts, serverRepo.ts
- storage adapter 주입형 구조로 설계

### 2-5) domain repo 정착
- 위치: src2/kernel/repo/domain/*
- UI는 domain repo만 사용(impl 직접 금지)

### 2-G) 게이트 체크 준비
- G2 체크리스트 항목 충족 여부 확인
- 완료 시 GATES_CHECKLIST 갱신

## 비고
- main.tsx import 확장자 변경은 보류(규칙 준수)

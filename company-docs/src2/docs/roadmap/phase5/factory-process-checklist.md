# 페이지 이관 공정 체크리스트 (Factory Process)

작성일: 2026-02-09
목적: 1페이지를 반복적으로 빠르게 이관하기 위한 고정 공정

================================================================================
공정 순서(고정)
0) 사전
- [ ] DOCS_GUIDE / main_rule / MIGRATION_STATUS 확인
- [ ] 대상 페이지(라우트) 1개만 고정(범위 확장 금지)

1) 껍데기(Page) 생성
- [ ] `src2/app/pages/<domain>/<Page>.tsx` 생성
- [ ] 책임 고정: 라우트/모드 결정 + domain repo 호출 + draft on/off + 섹션 조립만

2) sections 분리
- [ ] UI 덩어리를 `pages/<domain>/sections/*` 로 분리
- [ ] 페이지 파일에 긴 JSX/복잡 UI 금지

3) hooks/state 분리(필요 시)
- [ ] 페이지 전용 상태/행동을 `pages/<domain>/hooks/useXxxPage.ts` 로 분리
- [ ] bulk/복잡 로직은 `pages/<domain>/bulk/*` 또는 `services/*` 로 분리

4) kernel 연결(정본 사용)
- [ ] 타입/규칙: `kernel/schema/<domain>/`
- [ ] 저장: `kernel/repo/domain/<domain>Repo` (impl 직접 사용 금지)
- [ ] draft: `kernel/draft` (`useDraft` + `resetDraft` 규칙)
- [ ] 공용 입력 UI/유틸: `kernel/components`, `kernel/utils` 사용
- [ ] `src/base/utils/*` 직접 import 금지 (`@kernel/utils` 경유만 허용)
- [ ] 키/스냅샷 키: `kernel/repo/keys.ts` (하드코딩 금지)

5) nav loader 교체
- [ ] navConfig에서 해당 path의 loader만 src2 페이지로 교체
- [ ] path 변경 금지, component 필드 금지(loader only)

6) 검증 게이트(필수)
- [ ] `npm run build`
- [ ] `npm run dev`: 해당 URL 직접 입력 + 새로고침
- [ ] 기능 최소 확인(읽기/저장/드래프트/초기화 중 해당 페이지 항목)

7) 문서/상태 갱신
- [ ] MIGRATION_STATUS: SHADOW -> MIGRATED
- [ ] GATES_CHECKLIST 체크
- [ ] result/{topic}/NNN-*.md 기록

================================================================================
시간 박스(고정 규칙)
- 목표: 90~120분/페이지
- 30분 내 분리 구조(sections/hooks)가 안 잡히면 즉시 더 쪼갠다
- 파일 350~500 LOC 가이드 초과 시 분리 우선(누적 안정성 > 속도)

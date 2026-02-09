# Phase 1 문서 정본 보완 — 분석AI 최종 피드백 반영

> 작성일: 2026-02-09
> 주제: 4개 SSOT 문서에 loader 패턴 / 전역 Suspense / docs SSOT 위치 최종 반영

---

## 변경 파일 4개

### 1. main_rule.md
- 절대 금지: "component 참조만 교체" → "loader 참조만 교체 (component 직접 보유 금지)"
- 절대 금지에 "navConfig에 component 필드 금지 → loader 함수만 사용" 추가
- 섹션 6 이관 규칙: component → loader 교체로 전면 수정 (전환전/후 loader import 경로 명시)
- R1/R2/R8/R9/R10은 이전 턴에서 반영 완료 — 유지

### 2. DECISIONS_LOG.md
- 3개 결정 문구를 사용자 지시 정본으로 교체:
  - "NavItem component → loader 패턴으로 전환"
  - "Suspense는 App.tsx 전역 1회만"
  - "docs SSOT를 company-docs/src2/docs로 이동"

### 3. GATES_CHECKLIST.md
- G1에 체크 2개 추가:
  - `[ ] navConfig는 loader만 사용(component 필드 없음), lazy는 routes에서만 처리됨`
  - `[ ] Suspense는 App.tsx에만 존재(routes.tsx에는 없음)`

### 4. roadmap.md
- Phase 1-1 navConfig 설명: loader 기반으로 전면 교체
- 섹션 C 운영 원칙: "docs SSOT: company-docs/src2/docs/" 추가

---

## 철근 3개 (모든 작업에서 절대 위반 금지)

1. **loader 패턴**: navConfig는 loader만 보유. component 직접 보유 금지. React.lazy(loader)는 routes.tsx에서만.
2. **전역 Suspense**: App.tsx 한 곳에서만 Suspense + ErrorBoundary. routes.tsx에 Suspense 추가 금지.
3. **docs SSOT**: company-docs/src2/docs/가 정본. /workspaces/app/src2/docs/는 백업.

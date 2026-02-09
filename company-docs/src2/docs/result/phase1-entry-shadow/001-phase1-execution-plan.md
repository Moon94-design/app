# Phase 1 실행 계획 확정 (0단계 + 1단계)

> 작성일: 2026-02-09
> 주제: Phase 1 범위 판단 + 레거시 실사 + 상세 실행 계획

---

## 범위 판단: Phase 1 (0+1단계) 한 세트

| 기준 | 판단 |
|------|------|
| 변경 파일 수 | ~13개 (수정 3 + 신규 ~10) — 통제 가능 |
| 비즈니스 로직 | 0 — 순수 구조 변경만 |
| 의존성 복잡도 | 낮음 — Provider 0, 글로벌 state 0 |
| CSS 의존 | 단순 — index.css(29줄) + shell.css(385줄) |
| 롤백 난이도 | 쉬움 — index.html 되돌리면 원복 |

Phase 2 이상은 설계 구현 포함이므로 별도 세션.

---

## 레거시 실사 핵심 발견

- main.tsx: `StrictMode` + `BrowserRouter` + CSS import 1개(`index.css`)
- App.tsx: `AppRoutes` + `UiEditOverlay`(dev 전용)
- 글로벌 Provider/Context: **0개** (Toast/Modal/Theme 없음)
- navConfig: 26개 라우트, static import
- Shell: header(brand+breadcrumb+topActions) + subbar(quickTabs) + main
- CSS: `index.css`(리셋 29줄) + `shell.css`(디자인시스템 385줄)
- `App.css`: 어디서도 import 안 함 → 무시
- `overrides.css`: 비어있음 → 무시

---

## 결정사항

| 결정 | 이유 |
|------|------|
| UiEditOverlay 생략 | dev 전용, 나중에 필요하면 추가 |
| `@legacy/index.css`로 리셋 재사용 | 전환 기간 복사 불필요 |
| shell.css는 src2에 복사 | Shell이 src2 소속 |

---

## 실행 순서

### 0단계
1. vite.config.ts — alias 3개
2. tsconfig.app.json — include + paths
3. src2/app/main.tsx — BrowserRouter + CSS
4. src2/app/components/Loading.tsx — fallback
5. src2/app/components/ErrorBoundary.tsx — 에러 안내
6. src2/app/App.tsx — Suspense + ErrorBoundary + AppRoutes
7. index.html — 엔트리 변경 (마지막)
8. G0 검증

### 1단계
1. src2/app/nav/navConfig.ts — 26개 lazy
2. src2/app/nav/navModel.ts — breadcrumb/quickTabs
3. src2/app/shell/Shell.tsx + shell.css — 복제
4. src2/app/routes/routes.tsx — flattenRoutes
5. G1 검증
6. MIGRATION_STATUS / GATES_CHECKLIST 업데이트

# 분석AI 피드백 반영 — 문서 보완

> 작성일: 2026-02-09
> 주제: 분석AI 12개 포인트 검토 후 4개 md 보완 + 6개 신규 결정 확정

---

## 피드백 요약 + 조치

### 확정/반영한 항목 (7개)

| # | 피드백 | 조치 | 변경 파일 |
|---|--------|------|-----------|
| 1-1 | result 파일명 규칙 충돌 (NNN_ vs NNN-) | **NNN-title.md (하이픈)으로 통일** | DOCS_GUIDE.md |
| 1-2 | result 작성 과잉 위험 | **"코드/문서 변경이 있었던 턴에만"으로 세분화** | DOCS_GUIDE.md |
| 1-5 | Router 중복 경고 체크 | **G1에 "콘솔 Router 경고 0개" 항목 추가** | GATES_CHECKLIST.md |
| 2-1 | docs 위치 문제 | **company-docs/src2/docs/ 를 SSOT로 확정** | main_rule.md R10 |
| 2-3 | NavItem.component vs loader | **loader 함수 패턴 채택** | main_rule.md R2 |
| 2-4 | Suspense 이중 배치 | **App.tsx 전역 한 군데로 고정** | main_rule.md R8 |
| CSS | CSS import 위치 룰 | **main.tsx=리셋, Shell.tsx=디자인** | main_rule.md R9 |

### 확인 완료 (리스크 없음, 5개)

| # | 피드백 | 확인 결과 |
|---|--------|-----------|
| 1-3 | Shell.tsx 의존 파일 스캔 | Shell.tsx → react, react-router-dom, navModel, shell.css **만**. 아이콘/이미지/서브컴포넌트 0 |
| 1-4 | @legacy/index.css import 위치 | main.tsx에서 import — 이미 계획대로 |
| 1-6 | UiEditOverlay 생략 | 기존 결정 유지 |
| 2-2 | alias 경로 정확성 | `path.resolve(__dirname, "src")` 등 — 프로젝트 루트(company-docs/) 기준. 정확함 |
| 2-5 | shell.css url() 참조 | shell.css 내 `url()` 0개 — 복사 안전 |

---

## 신규 결정 (DECISIONS_LOG에 추가)

1. NavItem loader 패턴 (component 직접 보유 금지)
2. Suspense App.tsx 전역 한 군데
3. result 파일명 NNN-title.md 하이픈 고정
4. docs SSOT: company-docs/src2/docs/
5. CSS import 위치: main.tsx(리셋) + Shell.tsx(디자인)
6. result 작성 조건: 코드/문서 변경 턴에만

---

## main_rule.md 추가된 룰

- **R8**: Suspense/ErrorBoundary 위치 고정 (App.tsx 전역)
- **R9**: CSS import 위치 규칙 (main.tsx=리셋, Shell.tsx=디자인)
- **R10**: docs SSOT 위치 (company-docs/src2/docs/)

---

## 다음 작업

Phase 1 구현 시 반영할 변경점:
- navConfig.ts: `component` 필드 대신 `loader` 필드 사용
- routes.tsx: `React.lazy(item.loader)` 변환, Suspense 없음
- App.tsx: `<ErrorBoundary><Suspense><AppRoutes /></Suspense></ErrorBoundary>` 구조
- docs 신규 파일은 company-docs/src2/docs/에 생성

# Phase 1 구현 계획 (빌드 엔트리 전환 + Shadow Router)

> 작성일: 2026-02-09
> 주제: company-docs/src2/ 내부에 코드 생성하는 Phase 1 전체 구현 계획

---

## 핵심 결정

| 결정 | 이유 |
|------|------|
| src2 코드 위치: `company-docs/src2/` | Vite 프로젝트 루트(`company-docs/`) 안에 있어야 alias·index.html 경로가 자연스러움 |
| 문서는 `/workspaces/app/src2/docs/` 유지 | 기존 docs 구조 보존 |
| UiEditOverlay 제외 | dev 전용, 사용자 확인 완료 |
| NavItem.component 타입 확장 | `ComponentType \| LazyExoticComponent<ComponentType>` — lazy 전환 지원 |
| Suspense 위치: routes.tsx 단일 | 페이지별 분리는 Phase 4+ |
| CSS: @legacy/index.css + src2 shell.css 복사 | 리셋은 재사용, Shell CSS는 src2 소속 |

---

## 변경 파일 목록 (총 12개)

### 수정 (3개)
| 파일 | 변경 내용 |
|------|-----------|
| `company-docs/vite.config.ts` | `import path` + `resolve.alias` (@kernel, @app2, @legacy) |
| `company-docs/tsconfig.app.json` | `baseUrl`, `paths` 추가 + include `["src", "src2"]` |
| `company-docs/index.html` | script src → `/src2/app/main.tsx` (마지막 단계) |

### 생성 (9개)
| 파일 | 용도 |
|------|------|
| `company-docs/src2/app/main.tsx` | StrictMode + BrowserRouter + @legacy/index.css |
| `company-docs/src2/app/App.tsx` | Suspense + ErrorBoundary + AppRoutes |
| `company-docs/src2/app/components/Loading.tsx` | Suspense fallback UI |
| `company-docs/src2/app/components/ErrorBoundary.tsx` | class component 에러 경계 |
| `company-docs/src2/app/nav/navConfig.ts` | 26개 React.lazy + NavItem SSOT + 유틸 함수 |
| `company-docs/src2/app/nav/navModel.ts` | getBreadcrumb / getQuickTabs |
| `company-docs/src2/app/shell/Shell.tsx` | 레이아웃 (header/breadcrumb/quickTabs/main) |
| `company-docs/src2/app/shell/shell.css` | 디자인 시스템 384줄 복사 |
| `company-docs/src2/app/routes/routes.tsx` | flattenRoutes + Suspense-wrapped Routes |

---

## 실행 순서

### 0단계: 빌드 설정 변경
1. `vite.config.ts` — alias 3개 추가
2. `tsconfig.app.json` — include + paths
3. `src2/app/main.tsx` — 엔트리 작성
4. `src2/app/App.tsx` — Suspense + ErrorBoundary
5. `src2/app/components/Loading.tsx` + `ErrorBoundary.tsx`

### 1단계: Shadow Router
6. `src2/app/nav/navConfig.ts` — 26개 static → React.lazy 전환
7. `src2/app/nav/navModel.ts` — 복제
8. `src2/app/shell/Shell.tsx` + `shell.css` — 복제
9. `src2/app/routes/routes.tsx` — flattenRoutes + Suspense

### 엔트리 전환 (최종)
10. `index.html` — src → src2 (모든 파일 생성 후 마지막)

### 게이트 검증
11. `npm run build` → G0 (빌드 성공)
12. `npm run dev` → G1 (26개 경로 정상, lazy fallback, ErrorBoundary)

### 문서 갱신
13. MIGRATION_STATUS.md — G0/G1 체크, 26개 → SHADOW
14. GATES_CHECKLIST.md — G0/G1 항목 체크
15. result 파일 (구현 완료 후 003-*)

---

## 검증 기준

| 게이트 | 통과 조건 |
|--------|-----------|
| G0 | `npm run build` 에러 0, `npm run dev` 정상 기동, CSS/폰트 동일 |
| G1 | 26개 경로 레거시 페이지 정상 표시, Suspense fallback, ErrorBoundary, URL 직접입력/새로고침 |
| 롤백 | `index.html` script src를 `/src/main.tsx`로 복원 |

---

## 컨텍스트 메모

- 레거시 파일 전부 읽기 완료 (main.tsx, App.tsx, navConfig.ts, navModel.ts, routes.tsx, Shell.tsx, shell.css, index.css)
- company-docs/src2/ 디렉토리는 아직 없음 → 파일 생성 시 자동 생성
- /workspaces/app/src2/ (기존)에는 빈 스캐폴딩 + docs만 존재

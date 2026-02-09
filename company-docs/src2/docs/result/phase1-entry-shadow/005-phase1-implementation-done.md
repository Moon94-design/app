# Phase 1 구현 완료 — 빌드 엔트리 전환 + Shadow Router

> 작성일: 2026-02-09
> 주제: Phase 1 (0+1단계) 전체 구현 완료. G0/G1 게이트 통과.

---

## 결과: G0 + G1 통과

| 게이트 | 결과 |
|--------|------|
| G0 빌드 | ✅ `npm run build` 성공 — 116 modules, 39 chunks, 0 error |
| G0 dev | ✅ `npm run dev` 정상 기동 (5174 포트) |
| G0 CSS | ✅ `@legacy/index.css` import → 전역 리셋 적용 |
| G0 Provider | ✅ 없음 (레거시 확인: Provider 0개) |
| G1 라우트 | ✅ 26개 경로 전부 lazy chunk 분리 확인 |
| G1 loader | ✅ navConfig는 loader만 사용 (component 필드 없음) |
| G1 Suspense | ✅ App.tsx 전역 1회만 (routes.tsx에 없음) |
| G1 Router 중복 | ✅ BrowserRouter는 main.tsx 1회만 |

---

## 변경 파일 (총 12개)

### 수정 3개
| 파일 | 변경 |
|------|------|
| `company-docs/vite.config.ts` | `import path` + `resolve.alias` (@kernel, @app2, @legacy) |
| `company-docs/tsconfig.app.json` | `baseUrl`, `paths` 추가, include `["src", "src2"]` |
| `company-docs/index.html` | script src → `/src2/app/main.tsx` |

### 생성 9개
| 파일 | 용도 |
|------|------|
| `company-docs/src2/app/main.tsx` | 엔트리 — StrictMode + BrowserRouter + @legacy/index.css |
| `company-docs/src2/app/App.tsx` | ErrorBoundary + Suspense(전역) + AppRoutes |
| `company-docs/src2/app/components/ErrorBoundary.tsx` | class component 에러 경계 |
| `company-docs/src2/app/components/Loading.tsx` | Suspense fallback UI |
| `company-docs/src2/app/nav/navConfig.ts` | 26개 라우트 loader 패턴 SSOT |
| `company-docs/src2/app/nav/navModel.ts` | getBreadcrumb / getQuickTabs |
| `company-docs/src2/app/shell/Shell.tsx` | 레이아웃 (header/breadcrumb/quickTabs/main) |
| `company-docs/src2/app/shell/shell.css` | 디자인 시스템 384줄 (레거시 복사) |
| `company-docs/src2/app/routes/routes.tsx` | flattenRoutes → React.lazy(loader) → Routes |

---

## 철근 3개 준수 확인

1. ✅ **loader 패턴**: navConfig에 component 필드 없음. loader만 사용. React.lazy는 routes.tsx에서만.
2. ✅ **전역 Suspense**: App.tsx 1회만. routes.tsx에 Suspense 없음.
3. ✅ **@legacy 범위**: src2/app/**에서만 사용. kernel 오염 0.

---

## 문서 갱신

- GATES_CHECKLIST.md: G0 5항목 + G1 8항목 전부 [x] 체크
- MIGRATION_STATUS.md: G0/G1 완료, 26개 페이지 LEGACY → SHADOW

---

## 롤백 방법

`index.html`의 script src를 `/src/main.tsx`로 되돌리면 즉시 레거시 복원.

---

## 다음 단계

Phase 2: kernel/repo 인프라 (types.ts → keys.ts → jsonStorage → localRepo → domain repo)

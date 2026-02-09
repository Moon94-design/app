src → src2 전환 SSOT (항상 참조)
작성일: 2026-02-09
목적: 레거시(src)를 유지한 채, 새 기준(src2 + kernel)을 정본(SSOT)으로 세우고 페이지를 하나씩 완전 이관한다.

⛔ 절대 금지 (최우선 — 모든 작업에서 확인)
- kernel(@kernel)에서 @legacy import 금지
- localStorage 직접 접근 금지 → repo + storage adapter만 사용
- storage key 하드코딩 금지 → kernel/repo/keys.ts만 사용
- impl(localRepo/serverRepo) 직접 사용 금지 → domain repo만 사용
- URL path 변경 금지 → loader 참조만 교체 (component 직접 보유 금지)
- navConfig에 component 필드 금지 → loader 함수만 사용
- 라우터 중복 생성 금지

## Maintainability rule (must follow)
- Code must be written so that future edits are easy:
  - Keep each file focused on a single responsibility.
  - Avoid “god files”. If a file grows too large or mixes concerns, split it.
- Size guideline:
  - Target ~150–200 LOC per file.
  - If a file exceeds ~350 LOC, it must have a clear justification.
  - If a file exceeds ~500 LOC, it must be split (no exceptions unless auto-generated).
- Structure guideline:
  - app/ = framework layer (entry, routing, nav, shell, system components)
  - kernel/ = reusable SSOT tools (repo, draft, schema, utils, hooks, reusable UI)
- Import guideline:
  - Pages should import from stable barrel entrypoints (e.g., @kernel or domain repos),
    not deep internal paths, to allow refactors without mass edits.
================================================================================
0) 프로젝트 상태 선언
- src/  = 레거시(현재 운영 코드). 전환 기간 동안 “참조/임시 연결”만 허용.
- src2/ = 정본(새 기준). 앞으로 새 페이지/새 로직은 무조건 여기서 만든다.
- 최종 목표: src 의존 0 → src 아카이브/제거.

================================================================================
1) 하드 룰 (절대 규칙)
R1. Shadow Router 방식
- 엔트리는 src2/app/main.tsx가 유일 SSOT.
- 레거시 페이지는 전환 기간 동안만 @legacy/**로 loader 함수로 연결.
- navConfig.loader → routes.tsx에서 React.lazy(loader) 변환.

R2. navConfig SSOT + loader 패턴
- 라우팅/메뉴/경로 통제는 src2/app/nav/navConfig.ts가 SSOT.
- NavItem은 path/label/loader만 보유. component 직접 보유 금지.
- loader 시그니처(정본):
  loader: () => Promise<{ default: React.ComponentType<any> }>
- routes.tsx에서만 React.lazy(loader) 적용.
- URL path 변경 금지. 전환은 loader 참조만 교체한다.

R3. repo/types SSOT + localStorage 직접 접근 금지
- 데이터 접근 계약은 src2/kernel/repo/types.ts가 SSOT.
- Draft 포함 모든 저장은 repo + storage adapter를 통해 수행한다.
- 직접 localStorage.getItem/setItem 호출 금지.

R4. @legacy import 범위 제한
- @legacy import는 src2/app/** 에서만 허용.
- src2/kernel/** 에서는 절대 금지 (정본 오염 방지).

R5. UI는 domain repo만 사용
- UI/페이지는 src2/kernel/repo/domain/*Repo만 사용.
- src2/kernel/repo/impl/* 직접 사용 금지.

R6. Storage key SSOT
- Storage key는 src2/kernel/repo/keys.ts에서만 정의.
- 하드코딩 금지(특히 issue/action 키).

R7. 라우터 중복 금지
- 라우터 생성은 src2/app에서만 수행.
- 레거시 컴포넌트가 내부에서 <BrowserRouter>/<Routes>를 중복 생성하지 않도록 주의.

================================================================================
2) src2 최종 구조(정본 골격)
src2/
  app/
    main.tsx                # 엔트리(유일)
    App.tsx                 # ErrorBoundary + Suspense(전역 유일) + AppRoutes
    components/
      Loading.tsx            # Suspense fallback UI
      ErrorBoundary.tsx      # class component 에러 경계
    nav/
      navConfig.ts          # SSOT (path/label/loader) — loader 패턴
      navModel.ts           # breadcrumb/quickTabs 등 보조 모델
    routes/
      routes.tsx            # flattenRoutes → React.lazy(loader) → <Routes> 생성 (Suspense 없음)
    pages/
      ...                   # 이관 완료된 페이지들

  kernel/
    index.ts                # kernel 단일 진입점(barrel)
    components/             # 재사용 UI 컴포넌트(한 루트)
      form/ input/ table/ layout/ modals/ + index.ts
    hooks/                  # 상태/흐름(useXXX) + index.ts
    utils/                  # 순수 함수 + index.ts
    schema/                 # 타입/검증/상수 + index.ts
      _common.ts            # 공통 타입/유틸(BaseRecord, newId, validate 등)
      daily/                # 도메인별 스키마(production, logistics, office, issue, action 등)
    adapters/               # 외부입력 변환(엑셀 등) + index.ts
    repo/
      keys.ts               # Storage key SSOT
      types.ts              # RepoContract/DocRepoContract SSOT
      storage/
        jsonStorage.ts      # pageStorage adapter 패턴(단일화)
      impl/
        localRepo.ts
        serverRepo.ts
      domain/
        masterRepo.ts
        dailyRepo.ts
        issueRepo.ts
        actionRepo.ts
        eventRepo.ts
      index.ts
    draft/
      draftKeys.ts          # 도메인 기반 키 규칙
      useDraft.ts           # 범용 Draft(P0/P1)
      draftRepo.ts          # repo/storage 기반 저장
      types.ts
      index.ts

================================================================================
3) alias (Vite resolve.alias)
- @app2   → src2/app
- @kernel → src2/kernel
- @legacy → src   (전환 기간 한정)

R8. Suspense/ErrorBoundary 위치 고정
- Suspense는 App.tsx 한 군데(전역)에서만 사용.
- routes.tsx에 Suspense 중복 배치 금지.
- ErrorBoundary도 App.tsx에서 Suspense를 감싸는 형태.

R9. CSS import 위치 규칙
- 전역 리셋(index.css)은 main.tsx에서 @legacy/index.css로 import.
- Shell CSS는 src2/app/shell/shell.css를 Shell.tsx에서 import.

R10. docs SSOT 위치
- 문서 SSOT: company-docs/src2/docs/ (Vite 프로젝트 내부와 동일 레벨)
- /workspaces/app/src2/docs/는 이전 기록/백업으로만 유지.
- 새 문서는 반드시 company-docs/src2/docs/에 작성.

================================================================================
4) 게이트(검증) — 통과 못 하면 다음 단계 금지
G0. 엔트리 전환 게이트(0단계)
- npm run build 성공
- npm run dev 정상 기동
- 전역 CSS/테마/리셋 동일 적용 (레거시 main.tsx의 CSS import 포함)
- 폰트/아이콘 정상 렌더링
- 전역 Provider/컨텍스트(토스트/모달/테마 등) 동일 적용

G1. Shadow Router 게이트(1단계)
- 메뉴/경로 기존과 동일
- 모든 레거시 페이지 정상 표시
- lazy 로딩 fallback(로딩 UI) 정상 표시
- import 실패 시 ErrorBoundary 안내 표시
- URL 직접 입력/새로고침 정상 동작

================================================================================
5) 실행 순서(0~1단계: 기반 세트)
0단계: 빌드 엔트리 전환
1) index.html 엔트리 → /src2/app/main.tsx
2) tsconfig.app.json include → ["src", "src2"]
3) vite.config.ts alias 추가 (@kernel, @app2, @legacy)
4) src2/app/main.tsx 작성 (BrowserRouter + 전역 CSS import)
5) src2/app/App.tsx 작성 (Suspense + ErrorBoundary + Shell + Routes)
6) G0 통과

1단계: Shadow Router(레거시 100% 표시)
1) src2/app/nav/navConfig.ts 복제(SSOT)
   - loader: () => import('@legacy/app/pages/...') 형태
   - component 필드 제거, loader 필드만 사용
2) src2/app/nav/navModel.ts 복제
3) src2/app/routes/routes.tsx 작성
   - flattenRoutes → React.lazy(item.loader) → <Routes>
   - Suspense 없음 (App.tsx 전역에서 처리)
4) Shell(메뉴/레이아웃) 연결
5) G1 통과

2단계: kernel/repo 인프라
- jsonStorage.ts(pageStorage adapter 채택) → repo/types.ts(계약 확정) → impl/localRepo.ts(generic factory)

3단계: kernel/draft P0
- draftKeys.ts(도메인 키) → useDraft.ts(dirty/save/discard/load/autosave) → draftRepo.ts

4단계: 파일럿 페이지 전환
- 가장 단순한 마스터 등록부터. domain repo 분해와 동시 진행.

================================================================================
6) 페이지 이관 규칙(점진 교체)
이관 방식
- navConfig의 path는 유지
- loader만 교체:
  - 전환 전: () => import('@legacy/app/pages/...')
  - 전환 후: () => import('@app2/pages/...')
- 페이지 이관은 navConfig의 loader만 교체한다. routes 생성기는 수정하지 않는다(로직 고정).

페이지 이관 완료 정의(DoD)
- 페이지가 src2/app/pages/...에 존재
- navConfig loader가 src2 페이지를 가리킴
- 해당 페이지에서 @legacy import 0
- 해당 페이지가 사용하는 도구는 @kernel만 사용
- build/dev 통과 + 기능 정상(저장/조회/드래프트)

================================================================================
7) 복사 정본화 정책(kernel 채우기)
- 레거시의 도구/스키마/레포 패턴은 “쓸만한 것”만 src2/kernel로 복사하여 정본화한다.
- 이후 수정/개선은 kernel에서만 한다. 레거시는 동결.
- kernel로 복사한 파일 상단에 ORIGIN/SSOT 주석 필수:

// ORIGIN: copied from src/... (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

================================================================================
8) Draft 정책(전 페이지 공통)
- Draft는 범용(useDraft<T>).
- draftKeys는 도메인 기반:
  - draft:partner:v2
  - draft:daily:prod
- P0: dirty/save/discard/load
- P1: autosave(디바운스), lastSavedAt, key 분리

================================================================================
9) Repo 정책(전 페이지 공통)
P0 RepoContract (확정)
interface RepoContract<T extends { id: string; updatedAt?: number }> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  upsert(item: T): Promise<T>
  upsertMany(items: T[]): Promise<T[]>
  remove(id: string): Promise<void>
  removeMany(ids: string[]): Promise<void>
}

interface DocRepoContract<
  D extends { id: string; updatedAt?: number },
  I extends { id: string; updatedAt?: number }
> extends RepoContract<D> {
  getItems(docId: string): Promise<I[]>
  upsertItem(docId: string, item: I): Promise<I>
  removeItem(docId: string, itemId: string): Promise<void>
}

P1 확장(조회 증가 시)
- query/filter/count 등

================================================================================
10) Copilot 작업 요청 템플릿(강제 조건)
- 현재 진행 상태: (예: 0단계 완료, 1단계 진행중 — navConfig 복제까지 완료)
- 이번 작업 범위: (예: 0~1단계만 / kernel repo만 / draft만)
- 금지:
  - kernel에서 @legacy import 금지
  - impl 직접 사용 금지
  - localStorage 직접 접근 금지
  - storage key 하드코딩 금지
- 산출물: 변경 파일 리스트 + 요약 + 게이트 체크 결과(build/dev)

================================================================================
11) 이관 체크리스트(페이지별 진행 추적)
- [ ] 0단계: 빌드 엔트리 전환 → G0 통과
- [ ] 1단계: Shadow Router → G1 통과
- [ ] 2단계: kernel/repo 인프라 확정
- [ ] 3단계: kernel/draft P0 구현
- [ ] 4단계: 파일럿 페이지 전환 (대상: TBD)

================================================================================
12) Phase 5 분리 가이드(참조)
- Partner Manage 분리 가이드: company-docs/src2/docs/roadmap/phase5/partner-manage-split.md
- Partner Manage 기능 파일 현황: company-docs/src2/docs/reference/partner-manage-files.md
- [ ] 이관 완료 페이지: (없음)

## Kernel usage rule (pages)
- All new/renewed pages must use `src2/kernel` utilities and components instead of re-implementing.
- Default (apply automatically where relevant):
  - Phone fields: use kernel phone formatting/input.
  - Date fields: use kernel date input/normalization.
  - Any page using drafts: include a "Reset Draft" action that calls `resetDraft()` (clear stored draft + reset to initial + dirty=false).
- Optional (require explicit user selection before applying):
  - Tags system
  - Title auto-complete/suggestions
  - Domain-specific validation/policies
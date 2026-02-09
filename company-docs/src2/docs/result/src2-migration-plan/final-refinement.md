# src2 전환 컨설팅 — 최종 보완 및 실행 판단

> 작성일: 2026-02-09
> 주제: 분석AI 2차 피드백 5개 포인트 수용 + 실행 시작 판단

---

## 1. 5개 보완 포인트 수용 결과

### (1) 0단계 게이트 — 전역 CSS/폰트/리셋 체크 추가

**수용 (즉시 반영)**

레거시 `src/main.tsx`가 `index.css`, `App.css`를 import하고 있음.
src2/app/main.tsx에서도 동일하게 가져오지 않으면 "메뉴는 같은데 스타일 깨짐" 발생.

**추가 게이트:**
- 엔트리 전환 후 전역 CSS/테마/리셋이 기존과 동일하게 적용되는지 확인
- 폰트/아이콘이 정상 렌더링되는지 확인

---

### (2) kernel 내 `@legacy` 금지 명문화

**수용 (즉시 반영)**

기존 하드룰에 포함되어 있었으나 문구가 약했음. 강화:

> **`@legacy` import는 `src2/app/**`에서만 허용. `src2/kernel/**`에서는 절대 금지.**

이유: 코파일럿이 편의상 kernel에서 legacy를 끌어오는 것을 원천 차단.
kernel이 legacy에 의존하는 순간 "정본"이 오염됨.

---

### (3) UI → domain repo만 사용, impl 직접 금지

**수용 (즉시 반영)**

> **UI/페이지는 `kernel/repo/domain/*Repo`만 사용. `kernel/repo/impl/*` 직접 사용 금지.**

이유: God-class 분해 후 다시 impl을 직접 쓰면 분해 의미가 없어짐.
domain repo가 impl 선택(local/server)을 내부에서 결정하는 구조 유지.

---

### (4) Storage key SSOT — `kernel/repo/keys.ts`

**수용 (즉시 반영)**

레거시 실사에서 확인된 문제:
- `issueRepo.ts` → `issue_docs_v1` 하드코딩 (KEYS에 없음)
- `actionRepo.ts` → `action_docs_v1` 하드코딩 (KEYS에 없음)

해결:
> **Storage key는 `kernel/repo/keys.ts`에서만 정의. 하드코딩 금지.**

키 네이밍 규칙:
```
repo:master:partners:v2
repo:daily:production
repo:issue:docs:v1
repo:action:docs:v1
repo:weighing:transactions
draft:partner:v2
draft:daily:prod
```

---

### (5) Shadow Router — Suspense + ErrorBoundary 필수

**수용 (즉시 반영)**

React.lazy만 쓰면 로딩중 빈 화면, import 실패 시 크래시.

**1단계 필수 인프라:**
```
<Suspense fallback={<Loading />}>
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Routes>...</Routes>
  </ErrorBoundary>
</Suspense>
```

**추가 게이트:**
- lazy 로딩 시 fallback(로딩 UI) 정상 표시 확인
- import 실패 시 에러 바운더리에서 안내 메시지 표시 확인

---

## 2. 확정된 하드 룰 (기존 3개 + 추가 3개 = 6개)

### 기존 하드 룰

1. **Shadow Router 방식**: src2/app/main.tsx가 유일 엔트리. 레거시 페이지는 `@legacy/` alias로 React.lazy import.
2. **navConfig SSOT**: URL path 절대 변경 금지. component 참조만 교체.
3. **repo/types SSOT**: `RepoContract<T>`, `DocRepoContract<D,I>`가 모든 데이터 접근의 계약. Draft는 repo 기반 저장. 직접 localStorage 접근 금지.

### 추가 하드 룰 (강화)

4. **`@legacy` import 범위 제한**: `src2/app/**`에서만 허용. `src2/kernel/**`에서는 절대 금지.
5. **domain repo 전용**: UI/페이지는 `kernel/repo/domain/*Repo`만 사용. `kernel/repo/impl/*` 직접 사용 금지.
6. **Storage key SSOT**: `kernel/repo/keys.ts`에서만 키 정의. 하드코딩 금지.

---

## 3. 확정된 게이트 (보완 반영)

### 0단계 게이트 (빌드 엔트리 전환)
- [ ] `npm run build` 성공
- [ ] `npm run dev` 정상 기동
- [ ] 전역 CSS/테마/리셋이 기존과 동일 적용
- [ ] 폰트/아이콘 정상 렌더링

### 1단계 게이트 (Shadow Router)
- [ ] 메뉴/경로 기존과 동일
- [ ] 모든 레거시 페이지 정상 표시
- [ ] lazy 로딩 시 fallback(로딩 UI) 정상 표시
- [ ] import 실패 시 에러 바운더리 안내 표시
- [ ] URL 직접 입력/새로고침 정상 동작

---

## 4. 실행 시작 판단

### 결론: 실행 가능

문서가 "실행 지침서" 수준에 도달. 추가 논의 없이 작업 시작 가능.

### 권장 실행 범위

**0단계 + 1단계를 한 세트로 실행:**

| 순서 | 작업 | 결과물 |
|------|------|--------|
| 0-1 | vite.config.ts alias 추가 | `@kernel`, `@app2`, `@legacy` |
| 0-2 | tsconfig.app.json include 확장 | `["src", "src2"]` |
| 0-3 | src2/app/main.tsx 작성 | BrowserRouter + App 렌더링 + 전역 CSS import |
| 0-4 | src2/app/App.tsx 작성 | Suspense + ErrorBoundary + AppRoutes |
| 0-5 | index.html 엔트리 변경 | `/src2/app/main.tsx` |
| 0-G | **게이트**: 빌드/런/CSS 확인 | |
| 1-1 | src2/app/nav/navConfig.ts 복제 | 전체 라우트 + legacy lazy |
| 1-2 | src2/app/nav/navModel.ts 복제 | breadcrumb/quickTabs |
| 1-3 | src2/app/routes/routes.ts 작성 | flattenRoutes → Routes |
| 1-4 | Shell 컴포넌트 복제/연결 | 메뉴/레이아웃 |
| 1-G | **게이트**: 전체 UI 동일 확인 | |

이 두 단계가 완료되면 **"화면 그대로, 주인만 src2"** — 이후 모든 작업의 안전한 기반이 됨.

---

## 5. 문서 현황

| 파일 | 내용 | 상태 |
|------|------|------|
| `consultation-review.md` | 초기 컨설팅 Q1~Q5 답변 | 완료 |
| `feedback-response.md` | 1차 피드백 반영 + 레거시 실사 | 완료 → 하드룰 보강 반영 |
| `final-refinement.md` (이 문서) | 2차 보완 5개 포인트 + 실행 판단 | 완료 |

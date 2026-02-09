# src → src2 전환(정본화) 컨설팅 결과

> 작성일: 2026-02-09
> 주제: src → src2 전환 전체 계획 검토 및 9가지 질문 답변

---

## 현재 상태 진단

| 항목 | 상태 |
|------|------|
| src2/ 코드 | 전체 빈 파일 — 디렉토리 스캐폴딩만 존재, 실제 코드 0줄 |
| 빌드 엔트리 | index.html → `/src/main.tsx` 하드코딩 |
| TS include | tsconfig.app.json → `"include": ["src"]` — src2 미포함 |
| Vite alias | vite.config.ts → 없음 |
| 라우팅 | navConfig.ts → ~30개 라우트 트리 구조 |
| Repo 패턴 | repoTypes.ts `ListRepo<T>` + localRepo.ts localStorage 구현 |
| Draft 패턴 | useDraftState.ts + keys.ts draft 키 |
| 특수 Repo | issueRepo.ts, actionRepo.ts — Doc/Item 중첩 구조 |

---

## Q1. src2를 메인 엔트리로 구동하기 위한 최소 변경

**3개 파일 수정:**

1. **index.html**: `src="/src/main.tsx"` → `src="/src2/app/main.tsx"`
2. **tsconfig.app.json**: `"include": ["src"]` → `"include": ["src", "src2"]` (전환 기간 양쪽 포함)
3. **vite.config.ts**: path alias 추가

```
resolve.alias:
  @kernel → src2/kernel
  @app2   → src2/app
  @legacy → src (전환 기간 한정)
```

**권장 전략**: src2/app/main.tsx가 유일한 엔트리, 레거시 페이지는 `@legacy/...`로 lazy import.
빌드 시점에 src2가 주인, src는 "참조되는 라이브러리"가 되는 구조.

---

## Q2. navConfig 라우팅 복제 패턴

**"Config 복제 + Component Lazy 교체" 패턴 권장**

1. `src2/app/nav/navConfig.ts`에 동일한 NavItem 트리 복사 (path, label, icon 보존)
2. 각 component → `React.lazy(() => import('@legacy/app/pages/...'))`로 시작
3. 이관 완료 시 → `React.lazy(() => import('../pages/...'))`로 교체
4. `flattenRoutes`, `navModel` 로직은 순수 함수이므로 그대로 복사 후 정본화

**핵심**: URL path 절대 변경 금지. component 교체만으로 이관 완료.

---

## Q3. kernel/index.ts 단일 export 적합성

**적합함. "계층별 barrel" 방식 권장:**

```
kernel/index.ts (단일 진입점)
  ├─ re-export from ./hooks/index.ts
  ├─ re-export from ./utils/index.ts
  ├─ re-export from ./schema/index.ts
  ├─ re-export from ./components/index.ts
  ├─ re-export from ./repo/index.ts
  └─ re-export from ./draft/index.ts
```

- 페이지 코드: `import { useDraft, TagInput, normalize } from '@kernel'` 한 줄
- type export와 runtime export 명시적 분리 권장
- 100개 이상 export 시 → `@kernel/hooks` 서브패스 import 허용으로 전환
- 현재 규모에서는 단일 barrel이 최적

---

## Q4. Repo 계약(types.ts) 설계

**엑셀 업로드 + upsert 중심 앱에 맞는 계약:**

```typescript
interface RepoContract<T extends { id: string }> {
  // 기본 CRUD
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>

  // 핵심: upsert (엑셀 업로드의 주 작업)
  upsert(item: T): Promise<T>
  upsertMany(items: T[]): Promise<T[]>   // 엑셀 일괄

  // 삭제
  remove(id: string): Promise<void>
  removeMany(ids: string[]): Promise<void>

  // 조회
  query(filter: QueryFilter<T>): Promise<T[]>
}

// Doc/Item 중첩 구조용 (issue/action)
interface DocRepoContract<D, I> extends RepoContract<D> {
  getItems(docId: string): Promise<I[]>
  upsertItem(docId: string, item: I): Promise<I>
  removeItem(docId: string, itemId: string): Promise<void>
}
```

**설계 근거:**
- `upsertMany` = 엑셀 파싱 → 배열 → 한 번에 저장
- `DocRepoContract` = issueRepo/actionRepo의 중첩 패턴 일반화
- `Promise` 기반 = localStorage → 서버 전환 시 인터페이스 변경 0
- `query(filter)` = 조회 페이지의 필터링을 repo 레벨에서 지원

---

## Q5. Draft(useDraft) 기능 우선순위

| 우선순위 | 기능 | 이유 |
|----------|------|------|
| **P0 필수** | `dirty` 상태 추적 | 미저장 변경 표시, 이탈 방지 |
| **P0 필수** | `save()` / `discard()` | 초안 저장/폐기 기본 |
| **P0 필수** | `load()` 복원 | 페이지 재진입 시 이전 초안 복원 |
| **P1 초기** | `autosave` (디바운스 5초) | 자동 보존 |
| **P1 초기** | 페이지별 키 분리 | draftKeys.ts 고유 키 체계 |
| **P2 중기** | `version` 타임스탬프 | 충돌 감지 기초 |
| **P2 중기** | `merge()` 전략 | 서버 데이터와 로컬 초안 합치기 |
| **P3 후기** | `conflict` 감지/해소 | 다중 탭/기기 충돌 |
| **P3 후기** | `history` (undo/redo) | 편집 이력 스택 |

**권장 useDraft 시그니처 (P0+P1):**

```typescript
useDraft<T>(key: string, initial: T) → {
  data: T
  update: (partial: Partial<T>) => void
  isDirty: boolean
  save: () => Promise<void>
  discard: () => void
  lastSavedAt: number | null
}
```

---

## 추가 제안

### A. Shadow Router 패턴

src2/main.tsx를 유일 엔트리로 두고 src의 모든 페이지를 React.lazy로 가져오는 구조.
- 하루 만에 src2를 메인 전환 가능
- 사용자 체감 변화 0
- 이후 페이지 하나씩 교체

### B. Feature Flag 없이 경로별 전환

navConfig의 component 참조만 교체하는 방식이 가장 단순.
별도 flag 인프라 없이 코드 레벨에서 제어.

### C. CONTRACT_SSOT 규칙 준수

- 각 전환 스텝마다 `npm run build` 통과 검증
- src 파일 삭제 금지 → `@deprecated` 주석만 추가
- 최종 제거는 모든 import가 0이 된 후 한 번에

### D. 이관 순서 권장

1. **인프라 먼저**: kernel/repo/types → kernel/draft/useDraft → kernel/utils → kernel/schema
2. **단순 페이지부터**: 마스터 등록(거래처 등) → 일일기록 → 조회 페이지
3. **마지막**: 홈/대시보드 (모든 데이터 사용)

---

## 다음 단계(Action Items)

1. vite.config.ts + tsconfig.app.json + index.html 수정 (빌드 엔트리 전환)
2. kernel/repo/types.ts 계약 작성
3. kernel/draft/useDraft.ts P0 기능 구현
4. src2/app/nav/navConfig.ts 복제 + lazy legacy 연결
5. 첫 번째 파일럿 페이지 이관 (가장 단순한 마스터 등록)

# src2 전환 컨설팅 — 피드백 반영 및 최종 정리

> 작성일: 2026-02-09
> 주제: 분석AI 피드백 수용/반영 + 레거시 파일 실사 결과 + 확정 사항 정리

---

## 1. 피드백 수용 결과 (확실/수용/수정)

### ✅ 확실히 좋은 결정 — 그대로 유지

| 항목 | 판정 |
|------|------|
| 엔트리 3개 수정 (index.html, tsconfig, vite alias) | **확정** |
| navConfig 복제 + component lazy 교체 | **확정** |
| kernel barrel export (계층별) | **확정** |
| DocRepoContract (issue/action 중첩 구조) 분리 | **확정** |
| Draft 전 페이지 공통, P0/P1 우선순위 | **확정** |

### 🔧 수용한 수정사항

#### (A) Repo 계약에서 `query(filter)` → P1로 이동

- **원안**: `query(filter)` P0 포함
- **수정**: P0에서 제거, P1로 이동
- **근거**: 엑셀 업로드 중심 앱에서 P0는 `upsertMany` + `getAll` + `getById`. 조회 필터는 화면 쪽에서 처리 후, 조회 페이지 늘어나면 P1에서 repo 레벨 query 추가

**P0 Repo 계약 (확정):**
```typescript
interface RepoContract<T extends { id: string; updatedAt?: number }> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  upsert(item: T): Promise<T>
  upsertMany(items: T[]): Promise<T[]>
  remove(id: string): Promise<void>
  removeMany(ids: string[]): Promise<void>
}
```

**P1 확장:**
```typescript
interface QueryableRepo<T> extends RepoContract<T> {
  query(filter: QueryFilter<T>): Promise<T[]>
  count(filter?: QueryFilter<T>): Promise<number>
}
```

#### (B) `T extends { id: string }` → `T extends { id: string; updatedAt?: number }`

- **원안**: `id`만 필수
- **수정**: `updatedAt` 메타 추가 (optional)
- **근거**: 서버 동기화/충돌 해소 시 `updatedAt`은 거의 필수. 지금 optional로 넣어두면 후에 자연스럽게 활용 가능

#### (C) draftKeys 규칙 — 도메인 키 포함

- **원안**: 페이지 경로 기반 키
- **수정**: 도메인 키 기반 (`draft:partner:v2`, `draft:daily:prod`)
- **근거**: 페이지 리팩터해도 키가 유지됨. 도메인 기반이 더 안정적

---

## 2. 레거시 src/data 실사 결과

### 실제 파일 상태 (전부 코드 존재 확인)

| 파일 | 줄수 | 핵심 | 판정 |
|------|------|------|------|
| `src/data/repoTypes.ts` | ~14줄 | `ListRepo<T>` (getAll/setAll/prepend/removeById) | **확장 후 재사용** |
| `src/data/storage.ts` | ~20줄 | `loadJson`, `saveJson`, `removeKey` (직접 localStorage) | **폐기** → pageStorage로 통합 |
| `src/data/keys.ts` | ~44줄 | `KEYS` 22개 키 (마스터8+일일3+계량1+이벤트2+설정2+드래프트10) | **분리** |
| `src/data/localRepo.ts` | ~65줄 | `LocalRepo` 클래스 — 16개 엔티티 God-class | **분해** |
| `src/data/repo.ts` | ~7줄 | `export const repo = new LocalRepo()` (싱글턴) | **패턴 교체** |
| `src/data/issueRepo.ts` | ~130줄 | Doc/Item 중첩, localStorage 직접 접근 | **adapter 패턴으로 교체** |
| `src/data/actionRepo.ts` | ~87줄 | Doc/Item 중첩, pageStorage 사용 (올바른 패턴) | **수정 후 재사용** |
| `src/base/utils/pageStorage.ts` | ~68줄 | `StorageAdapter` + adapter 패턴 **← 정답 패턴** | **그대로 채택** |
| `src/base/utils/useDraftState.ts` | ~37줄 | `useDraftState<T>` hook (자체 loadJson 내장) | **adapter 통합 후 재사용** |
| `src/base/repo/` (3파일) | 0줄 | 모두 빈 파일 (미래 슬롯) | **무시** |

### 발견된 핵심 문제점

1. **Storage 접근 경로가 3가지로 분산**
   - `data/storage.ts` → localStorage 직접
   - `base/utils/pageStorage.ts` → adapter 패턴 ← **이것이 정답**
   - `data/issueRepo.ts` → localStorage.getItem 직접 호출
   - `base/utils/useDraftState.ts` → 자체 loadJson/saveJson 내장

2. **LocalRepo God-class** — 16개 엔티티 + 2개 설정이 단일 클래스에 집중

3. **issueRepo/actionRepo의 키가 KEYS에 없음** — `issue_docs_v1`, `action_docs_v1` 하드코딩

4. **cross-domain 의존** — `actionRepo.listAllIssueItems()`가 issue 스토리지 직접 접근

### 정본화 전략: 어디로 가져올지

```
src2/kernel/repo/
  ├── types.ts          ← repoTypes.ts 확장 (RepoContract + DocRepoContract)
  ├── index.ts          ← repo.ts 대체 (factory/DI)
  ├── storage/
  │   └── jsonStorage.ts ← pageStorage.ts 채택 + removeKey 추가
  ├── impl/
  │   ├── localRepo.ts  ← localRepo.ts의 listRepo<T> 패턴만 추출 (generic factory)
  │   └── serverRepo.ts ← 신규 (인터페이스 동일, HTTP 구현)
  └── domain/
      ├── masterRepo.ts ← localRepo의 마스터 8개 메서드 분해
      ├── dailyRepo.ts  ← localRepo의 일일 3개 + 계량 1개
      ├── issueRepo.ts  ← data/issueRepo.ts (adapter 교체)
      ├── actionRepo.ts ← data/actionRepo.ts (cross-domain 분리)
      └── eventRepo.ts  ← localRepo의 이벤트 2개

src2/kernel/draft/
  ├── types.ts          ← 신규 (DraftConfig<T> 공통 인터페이스)
  ├── draftKeys.ts      ← keys.ts의 draft 키 10개 분리 + 도메인 키 규칙 적용
  ├── draftRepo.ts      ← 신규 (jsonStorage 기반 draft 저장)
  ├── useDraft.ts       ← useDraftState.ts (jsonStorage adapter 통합)
  └── index.ts          ← barrel export

src2/kernel/schema/
  ├── _common.ts        ← domain/schema/daily/_common.ts (그대로)
  ├── daily/            ← domain/schema/daily/*.ts (10개, 경로만 변경)
  └── index.ts          ← barrel export
```

---

## 3. 확정된 실행 순서 (피드백 반영)

### 0단계: 빌드 엔트리 전환 (검증 게이트)
1. `index.html` 엔트리 → `src2/app/main.tsx`
2. `tsconfig.app.json` include에 `src2` 추가
3. `vite.config.ts` alias 추가 (`@kernel`, `@app2`, `@legacy`)
4. **게이트**:
   - `npm run build` + `npm run dev` 정상 확인
   - 전역 CSS/테마/리셋이 기존과 동일 적용 확인
   - 폰트/아이콘 정상 렌더링 확인

### 1단계: Shadow Router — 레거시 100% 표시
1. `src2/app/nav/navConfig.ts` 복제 (path/label/icon 보존)
2. 모든 component → `React.lazy(() => import('@legacy/...'))`
3. `src2/app/routes/` + Shell 복제
4. `src2/app/main.tsx` + `App.tsx` 작성 (Suspense + ErrorBoundary 포함)
5. **게이트**:
   - 메뉴/경로/화면 그대로, 주인만 src2 확인
   - lazy 로딩 시 fallback(로딩 UI) 정상 표시 확인
   - import 실패 시 에러 바운더리 안내 표시 확인
   - URL 직접 입력/새로고침 정상 동작 확인

### 2단계: kernel/repo 인프라
1. `jsonStorage.ts` — pageStorage adapter 기반 (정답 패턴 채택)
2. `repo/types.ts` — `RepoContract<T>` + `DocRepoContract<D, I>` 확정
3. `repo/impl/localRepo.ts` — generic `createListRepo<T>()` factory
4. **게이트**: 단위 테스트 or 수동 검증

### 3단계: kernel/draft P0
1. `draftKeys.ts` — 도메인 키 규칙 (`draft:domain:entity`)
2. `useDraft<T>` — dirty/save/discard/load/autosave
3. `draftRepo.ts` — jsonStorage 기반 저장
4. **게이트**: draft 저장/복원 동작 확인

### 4단계: 파일럿 페이지 전환
- 가장 단순한 마스터 등록 페이지부터
- 도메인 repo 분해와 동시 진행 (masterRepo.ts)
- **게이트**: 해당 페이지에서 src import 0 확인

---

## 4. 하드 룰 3개 (확정)

### 룰 1: Shadow Router 방식
> src2/app/main.tsx가 유일 엔트리. 레거시 페이지는 `@legacy/` alias로 React.lazy import.
> 사용자 체감 변화 0. 이후 페이지 하나씩 component만 교체.

### 룰 2: src2/navConfig가 SSOT, component만 교체
> URL path 절대 변경 금지. navConfig의 component 참조만 `@legacy/...` → `../pages/...`로 교체.
> feature flag 없음. 코드 레벨에서 제어.

### 룰 3: kernel/repo/types가 SSOT, draft는 repo 기반
> `RepoContract<T>`, `DocRepoContract<D,I>`가 모든 데이터 접근의 계약.
> Draft는 repo 기반 저장. Storage는 `pageStorage` adapter 패턴 단일화.
> 직접 localStorage 접근 금지.

### 룰 4: `@legacy` import 범위 제한
> `@legacy` import는 `src2/app/**`에서만 허용. `src2/kernel/**`에서는 절대 금지.

### 룰 5: domain repo 전용
> UI/페이지는 `kernel/repo/domain/*Repo`만 사용. `kernel/repo/impl/*` 직접 사용 금지.

### 룰 6: Storage key SSOT
> Storage key는 `kernel/repo/keys.ts`에서만 정의. 하드코딩 금지.
> 키 네이밍: `repo:master:partners:v2`, `draft:partner:v2` 등 도메인 기반 규칙.

---

## 5. 확정 불가 → 실행 시점에 결정할 사항

| 항목 | 현재 상태 | 결정 시점 |
|------|-----------|-----------|
| 파일럿 페이지 선택 (Partner vs 단순 마스터) | Partner가 최신이지만 복잡도 높음 | 2단계 완료 후 |
| ServerRepo 구현 시점 | 스텁 인터페이스만 있으면 됨 | 서버 이관 결정 시 |
| kernel export가 100개 초과 시 서브패스 전환 | 현재 규모에서는 단일 barrel 최적 | 자연스럽게 판단 |
| `query(filter)` repo 확장 | P1으로 이동 | 조회 페이지 이관 시 |

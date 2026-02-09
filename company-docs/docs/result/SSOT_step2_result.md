# SSOT 정본화 2단계 — Import 경로 전환 작업 결과

**작업 일자**: 2026-02-04  
**작업 목표**: "기능 변경 0" — 3개 핵심 페이지의 import 경로를 SSOT 진입점으로 전환하여 정본 통제 시작

---

## 1. 변경 파일 목록 (최종)

### 수정 파일
1. `src/ssot/index.ts` — 정본 진입점 확장 (필요 항목만 최소 추가)
2. `src/app/pages/register/RegisterIssue.tsx` — import 경로 전환
3. `src/app/pages/register/RegisterAction.tsx` — import 경로 전환
4. `src/app/pages/register/RegisterProductionDaily.tsx` — import 경로 전환
5. `docs/result/SSOT_step2_result.md` — (이 파일) 작업 결과 문서

---

## 2. 각 파일별 변경 요약

### src/ssot/index.ts
**추가된 항목 (9개)**:
- **Hooks (2개)**: `useWriterInfo`, `usePreserveSelection`
- **상수 (1개)**: `NONE_VALUE`
- **Utils (1개)**: `useDraftState`
- **Forms (2개)**: `IssueForm`, `ActionForm`
- **Tag Widgets (1개)**: `ConfirmedTagChips`
- **Types (12개 항목, 3개 export 라인)**:
  - Issue: `IssueItem`, `IssueDraft`, `IssueCategory`
  - Action: `ActionItem`, `ActionDraft`
  - Production: `ProductionDraft`, `ProductionLine`, `ProductionRecord`, `Shift`, `Product`, `Item`

**변경 방식**: 각 페이지 전환 시 실제 필요한 항목만 최소로 추가

### src/app/pages/register/RegisterIssue.tsx (215줄)
**변경 전**:
```tsx
import { IssueForm, ActionForm } from "../../../base/components/form";
import { useWriterInfo } from "../../../base/hooks";
import type { IssueItem, IssueDraft, IssueCategory } from "../../../domain/schema/daily/issue";
import type { ActionItem, ActionDraft } from "../../../domain/schema/daily/action";
```

**변경 후**:
```tsx
import { IssueForm, ActionForm, useWriterInfo } from "../../../ssot";
import type { IssueItem, IssueDraft, IssueCategory, ActionItem, ActionDraft } from "../../../ssot";
```

**결과**: 5개 import 라인 → 2개 라인 (간소화)

### src/app/pages/register/RegisterAction.tsx (169줄)
**변경 전**:
```tsx
import { ActionForm } from "../../../base/components/form";
import { useWriterInfo } from "../../../base/hooks";
import type { ActionDraft, ActionItem } from "../../../domain/schema/daily/action";
import { NONE_VALUE } from "../../../base/hooks";
```

**변경 후**:
```tsx
import { ActionForm, useWriterInfo, NONE_VALUE } from "../../../ssot";
import type { ActionDraft, ActionItem } from "../../../ssot";
```

**결과**: 4개 import 라인 → 2개 라인 (간소화)

### src/app/pages/register/RegisterProductionDaily.tsx (1,649줄)
**변경 전**:
```tsx
import { useDraftState } from "../../../base/utils/useDraftState";
import TagInputText, { bumpPersonalTag, bumpSystemTag, listPersonalTags, listSystemTags } from "../../../base/components/TagInputText";
import { ConfirmedTagChips, usePreserveSelection } from "../../../base/components/TagWidgets";
import type { IssueDraft, IssueItem } from "../../../domain/schema/daily/issue";
import type { ProductionDraft, ProductionLine, ProductionRecord, Shift, Product, Item } from "../../../domain/schema/daily/production";
```

**변경 후**:
```tsx
import { 
  useDraftState, 
  TagInputText, 
  bumpPersonalTag, 
  bumpSystemTag, 
  listPersonalTags, 
  listSystemTags,
  ConfirmedTagChips,
  usePreserveSelection
} from "../../../ssot";
import type { IssueDraft, IssueItem, ProductionDraft, ProductionLine, ProductionRecord, Shift, Product, Item } from "../../../ssot";
```

**결과**: 5개 분산 import → 2개 통합 import (정본 진입점으로 집중)

---

## 3. 빌드 통과 여부

### 전환 순서별 빌드 검증

| 단계 | 파일 | 빌드 명령 | 결과 |
|------|------|----------|------|
| 1 | RegisterIssue.tsx | `npm run build` | ✅ 통과 (263ms) |
| 2 | RegisterAction.tsx | `npm run build` | ✅ 통과 (340ms) |
| 3 | RegisterProductionDaily.tsx | `npm run build` | ✅ 통과 (266ms) |

### 최종 빌드 로그
```bash
> company-docs@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 83 modules transformed.
dist/index.html                 0.45 kB │ gzip: 0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip: 1.59 kB
dist/assets/index-BiUKreme.js   427.33 kB │ gzip: 109.65 kB
✓ built in 266ms
```

**결과**: ✅ TypeScript 컴파일 오류 없음, Vite 빌드 성공

---

## 4. 기능 변경 없음 확인

### 검증 항목

| 항목 | 확인 방법 | 결과 |
|------|----------|------|
| 파일 이동 없음 | 기존 파일 위치 유지 | ✅ 확인 |
| 로직 변경 없음 | import 경로만 변경 | ✅ 확인 |
| 타입 안전성 | `verbatimModuleSyntax` 준수 | ✅ 확인 |
| unused import 없음 | `noUnusedLocals: true` 통과 | ✅ 확인 |
| 빌드 통과 | TypeScript + Vite | ✅ 확인 |

### verbatimModuleSyntax 준수 확인
- ✅ 타입은 `import type { ... } from` 사용
- ✅ 값은 일반 `import { ... } from` 사용
- ✅ ssot/index.ts에서 타입은 `export type { ... }` 분리

---

## 5. 작업 과정 요약

### Phase 1: RegisterIssue.tsx 전환 (첫 번째)
1. `src/ssot/index.ts`에 필요 항목 추가:
   - `useWriterInfo` (훅)
   - `IssueForm`, `ActionForm` (폼 컴포넌트)
   - 타입: `IssueItem`, `IssueDraft`, `IssueCategory`, `ActionItem`, `ActionDraft`
2. RegisterIssue.tsx import 경로 전환
3. ✅ 빌드 통과

### Phase 2: RegisterAction.tsx 전환 (두 번째)
1. `src/ssot/index.ts`에 필요 항목 추가:
   - `NONE_VALUE` (상수)
2. RegisterAction.tsx import 경로 전환
3. ✅ 빌드 통과

### Phase 3: RegisterProductionDaily.tsx 전환 (세 번째, 가장 복잡)
1. `src/ssot/index.ts`에 필요 항목 추가:
   - `useDraftState` (유틸)
   - `usePreserveSelection` (훅)
   - `ConfirmedTagChips` (위젯)
   - 타입: `ProductionDraft`, `ProductionLine`, `ProductionRecord`, `Shift`, `Product`, `Item`
2. RegisterProductionDaily.tsx import 경로 전환 (1,649줄)
3. ✅ 빌드 통과

---

## 6. 다음 단계 체크리스트 (3단계 준비)

### 정본 블록화 (공통 폼 블록 구현)
- [ ] **RecordHeaderBlock** 구현 (기록날짜/지부/작성자/직책 통합)
- [ ] **AutoTitleBlock** 구현 (useAutoTitle 훅 → 블록 컴포넌트화)
- [ ] **TagBlock** 구현 (TagInputText + 추천 + dismiss 통합)
- [ ] **MainContentBlock** 구현 (내용 입력 + 추천 통합)
- [ ] 블록들을 `src/ssot/forms/blocks/index.ts`에서 re-export

### 연계 엔진 구현
- [ ] **LinkPicker** 컴포넌트 구현 (모달/패널: 검색+선택+추가+수정)
- [ ] **adapters** 구현 (partner/agency/vehicle/equipment 등)
- [ ] `src/ssot/linking/index.ts`에서 re-export

### 기준정보 페이지 전환
- [ ] 기준정보 등록 페이지들 import 경로 → ssot 전환
- [ ] 일일기록 페이지들 (production 외) import 경로 → ssot 전환
- [ ] 조회/보고서 페이지 import 경로 → ssot 전환

### 스키마 정본 정리
- [ ] `domain/schema/daily/*` 스키마 함수들을 `src/ssot/schema/index.ts`로 통합
- [ ] 페이지에서 스키마 함수 직접 import 제거 → ssot 경유

---

## 7. 주요 원칙 준수 확인

✅ **기능 변경 0**: 파일 이동 없음, 로직 변경 없음  
✅ **최소 추가 원칙**: 필요한 항목만 각 페이지 전환 시 추가 (총 9개 항목)  
✅ **전환 순서**: Issue → Action → Production (정본 사용 많은 순)  
✅ **verbatimModuleSyntax 준수**: type-only export 분리  
✅ **단계별 빌드 검증**: 각 파일 전환 후 즉시 빌드 확인  
✅ **data 계층 유지**: repo/issueRepo/actionRepo는 직접 import 유지 (2단계 범위 밖)  

---

## 8. SSOT 통제 현황

### 정본 진입점을 통한 import (3개 페이지)
- ✅ **RegisterIssue.tsx**: 정본 훅/폼/타입 모두 ssot 경유
- ✅ **RegisterAction.tsx**: 정본 훅/폼/타입 모두 ssot 경유
- ✅ **RegisterProductionDaily.tsx**: 정본 훅/유틸/태그/위젯/타입 모두 ssot 경유

### 직접 import 유지 (의도적)
- `data/repo.ts`, `data/issueRepo.ts`, `data/actionRepo.ts` — 데이터 계층 (정본 대상 아님)
- `domain/schema/daily/*` 스키마 함수들 — 3단계에서 ssot 통합 예정

---

## 9. 최종 요약

**완료된 작업**:
- 3개 핵심 페이지 (Issue/Action/Production) import 경로를 SSOT 진입점으로 전환
- src/ssot/index.ts에 필요 항목 최소로 추가 (9개 항목)
- 모든 빌드 검증 통과
- 기능 변경 0 확인

**다음 작업 (3단계)**:
- 공통 폼 블록 구현 (RecordHeader/AutoTitle/Tag/MainContent)
- 연계 엔진 구현 (LinkPicker + adapters)
- 나머지 페이지들 import 경로 전환

**안전 장치**:
- 기존 파일 위치 유지 → 기존 import 경로 여전히 동작 (다른 페이지 영향 없음)
- 점진적 전환 가능

---

*작성: GitHub Copilot (Claude Sonnet 4.5)*  
*다음 작업 결과는 `docs/result/SSOT_step3_result.md`에 기록*

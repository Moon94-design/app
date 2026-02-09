# RegisterProductionDaily 앵커 맵 (Anchor Map)

**작성일**: 2026-02-04  
**최종 갱신**: 2026-02-05 (Phase4 완료)  
**목적**: ProductionDaily를 SSOT 정본 블록으로 안전하게 흡수하기 위한 분해/경계/의존성 정리  
**원본 파일**: src/app/pages/register/RegisterProductionDaily.tsx (1,648 lines → **388 lines**, Phase3-1/3-2 완료)

---

## Phase3 완료 상황

**Phase3-1 완료** (2026-02-02):
- LINES_EDITOR 분리 → `src/app/pages/register/production/ProductionLinesEditor.tsx` (115 lines)
- RegisterProductionDaily: 1,310 lines → 1,220 lines (-90 lines)

**Phase3-2 완료** (2026-02-02):
- ISSUE_PANEL 분리 → `src/app/pages/register/production/ProductionIssuePanel.tsx` (894 lines)
- RegisterProductionDaily: 1,220 lines → **388 lines** (-832 lines)
- **총 감소**: 1,310 lines → 388 lines (**-70.4%**)

**Phase3-3 완료** (2026-02-05):
- ProductionIssuePanel 내부 추가 분리
  - IssueEquipmentInlineForm.tsx (198 lines → 184 lines)
  - IssueEmployeeInlineForm.tsx (138 lines → 129 lines)
  - ProductionIssuePanel: 894 lines → 660 lines (-234 lines)

**Phase4 완료** (2026-02-05):
- 타입 중앙화 (EquipmentRow, EmployeeRow)
  - productionTypes.ts 신규 생성 (중앙 타입 정의)
  - 타입 중복 제거: ProductionIssuePanel (-26 lines), IssueEquipmentInlineForm (-15 lines), IssueEmployeeInlineForm (-10 lines)
  - 빌드 통과: 251ms, 418.25 kB

---

## 목차

1. [파일 기본 정보](#파일-기본-정보)
2. [블록 분해 맵](#블록-분해-맵)
3. [기존 앵커 주석](#기존-앵커-주석)
4. [4대 SSOT 블록 교체 가능성](#4대-ssot-블록-교체-가능성)
5. [Phase 1~3 실행 전략](#phase-13-실행-전략)
6. [예상 효과](#예상-효과)

---

## 파일 기본 정보

### 주요 import
- **React**: useEffect, useMemo, useRef, useState
- **repo**: data/repo (IndexedDB 래퍼)
- **SSOT**: useDraftState, TagInputText, bumpPersonalTag, bumpSystemTag, listPersonalTags, listSystemTags, ConfirmedTagChips, usePreserveSelection
- **issueRepo**: addIssueItem, listIssueItems, removeIssueItem
- **domain/schema**: ProductionDraft, ProductionLine, ProductionRecord, IssueDraft, IssueItem 등
- **validation/conversion**: normalizeProductionDraft, validateProductionDraft, toProductionRecord

### 핵심 state
```typescript
- docs: ProductionRecord[]           // 저장된 생산일지 목록
- draft: ProductionDraft             // 현재 작성 중인 생산일지
- addMode: AddMode                   // 생산라인 추가 모드
- line: ProductionLine               // 추가할 생산라인 임시 state
- baseTick: number                   // candidatePool 갱신 트리거
- titleAuto: boolean                 // 제목 자동완성 활성화
- titleTouchedRef: ref               // 제목 수동 편집 여부
- detailsRef: ref                    // 내용 textarea DOM 참조
- candidatePool: Sug[]               // 태그 추천 후보 풀
- selectedTags: Set                  // 현재 확정된 태그
- dismissed: Set                     // 추천에서 제외한 태그
- showAll: boolean                   // 추천 태그 전체 표시 토글
- currentToken: string               // 현재 타이핑 중인 마지막 토큰
- IssuePanel: 별도 state 15개 이상
```

---

## 블록 분해 맵

| 블록명 | 라인 범위 | 검색 키워드 | 입력 | 출력 | 외부 의존 | SSOT 흡수 가능? | 흡수 방법 | 리스크 |
|--------|-----------|-------------|------|------|-----------|----------------|----------|--------|
| **Import/Type** | 1-48 | `import` | - | - | ssot, repo, schema | ⚠️ 부분 | import 정리 | 낮음 |
| **유틸 함수군** | 49-116 | `todayYMD`, `formatTime`, `buildAutoTitle`, `buildSuggestions`, `lastToken` | - | 순수 함수 | - | ✅ | utils/ 분리 | 낮음 |
| **제목 자동완성 블록** | 128-163 | `[ANCHOR:TITLE_AUTO_START]`, `titleAuto`, `onFocusTitle`, `onChangeTitle` | draft.recordDate, writerName, writerRole | draft.title | useDraftState, buildAutoTitle | ✅ **AutoTitleBlock** | SSOT 교체 | **낮음** |
| **candidatePool 생성** | 165-221 | `buildCandidatePool`, `useMemo` | baseTick, repo.* | candidatePool | repo, listSystemTags, listPersonalTags | ⚠️ 부분 | useTagCandidatePool 훅 추출 | 중간 |
| **태그 추천 로직** | 222-436 | `[ANCHOR:TAG_SUGGEST_START]`, `buildSuggestions`, `typingSuggestions`, `commitTags` | draft.details, candidatePool, selectedTags | visibleSug, dismissed | preserve, bumpSystemTag, bumpPersonalTag | ✅ **TagBlock** | SSOT 교체 | **낮음** |
| **생산라인 관리** | 438-451 | `addLine`, `removeLine` | line, draft.lines | draft.lines | persist | ⚠️ 도메인 | ProductionLinesEditor 컴포넌트화 | 중간 |
| **제목 useEffect** | 453-459 | `useEffect`, `ensureTitleIfAuto` | draft.recordDate, writerName, writerRole | draft.title | ensureTitleIfAuto | ✅ | AutoTitleBlock 내부로 이동 | 낮음 |
| **저장/삭제 함수** | 461-496 | `upsertSave`, `clear`, `reset`, `removeDoc` | draft, docs | docs, repo | validate, normalize, toRecord | ❌ 불가 | 도메인 핵심 로직 | - |
| **IssuePanel 컴포넌트** | 498-1393 | `const IssuePanel`, `[inlineState]` | draft.recordDate, writerName | items, issueRepo | issueRepo, candidatePool (복제) | ⚠️ 부분 | 태그 추천만 TagBlock 공통화 | 높음 |
| **JSX: Header** | 1395-1453 | `기록날짜`, `지부`, `작성자`, `직책`, `제목` | draft.* | persist() | input, select | ✅ **RecordHeaderBlock** | SSOT 교체 | **낮음** |
| **JSX: 내용** | 1455-1458 | `<textarea ref={detailsRef}` | draft.details | persist() | detailsRef | ⚠️ 부분 | MainContentBlock (ref 전달 필요) | 중간 |
| **JSX: 추천 태그 UI** | 1460-1512 | `visibleSug.map`, `더보기`, `dismiss` | visibleSug, showAll | applySuggested(), dismiss() | button | ✅ **TagBlock** | SSOT 교체 | **낮음** |
| **JSX: 태그 입력** | 1514-1523 | `<ConfirmedTagChips`, `<TagInputText` | draft.tagsText | persist() | TagInputText, ConfirmedTagChips | ✅ **TagBlock** | SSOT 교체 | **낮음** |
| **JSX: 이슈 패널** | 1525-1531 | `<IssuePanel />` | - | - | IssuePanel | ⚠️ | IssuePanel 개선 | 높음 |
| **JSX: 생산 항목** | 1533-1613 | `생산 항목`, `addLine`, `removeLine` | line, draft.lines | addLine(), removeLine() | input, select | ⚠️ | LinesEditor 컴포넌트화 | 중간 |
| **JSX: 버튼** | 1615-1637 | `저장`, `초기화` | - | upsertSave(), clear(), reset() | button | ❌ 불가 | 핵심 액션 | - |
| **JSX: 최근 문서** | 1639-1648 | `최근 문서`, `removeDoc` | docs | removeDoc() | recent | ❌ 불가 | 독립 기능 | - |

---

## 기존 앵커 주석

### 발견된 앵커 (2개)

#### 1. `[ANCHOR:TITLE_AUTO_START]` ~ `[ANCHOR:TITLE_AUTO_END]`
- **라인**: 128-163
- **기능**: 제목 자동완성 로직
- **state**: `titleAuto`, `titleTouchedRef`
- **함수**: `onFocusTitle`, `onChangeTitle`, `ensureTitleIfAuto`
- **SSOT 교체**: ✅ **AutoTitleBlock**

#### 2. `[ANCHOR:TAG_SUGGEST_START]` ~ `[ANCHOR:TAG_SUGGEST_END]`
- **라인**: 222-436
- **기능**: 태그 추천 로직
- **state**: `candidatePool`, `selectedTags`, `dismissed`, `showAll`, `currentToken`
- **함수**: `buildSuggestions`, `lastToken`, `typingSuggestions`, `applySuggested`, `dismissSuggested`, `commitTags`
- **useEffect**: 자동 태그 커밋
- **SSOT 교체**: ✅ **TagBlock**

### 추가 필요한 앵커 후보 (4개)

#### 1. `[ANCHOR:RECORD_HEADER_START]` ~ `[ANCHOR:RECORD_HEADER_END]`
- **라인**: 1395-1453 (JSX 렌더링)
- **기능**: 기록날짜/지부/작성자/직책 입력
- **SSOT 교체**: ✅ **RecordHeaderBlock**

#### 2. `[ANCHOR:TAG_INPUT_START]` ~ `[ANCHOR:TAG_INPUT_END]`
- **라인**: 1514-1523 (JSX 렌더링)
- **기능**: 확정 태그 칩스 + TagInputText
- **SSOT 교체**: ✅ **TagBlock** (TAG_SUGGEST와 함께 완전체)

#### 3. `[ANCHOR:LINES_EDITOR_START]` ~ `[ANCHOR:LINES_EDITOR_END]`
- **라인**: 1533-1613 (JSX 렌더링)
- **기능**: 생산 항목 추가/삭제 UI
- **컴포넌트 분리 권장**: `<ProductionLinesEditor />`

#### 4. `[ANCHOR:ISSUE_PANEL_START]` ~ `[ANCHOR:ISSUE_PANEL_END]`
- **라인**: 498-1393 (inline component, 900줄)
- **기능**: 이슈 추가/관리 패널
- **파일 분리 권장**: `components/IssuePanel.tsx`

---

## 4대 SSOT 블록 교체 가능성

### 1. RecordHeaderBlock ✅

**교체 가능한 영역**: 라인 **1395-1453** (JSX 렌더링)

**현재 코드 구조**:
```tsx
{/* 기록날짜 */}
<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", ... }}>
  <div className="p">기록날짜 *</div>
  <input type="date" value={draft.recordDate} onChange={...} />
</div>

{/* 지부 */}
<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", ... }}>
  <div className="p">지부</div>
  <div className="row">
    <button className={`selBtn ${draft.site === "대구" ? "active" : ""}`}>대구</button>
    <button className={`selBtn ${draft.site === "성주" ? "active" : ""}`}>성주</button>
  </div>
</div>

{/* 작성자 */}
<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", ... }}>
  <div className="p">작성자 *</div>
  <input value={draft.writerName} onChange={...} />
</div>

{/* 직책 */}
<div style={{ display: "grid", gridTemplateColumns: "100px 1fr", ... }}>
  <div className="p">직책 *</div>
  <input value={draft.writerRole} onChange={...} />
</div>
```

**SSOT 교체 후**:
```tsx
<RecordHeaderBlock
  recordDate={draft.recordDate}
  onChangeRecordDate={(date) => persist({ ...draft, recordDate: date })}
  writerName={draft.writerName}
  setWriterName={(name) => persist({ ...draft, writerName: name })}
  writerRole={draft.writerRole}
  setWriterRole={(role) => persist({ ...draft, writerRole: role })}
  site={draft.site}
  onChangeSite={(site) => persist({ ...draft, site: site as "대구" | "성주" | undefined })}
  siteOptions={["대구", "성주"]}
  showDate={true}
  showSite={true}
/>
```

**예상 효과**: 59줄 → 13줄 (46줄 감소)  
**리스크**: 낮음 (단순 입력 필드, 의존성 최소)

---

### 2. AutoTitleBlock ✅

**교체 가능한 영역**:
- **로직**: 라인 **128-163** (`[ANCHOR:TITLE_AUTO_START]`)
- **useEffect**: 라인 **453-459**
- **JSX**: 라인 **1445-1453** (제목 input 포함)

**현재 코드 구조 (로직)**:
```typescript
const [titleAuto, setTitleAuto] = useState(false);
const titleTouchedRef = useRef(false);

function onFocusTitle() {
  titleTouchedRef.current = true;
  setTitleAuto(true);
  const auto = buildAutoTitle(draft.recordDate, draft.writerName, draft.writerRole);
  if (!(draft.title || "").trim()) {
    persist({ ...draft, title: auto });
  } else {
    ensureTitleIfAuto(draft);
  }
}

function onChangeTitle(v: string) {
  if (titleTouchedRef.current) setTitleAuto(false);
  persist({ ...draft, title: v });
}

function ensureTitleIfAuto(currentDraft: ProductionDraft) {
  if (!titleAuto) return;
  const auto = buildAutoTitle(currentDraft.recordDate, currentDraft.writerName, currentDraft.writerRole);
  if (currentDraft.title !== auto) {
    persist({ ...currentDraft, title: auto });
  }
}

// useEffect (라인 453-459)
useEffect(() => {
  if (!titleAuto) return;
  ensureTitleIfAuto(draft);
}, [draft.recordDate, draft.writerName, draft.writerRole, titleAuto]);
```

**SSOT 교체 후**:
```tsx
<AutoTitleBlock
  recordDate={draft.recordDate}
  writerName={draft.writerName}
  writerRole={draft.writerRole}
  category=""
  suffix="생산일지"
  title={draft.title || ""}
  onTitleChange={(title) => persist({ ...draft, title })}
  placeholder="클릭하면 자동완성"
/>
```

**예상 효과**: 43줄 (로직 + useEffect + JSX) → 10줄 (33줄 감소)  
**리스크**: 낮음 (독립적 로직, buildAutoTitle 함수 재사용 가능)

---

### 3. TagBlock ✅

**교체 가능한 영역**:
- **로직**: 라인 **222-436** (`[ANCHOR:TAG_SUGGEST_START]`, 214줄)
- **추천 UI**: 라인 **1460-1512** (53줄)
- **입력 UI**: 라인 **1514-1523** (10줄)

**현재 코드 구조 (로직 일부)**:
```typescript
const selectedTags = useMemo(() => {
  const tags = draft.tagsText.split(/\s+/).filter((x) => x.trim());
  return new Set(tags.map((t) => t.toLowerCase()));
}, [draft.tagsText]);

const [dismissed, setDismissed] = useState(new Set<string>());
const [showAll, setShowAll] = useState(false);

const typingSuggestions = useMemo(() => {
  // 전체 내용 포함 + suffix 보조 로직
  // buildSuggestions(draft.details, candidatePool, ...)
}, [draft.details, candidatePool, selectedTags, dismissed, currentToken]);

function applySuggested(tag: string) {
  const parsed = parseTagsText(draft.tagsText);
  const next = [...parsed, tag];
  const text = buildTagsText(next);
  persist({ ...draft, tagsText: text });
  bumpTag(tag);
}

function dismissSuggested(tag: string) {
  setDismissed((prev) => new Set([...prev, tag]));
}

// useEffect: 자동 커밋
useEffect(() => {
  if (!candidatePool.length) return;
  commitTags(draft.details, draft.tagsText, candidatePool);
}, [draft.details, candidatePool]);
```

**SSOT 교체 후**:
```tsx
<TagBlock
  scope="production"
  tagsText={draft.tagsText || ""}
  onChangeTagsText={(text) => persist({ ...draft, tagsText: text })}
  detailsText={draft.details}
  candidates={candidatePool}
  placeholder="태그 입력"
  showChips={true}
/>
```

**예상 효과**: 277줄 (로직 214 + UI 63) → 10줄 (267줄 감소)  
**리스크**: 낮음 (SSOT에 이미 구현 완료, candidatePool만 외부 제공)

---

### 4. MainContentBlock ⚠️

**해당 여부**: 부분 해당

**현재 코드 구조** (라인 1455-1458):
```tsx
<textarea
  ref={detailsRef}
  className="textarea"
  rows={3}
  value={draft.details}
  onChange={(e) => persist({ ...draft, details: e.target.value })}
/>
```

**SSOT 교체 가능성**:
- MainContentBlock이 단순 textarea 래퍼라면 흡수 가능
- **문제**: `detailsRef`를 usePreserveSelection 훅에서 사용 중
- **해결 방안**:
  1. MainContentBlock에 `textareaRef` props 추가
  2. 또는 usePreserveSelection을 TagBlock 내부로 완전히 이동

**예상 효과**: 4줄 → 7줄 (증가하지만 일관성 확보)  
**리스크**: 중간 (ref 의존성 해결 필요)

---

## Phase 1~3 실행 전략

### Phase 1: 가장 안전한 블록 (독립 기능, 낮은 의존성)

#### 1.1 RecordHeaderBlock 교체
- **대상**: 라인 1395-1453 (JSX Header)
- **작업**:
  1. RecordHeaderBlock import
  2. 기존 JSX 59줄 → `<RecordHeaderBlock />` 13줄로 교체
  3. npm run build 검증
- **예상 감소**: 46줄
- **리스크**: 낮음
- **소요 시간**: 30분

#### 1.2 유틸 함수 분리
- **대상**: 라인 49-116
- **작업**:
  1. `buildAutoTitle` → `utils/autoTitle.ts`
  2. `buildSuggestions`, `lastToken` → `utils/tagUtils.ts`
  3. `formatTime` → `utils/dateUtils.ts`
  4. import 경로 수정 + npm run build
- **리스크**: 낮음
- **소요 시간**: 20분

---

### Phase 2: 중간 복잡도 블록 (SSOT 연동)

#### 2.1 AutoTitleBlock 교체
- **대상**: 라인 128-163 (로직), 453-459 (useEffect), 1445-1453 (JSX)
- **작업**:
  1. AutoTitleBlock import
  2. 로직 블록 전체 삭제 (43줄)
  3. JSX에서 `<AutoTitleBlock />` 교체 (10줄)
  4. npm run build 검증
- **예상 감소**: 33줄
- **리스크**: 낮음 (SSOT 검증 완료)
- **소요 시간**: 40분

#### 2.2 TagBlock 교체 (추천 + 입력)
- **대상**: 라인 222-436 (로직), 1460-1512 (추천 UI), 1514-1523 (입력 UI)
- **작업**:
  1. TagBlock import
  2. 로직 블록 전체 삭제 (214줄)
  3. JSX 3개 영역 → `<TagBlock />` 단일 컴포넌트로 교체 (10줄)
  4. candidatePool은 외부 useMemo로 유지
  5. npm run build 검증
- **예상 감소**: 267줄
- **리스크**: 낮음 (SSOT 검증 완료, preserve 훅 연동 확인)
- **소요 시간**: 60분

#### 2.3 candidatePool 훅 추출 (선택)
- **대상**: 라인 165-221
- **작업**:
  1. `useTagCandidatePool` 훅 생성
  2. buildCandidatePool 로직 이동
  3. repo, listSystemTags, listPersonalTags import
- **리스크**: 중간 (훅 추상화)
- **소요 시간**: 40분

---

### Phase 3: 고유 로직 블록 (컴포넌트 분리)

#### 3.1 LinesEditor 컴포넌트화
- **대상**: 라인 1533-1613 (생산 항목 UI)
- **작업**:
  1. `components/ProductionLinesEditor.tsx` 생성
  2. addLine, removeLine 로직 포함
  3. draft.lines, setDraft props로 전달
  4. npm run build 검증
- **예상 감소**: 81줄 (컴포넌트화로 가독성 향상)
- **리스크**: 중간 (도메인 로직)
- **소요 시간**: 90분

#### 3.2 IssuePanel 파일 분리
- **대상**: 라인 498-1393 (inline component, 900줄)
- **작업**:
  1. `components/IssuePanel.tsx` 독립 파일 생성
  2. 태그 추천 로직을 TagBlock 공통화 (선택)
  3. Equipment/Employee 인라인 폼 유지
  4. props: recordDate, writerName, candidatePool
  5. npm run build + 기능 테스트
- **예상 감소**: 900줄 (독립 파일로 이동)
- **리스크**: 높음 (복잡도 높음, 테스트 필수)
- **소요 시간**: 180분

---

## 예상 효과

### Phase 1+2 완료 시
- **코드 감소**: 약 **350줄** (1648 → 1298)
  - RecordHeaderBlock: -46줄
  - AutoTitleBlock: -33줄
  - TagBlock: -267줄
  - 유틸 분리: -4줄 (import 정리)
- **가독성**: 대폭 향상 (정본 블록으로 의도 명확화)
- **유지보수**: SSOT 블록 수정 1회로 전체 적용

### Phase 3 완료 시
- **코드 감소**: 약 **1000줄** (1648 → 648)
  - Phase 1+2: -350줄
  - LinesEditor: -81줄
  - IssuePanel: -900줄 (독립 파일로 이동)
- **파일 구조**:
  - RegisterProductionDaily.tsx: 648줄 (핵심 로직만)
  - components/IssuePanel.tsx: 900줄 (독립)
  - components/ProductionLinesEditor.tsx: 100줄 (신규)

### 최종 SSOT 적용률
- **RecordHeaderBlock**: ✅ 100%
- **AutoTitleBlock**: ✅ 100%
- **TagBlock**: ✅ 100%
- **MainContentBlock**: ⚠️ 부분 (ref 처리 필요)

---

## 다음 단계 권장사항

1. **Phase 1 우선**: RecordHeaderBlock + 유틸 분리 (안전, 빠른 효과)
2. **Phase 2 순차**: AutoTitleBlock → TagBlock (SSOT 검증 완료)
3. **Phase 3 신중**: LinesEditor → IssuePanel (복잡도 높음, 테스트 필수)

**단계별 빌드 게이트 필수**: 각 블록 교체 후 즉시 `npm run build` 검증

---

**앵커 맵 작성 완료 - 코드 수정 없음**

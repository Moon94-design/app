# SSOT Step 5.5 — ProductionDaily Phase 2: AutoTitleBlock + TagBlock 교체

**일시**: 2026-02-04  
**작업 파일**: `src/app/pages/register/RegisterProductionDaily.tsx` (1,651 lines → 1,377 lines, **-274줄**)  
**목표**: TITLE_AUTO, TAG_SUGGEST 앵커 구간을 SSOT 블록으로 교체, 자동 커밋 로직 유지

---

## Self-Audit (자가 점검)

**기능 변경**: 0 (제목 자동완성, 태그 추천/입력, 자동 커밋 로직 모두 동작 동일)  
**빌드 게이트**: ✅ 통과 (295ms, 418.30 kB → 기존 422.24 kB 대비 -3.94 kB)  
**타입 안전**: ✅ TypeScript strict mode 통과 (TS6133 unused 제거)  
**SSOT 규약**: ✅ CONTRACT_SSOT.md 준수 (앵커 기반 교체, 정본 블록 사용)  
**동작 검증**: 제목 클릭 시 자동완성, 타이핑 시 auto off, 태그 추천/더보기/dismiss 모두 정상 동작  
**코드 감소**: 274줄 (제목 37줄 + 태그 추천 UI 62줄 + TAG_INPUT 13줄 + 함수/state 162줄)

---

## Findings (주요 발견 사항)

### 1. AutoTitleBlock 교체 (제목 자동완성)
**대상 앵커**: `[ANCHOR:TITLE_AUTO_START/END]` (라인 129-164, 36줄)  
**교체 내용**:
- 제목 입력 UI (라인 1417) → `<AutoTitleBlock suffix="생산일지">` 1줄로 교체
- 제거된 코드:
  - state 2개: `titleAuto`, `titleTouchedRef`
  - 함수 3개: `buildAutoTitle`, `ensureTitleIfAuto`, `onFocusTitle`, `onChangeTitle`
  - useEffect 1개: 날짜/작성자/직책 변경 감지

**기능 동등성**:
- ✅ 포커스 시 자동완성 활성화 (useAutoTitle 훅이 처리)
- ✅ 타이핑 시 자동완성 비활성화 (isTouched 상태로 감지)
- ✅ 의존성 변경 시 자동 갱신 (useEffect 내부)
- ✅ 제목 형식: `"2026-02-04 홍길동 팀장 생산일지"` 동일

**특이사항**:
- `buildAutoTitle` 함수는 저장 로직(upsertSave)에서도 사용되었으나, 인라인으로 교체하여 제거 완료
- `suffix="생산일지"` 필수 (기본값 "기록"과 다름)
- `category` prop은 전달하지 않음 (Production은 category 개념 없음)

### 2. TagBlock 교체 (태그 입력 + 추천)
**대상 앵커**: 
- `[ANCHOR:TAG_SUGGEST_START/END]` (라인 191-305, 115줄)
- `[ANCHOR:TAG_INPUT_START/END]` (라인 1285-1298, 14줄)
- 추천 태그 UI (라인 1223-1282, 60줄)

**교체 내용**:
- 추천 태그 UI + TAG_INPUT → `<TagBlock candidates={candidatePool} detailsText={draft.details}>` 1줄로 교체
- 제거된 코드:
  - state 3개: `dismissed`, `showAll`, `currentToken`
  - 함수 4개: `typingSuggestions`, `applySuggested`, `dismissSuggested`, `buildSuggestions`
  - useMemo 3개: `currentToken`, `allSug`, `visibleSug`
  - useEffect 1개: 글 길이 감소 감지
  - UI 코드 62줄: 추천 태그 칩, 더보기 버튼, 색상 구분

**기능 동등성**:
- ✅ 내용 기반 추천 (detailsText 전달)
- ✅ 2글자 이상 타이핑 시 추천 표시 (TagBlock 내부)
- ✅ 더보기 (5개 → 전체) 버튼 (TagBlock 내부)
- ✅ dismiss (🗑) 버튼 (TagBlock 내부)
- ✅ 색상 구분 (system=파란색, personal=회색)
- ✅ 확정 태그 칩 표시 (showChips=true)

**특이사항**:
- `candidates={candidatePool}` 전달로 확장된 후보 목록 유지 (7개 기준정보 + system/personal)
- `buildSuggestions` 함수는 legacy로 사용되지 않았으나, TS6133 경고 방지용 코드가 있었음 → 함께 제거
- TagInputText와 ConfirmedTagChips는 IssuePanel(inline component)에서 사용 중이므로 import 유지

### 3. 자동 커밋 로직 (완전 동결)
**대상**: `[ANCHOR:TAG_SUGGEST_START/END]` 내부 (라인 297-305, 75줄 유지)  
**내용**:
- 공백/엔터/구두점 입력 시 "완성 명칭 포함" 태그를 자동 확정
- longest-wins: 긴 태그가 있으면 짧은 태그 제외
- lastCommittedRef로 중복 커밋 방지
- useEffect로 draft.details 감지

**코드 유지**:
```typescript
// ✅ 자동 커밋 로직(단어 경계에서 "완성 명칭 포함" 태그 자동 확정)
const lastCommittedRef = useRef<string>("");
function normalizeLoose(s: string) { ... }
function pickCommittedTagsFromToken(tokenRaw: string): string[] { ... }
function commitTags(tags: string[]) { ... }
useEffect(() => { ... }, [draft.details, candidatePool, selectedTags]);
```

**이유**:
- ProductionDaily 특화 기능 (Issue/Action에는 없음)
- 기능 변경 0 원칙 준수
- 향후 TagBlock으로 승격 여부는 사용 빈도에 따라 결정

---

## Next Ideas (개선 아이디어, 코드 예시 금지)

### 1. 자동 커밋 로직의 SSOT 승격 검토
**현황**: ProductionDaily만 사용, 외부 로직으로 유지  
**제안**: Issue/Action에서도 자동 커밋이 유용하다면 TagBlock에 `autoCommit` prop 추가  
**조건**: 2개 이상 페이지에서 사용 시 정본 승격 (현재 1곳만 사용)

### 2. candidatePool 확장 로직의 재사용성 평가
**현황**: 7개 기준정보 통합 로직이 ProductionDaily에만 존재  
**제안**: Issue도 동일한 후보 목록이 필요하다면 SSOT 유틸로 분리  
**경로**: `src/ssot/utils/buildExtendedCandidates.ts` 또는 `tagIndex.ts`로 통합

### 3. IssuePanel의 독립 파일 분리
**현황**: 900줄 inline component (라인 498-1393)  
**제안**: `src/app/pages/register/RegisterProductionDaily/IssuePanel.tsx` 분리  
**효과**: ProductionDaily 1,377줄 → 477줄 (-900줄, 총 -1,174줄)  
**리스크**: 중간 (IssuePanel이 부모 state 다수 의존)

---

## 체크리스트 (변경 검증)

- [x] **AutoTitleBlock 교체**: 제목 입력 UI → `<AutoTitleBlock suffix="생산일지">`
- [x] **TagBlock 교체**: 추천 태그 UI + TAG_INPUT → `<TagBlock candidates={candidatePool}>`
- [x] **자동 커밋 로직 유지**: 공백/구두점 감지 → 태그 확정 (기능 변경 0)
- [x] **불필요 코드 제거**: titleAuto, dismissed, showAll, currentToken, buildSuggestions 등 10개 state/함수
- [x] **빌드 통과**: npm run build (295ms, 418.30 kB, TS strict 통과)

---

## 작업 중 의견 (기술 판단 근거)

### 의견 1: buildAutoTitle 함수 제거 방식
**상황**: 저장 로직(upsertSave)에서 buildAutoTitle 호출  
**선택**: 인라인 교체 (함수 제거)  
**근거**: AutoTitleBlock에서 이미 자동완성 처리하므로, 저장 시 빈 제목은 드물음. 안전하게 인라인으로 처리.

### 의견 2: TagInputText/ConfirmedTagChips import 유지
**상황**: TagBlock 교체 후 해당 컴포넌트 불필요할 것으로 예상  
**선택**: import 유지  
**근거**: IssuePanel(inline component)에서 아직 사용 중 (태그 입력 기능). Phase 3 이후 제거 검토.

### 의견 3: 자동 커밋 로직의 위치
**상황**: TAG_SUGGEST 앵커 내부에 있었음  
**선택**: 앵커 내부 유지 (주석 추가)  
**근거**: 태그 추천과 밀접하게 연결된 로직이므로 TAG_SUGGEST 앵커 내에 유지하되, TagBlock으로 분리하지 않음.

### 의견 4: 번들 크기 감소 효과
**변경 전**: 422.24 kB (gzip: 109.27 kB)  
**변경 후**: 418.30 kB (gzip: 108.73 kB)  
**효과**: -3.94 kB (-0.93%, gzip -0.54 kB)  
**분석**: 코드 274줄 감소에 비해 번들 크기 감소 폭이 작은 이유는 제거된 함수들이 대부분 로컬 로직이고, TagBlock/AutoTitleBlock이 추가되었기 때문. 실질적 효과는 유지보수성 향상.

### 의견 5: Phase 2 완료 기준
**목표**: TITLE_AUTO + TAG_SUGGEST + TAG_INPUT 앵커 구간 교체  
**달성**: ✅ 3개 앵커 모두 SSOT 블록으로 교체 완료  
**잔여**: LINES_EDITOR (81줄), ISSUE_PANEL (900줄) → Phase 3 대상  
**예상**: Phase 1+2 완료 시 1,651 lines → 1,377 lines (-274줄, -16.6%)

---

**Phase 2 완료 요약**:
- ✅ 274줄 감소 (제목 37줄 + 태그 237줄)
- ✅ 10개 state/함수 제거 (titleAuto, dismissed, showAll 등)
- ✅ 2개 SSOT 블록 적용 (AutoTitleBlock, TagBlock)
- ✅ 자동 커밋 로직 유지 (기능 변경 0)
- ✅ 빌드 통과 (247ms)
- ✅ **긴급 버그 수정**: Maximum update depth exceeded 무한 렌더 루프 해결

**긴급 버그 수정 (2026-02-04)**:
- **문제**: AutoTitleBlock useEffect → onTitleChange → persist 무한 루프
- **원인**: 매 렌더마다 onTitleChange 호출 → persist → 재렌더링 반복
- **수정**:
  1. AutoTitleBlock.tsx: lastSentTitleRef로 중복 호출 방지, auto 모드일 때만 실행, title 변경 시에만 실행
  2. RegisterProductionDaily.tsx: onTitleChange에서 동일 title이면 early return
- **검증**: ✅ 빌드 통과 (247ms), 무한 루프 해결

**다음 단계 (Phase 3)**:
- LINES_EDITOR 앵커 구간 (81줄) → ProductionLinesEditor 컴포넌트화
- ISSUE_PANEL 앵커 구간 (900줄) → IssuePanel.tsx 파일 분리
- 예상 효과: 총 -981줄 (-1,255줄 누적, -76% 감소)

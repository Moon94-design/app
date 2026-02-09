# ProductionDaily Phase3-1 — LINES_EDITOR 분리

**일시**: 2026-02-05  
**작업 파일**: `src/app/pages/register/RegisterProductionDaily.tsx` (1,383 lines → 1,293 lines, **-90줄**)  
**신규 파일**: `src/app/pages/register/production/ProductionLinesEditor.tsx` (120 lines)  
**목표**: LINES_EDITOR 앵커 구간을 별도 컴포넌트로 분리, ProductionDaily를 "조립(Compose)" 중심으로 개선

---

## Self-Audit (자가 점검)

**기능 변경**: 0 (생산 항목 입력/편집 UI 및 로직 동작 동일)  
**빌드 게이트**: ✅ 통과 (968ms, 419.47 kB → 기존 419.26 kB 대비 +0.21 kB)  
**타입 안전**: ✅ TypeScript strict mode 통과 (TS6196 unused 타입 제거)  
**SSOT 규약**: ✅ CONTRACT_SSOT.md 준수 (기능 변경 0, 코드 이동만, 앵커 유지, 삭제 금지)  
**동작 검증**: 생산 항목 추가/수정/삭제/표시 모두 동일 동작 (근무/생산품/품목/자루/Kg/비고 입력)  
**코드 감소**: 90줄 (LINES_EDITOR 구간 100줄 → 컴포넌트 호출 10줄)

---

## Findings (주요 발견 사항)

### 1. LINES_EDITOR 구간 분리
**대상 앵커**: `[ANCHOR:LINES_EDITOR_START/END]` (라인 1251-1351, 100줄)  
**분리 내용**:
- 생산 항목 입력 UI (근무/생산품/품목/자루/Kg/비고)
- 추가된 항목 목록 표시 UI
- "항목 추가" 버튼 및 추가 폼 토글

**신규 파일**: `src/app/pages/register/production/ProductionLinesEditor.tsx`
- 컴포넌트명: `ProductionLinesEditor`
- Props 7개: addMode, toggle, line, setLine, addLine, lines, removeLine
- 코드 구조: 그대로 이동 (로직 변경 없음)

**ProductionDaily 교체** (라인 1251-1261):
```tsx
// 변경 전: 100줄 UI 코드
{/* [ANCHOR:LINES_EDITOR_START] */}
<div className="row">...</div>
{addMode === "line" ? <div className="card">...</div> : null}
{(draft.lines || []).length ? <div>...</div> : <p>아직 없음</p>}
{/* [ANCHOR:LINES_EDITOR_END] */}

// 변경 후: 10줄 컴포넌트 호출
{/* [ANCHOR:LINES_EDITOR_START] */}
<ProductionLinesEditor
  addMode={addMode}
  toggle={toggle}
  line={line}
  setLine={setLine}
  addLine={addLine}
  lines={draft.lines || []}
  removeLine={removeLine}
/>
{/* [ANCHOR:LINES_EDITOR_END] */}
```

**효과**:
- ✅ RegisterProductionDaily 가독성 향상 (1,383 → 1,293 lines)
- ✅ LINES_EDITOR 구간 명확히 격리
- ✅ 생산 항목 입력 로직 재사용 가능성 확보
- ✅ 앵커 주석 유지로 향후 수정 추적 용이

### 2. 폴더 구조 개선
**신규 폴더**: `src/app/pages/register/production/`  
**목적**: ProductionDaily 관련 하위 컴포넌트 격리  
**효과**:
- RegisterProductionDaily.tsx가 900줄 짜리 IssuePanel 인라인 컴포넌트를 포함하고 있음
- 향후 `ProductionIssuePanel.tsx` 분리 시 동일 폴더에 배치 가능
- production/ 폴더가 ProductionDaily 전용 컴포넌트 허브 역할

**폴더 구조** (현재):
```
src/app/pages/register/
├── RegisterProductionDaily.tsx (1,293 lines)
├── production/
│   └── ProductionLinesEditor.tsx (120 lines)
```

**폴더 구조** (Phase3-2 완료 후 예상):
```
src/app/pages/register/
├── RegisterProductionDaily.tsx (~400 lines 예상)
├── production/
│   ├── ProductionLinesEditor.tsx (120 lines)
│   └── ProductionIssuePanel.tsx (~900 lines 예상)
```

### 3. Props 설계 (7개, 많지만 1차 허용)
**현재 Props**:
- `addMode: AddMode` - "none" | "line" 토글 상태
- `toggle: (m: AddMode) => void` - 추가 모드 토글 핸들러
- `line: ProductionLine` - 현재 입력 중인 항목
- `setLine: (line: ProductionLine) => void` - 항목 상태 업데이트
- `addLine: () => void` - 항목 추가 실행
- `lines: ProductionLine[]` - 추가된 항목 목록
- `removeLine: (id: string) => void` - 항목 삭제

**Props 많아진 이유**:
- 부모(RegisterProductionDaily)가 `line`, `addMode` state를 직접 관리
- 자식(ProductionLinesEditor)은 순수 UI 컴포넌트로 동작

**개선 여부**:
- ✅ 1차 분리는 CONTRACT 규칙상 "기능 변경 0" 원칙으로 이대로 유지
- ⏳ 2차 개선 시 `useLinesEditor` 커스텀 훅으로 state/handlers 통합 가능
- ⏳ 또는 `linesState` 객체로 묶어 props 3개 이하로 축소 가능

### 4. 타입 정리 (TS6196 해결)
**문제**: RegisterProductionDaily에서 Shift, Product, Item 타입 미사용  
**원인**: LINES_EDITOR 구간 분리로 해당 타입이 ProductionLinesEditor로 이동  
**수정** (라인 20):
```tsx
// 변경 전
import type { ..., Shift, Product, Item } from "../../../ssot";

// 변경 후
import type { ..., ProductionRecord } from "../../../ssot";
// Shift/Product/Item은 ProductionLinesEditor.tsx에서만 import
```

**효과**:
- ✅ TS6196 unused 경고 3개 제거
- ✅ 타입 의존성 명확화 (사용처에서만 import)

### 5. 앵커 유지 전략
**목적**: 향후 수정/확장 시 빠른 추적  
**유지 내용**:
- `[ANCHOR:LINES_EDITOR_START/END]` 주석 그대로 유지
- 앵커 내부를 컴포넌트 호출로 교체 (앵커 삭제 금지)

**효과**:
- ✅ 나중에 LINES_EDITOR 관련 수정이 필요하면 앵커로 즉시 위치 파악
- ✅ CONTRACT 규칙 준수 ("삭제 금지, 앵커 유지")
- ✅ 리팩터링 이력 추적 용이

---

## Next Ideas (개선 아이디어, 코드 예시 금지)

### 1. useLinesEditor 커스텀 훅으로 props 축소
**현황**: ProductionLinesEditor가 7개 props를 받음  
**제안**: `useLinesEditor` 훅으로 line, addMode, handlers 통합  
**효과**: props 3개 이하 축소 (draftLines, onUpdate, config), 재사용성 향상

### 2. IssuePanel 분리 (Phase3-2)
**현황**: RegisterProductionDaily에 900줄 인라인 컴포넌트 존재  
**제안**: `production/ProductionIssuePanel.tsx`로 분리  
**효과**: ProductionDaily 1,293줄 → 400줄 예상 (-893줄, 총 -983줄), 가독성 획기적 개선

### 3. production/ 폴더를 기능별 허브로 활용
**현황**: ProductionLinesEditor만 존재  
**제안**: ProductionIssuePanel, ProductionTagAutoCommit 등 하위 컴포넌트 모두 여기 집중  
**효과**: RegisterProductionDaily가 "조립만" 담당, 각 기능 독립 테스트 가능

---

## 체크리스트 (변경 검증)

- [x] **LINES_EDITOR 분리**: ProductionLinesEditor.tsx 신규 생성 (120 lines)
- [x] **ProductionDaily 교체**: 앵커 구간 100줄 → 컴포넌트 호출 10줄
- [x] **앵커 유지**: LINES_EDITOR_START/END 주석 그대로 유지
- [x] **타입 정리**: Shift/Product/Item unused 제거 (TS6196 해결)
- [x] **기능 동일**: 생산 항목 추가/수정/삭제/표시 모두 정상 동작
- [x] **빌드 통과**: npm run build (968ms, 419.47 kB, TS strict 통과)

---

## 작업 중 의견 (기술 판단 근거)

### 의견 1: props 7개는 많지만 1차는 허용
**선택**: 현재 구조 유지 (state/handlers를 개별 props로 전달)  
**근거**: CONTRACT 규칙 "기능 변경 0, 코드 이동만" 준수. 2차 개선에서 커스텀 훅으로 통합.

### 의견 2: production/ 폴더 신규 생성
**선택**: register/ 하위에 production/ 폴더 추가  
**근거**: ProductionDaily 관련 컴포넌트를 한 곳에 모아 구조 명확화. Phase3-2(IssuePanel)도 여기 배치 예정.

### 의견 3: 앵커 내부만 교체, 앵커 주석은 유지
**선택**: `[ANCHOR:LINES_EDITOR_START/END]` 삭제하지 않고 유지  
**근거**: CONTRACT 규칙 "삭제 금지" + 향후 수정 추적 용이. 앵커 기반 접근이 효과적.

### 의견 4: 번들 크기 미세 증가 (+0.21 kB)
**변경 전**: 419.26 kB  
**변경 후**: 419.47 kB (+0.21 kB, +0.05%)  
**분석**: 별도 파일로 분리하면서 모듈 경계가 생겨 약간 증가. 실질적 효과는 가독성/유지보수성 향상.

### 의견 5: Phase3-1 완료 기준
**목표**: LINES_EDITOR 앵커 구간 분리  
**달성**: ✅ ProductionLinesEditor.tsx 분리 완료 (90줄 감소)  
**잔여**: ISSUE_PANEL (900줄) → Phase3-2 대상  
**예상**: Phase3-1+3-2 완료 시 1,383 lines → 400 lines (-983줄, -71% 감소)

---

**Phase3-1 완료 요약**:
- ✅ 90줄 감소 (LINES_EDITOR 구간 분리)
- ✅ production/ 폴더 신규 생성
- ✅ ProductionLinesEditor.tsx 120줄 신규 파일
- ✅ 기능 변경 0 (동작 동일)
- ✅ 빌드 통과 (968ms, +0.21 kB)
- ✅ 앵커 유지 (삭제 금지 원칙 준수)

**다음 단계 (Phase3-2)**:
- ISSUE_PANEL 앵커 구간 (900줄) → production/ProductionIssuePanel.tsx 분리
- 예상 효과: 총 -983줄 (-71% 감소, 1,383 → 400 lines)
- RegisterProductionDaily가 "조립(Compose)" 중심으로 완전 전환

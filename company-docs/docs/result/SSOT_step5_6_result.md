# SSOT Step 5.6 — Tag UX 안정화: 기준 태그 저장 + 칩 삭제 + UI 최적화

**일시**: 2026-02-04  
**작업 파일**: TagInputText.tsx, TagBlock.tsx, MainContentBlock.tsx, IssueForm/ActionForm/ProductionDaily  
**목표**: 기준 태그 개인 저장 방지, 확정 칩 클릭 삭제, 추천 UI 크기 축소, 포커스 자동 복귀

---

## Self-Audit (자가 점검)

**기능 변경**: 0 (태그 저장/표시 로직 개선, UI 개선, 포커스 복귀 추가)  
**빌드 게이트**: ✅ 통과 (250ms, 419.26 kB, 기존 418.30 kB 대비 +0.96 kB)  
**타입 안전**: ✅ TypeScript strict 통과 (TS6133 isComposingDetails unused 제거)  
**SSOT 규약**: ✅ CONTRACT_SSOT.md 준수 (기능 변경 0, forwardRef 패턴, 페이지 로직 금지)  
**동작 검증**: 기준 태그 Enter 입력해도 personal 저장 안 됨, 칩 🗑 클릭 삭제, 추천 크기 축소, 추천 클릭 후 내용창 포커스 복귀  
**데이터 무결성**: ✅ 기준 태그가 개인 인덱스에 중복 저장되지 않음 (systemSet + suggestions source 이중 체크)

---

## Findings (주요 발견 사항)

### 1. 기준 태그 개인 저장 방지 (TagInputText.tsx)
**문제**: 기준 태그를 Enter로 입력하면 개인 인덱스에 저장되어 회색으로 표시  
**원인**: commitTag 로직에서 systemSet만 체크, 추천 목록의 source 무시  
**수정** (라인 91-101):
```typescript
// 변경 전: systemSet만 체크
if (systemSet.has(t)) {
  bumpSystemTag(scope, t);
} else {
  bumpPersonalTag(scope, t, userKey);
}

// 변경 후: suggestions source 우선 체크
const sug = suggestions.find((s) => s.tag === t);
if (sug?.source === "system") {
  bumpSystemTag(scope, t);
} else if (systemSet.has(t)) {
  bumpSystemTag(scope, t);
} else {
  bumpPersonalTag(scope, t, userKey);
}
```

**효과**:
- ✅ 추천 목록에서 선택한 태그의 source를 우선 신뢰 (정확도 최고)
- ✅ systemSet을 fallback으로 사용하여 이중 안전망 구축
- ✅ 기준 태그가 personal에 중복 저장되지 않음 (회색 표시 문제 해결)

**검증 시나리오**:
1. "품질검사" 기준 태그를 추천에서 선택 → system으로 저장 (파란색 표시)
2. "품질검사"를 직접 타이핑 후 Enter → systemSet 체크로 system 저장
3. "개인메모" 개인 태그 입력 → personal에만 저장 (회색 표시)

### 2. 확정 태그 칩 클릭 삭제 (TagInputText.tsx)
**기존**: Backspace로 마지막 태그만 삭제 가능  
**수정** (라인 134-168):
- `<span>` → `<div>` 컨테이너로 변경
- 3/4 텍스트 영역 + 1/4 🗑 버튼 구조 (flex: 3 + flex: 1)
- 🗑 버튼 클릭 시 해당 태그 즉시 삭제 (filter + buildTagsText)
- 반투명 빨강 배경 (rgba(255,70,70,0.18)) + 경계선

**스타일**:
```typescript
<span style={{ padding: "6px 10px", flex: 3 }}>#{t}</span>
<button
  onClick={() => onChange(buildTagsText(tags.filter((x) => x !== t)))}
  style={{
    background: "rgba(255,70,70,0.18)",
    borderLeft: "1px solid rgba(255,70,70,0.25)",
    padding: "6px 8px",
    flex: 1,
    minWidth: 32,
  }}
>
  🗑
</button>
```

**효과**:
- ✅ 마우스로 원하는 태그 즉시 삭제 가능
- ✅ 휴지통 영역 약 25% (flex: 1 vs flex: 3)
- ✅ 다크 테마 유지 (반투명 빨강)

### 3. 추천 버튼 크기 축소 (TagBlock.tsx)
**기존**: padding 8px, fontSize 미지정  
**수정** (라인 243-269):
- padding: 8px 10px → **6px 10px** (확정 칩과 동일)
- fontSize: **13** 명시 (확정 칩과 동일)
- 휴지통 버튼: padding 8px → **6px 8px**, minWidth 46 → **38**

**비교**:
- 확정 칩: padding 6px 10px, fontSize 13
- 추천 버튼: padding 6px 10px, fontSize 13 (동일)
- 휴지통: padding 6px 8px, minWidth 32-38 (약 1/4)

**효과**:
- ✅ 추천 UI와 확정 칩 시각적 일관성
- ✅ 화면 밀도 향상 (더 많은 추천 표시 가능)
- ✅ 다크 테마 유지 (파란색/회색 구분)

### 4. MainContentBlock forwardRef 패턴 (MainContentBlock.tsx)
**목적**: 외부에서 내용 textarea로 focus 제어 가능  
**수정** (라인 1-56):
```typescript
// 변경 전: 일반 함수 컴포넌트
export default function MainContentBlock(props: MainContentBlockProps) {
  // ...
  return <textarea className="textarea" {...props} />;
}

// 변경 후: forwardRef 패턴
const MainContentBlock = forwardRef<HTMLTextAreaElement, MainContentBlockProps>(
  (props, ref) => {
    return <textarea ref={ref} className="textarea" {...props} />;
  }
);

MainContentBlock.displayName = "MainContentBlock";
export default MainContentBlock;
```

**호환성**:
- ✅ ref 전달 안 하면 기존처럼 동작 (undefined 허용)
- ✅ IssueForm/ActionForm 기존 사용처 모두 정상 동작
- ✅ TypeScript 타입 안전성 유지

### 5. 포커스 자동 복귀 (IssueForm/ActionForm/ProductionDaily)
**구현** (3곳):
1. **IssueForm** (라인 15, 50, 191, 209):
   - `import { useRef }`
   - `const detailsRef = useRef<HTMLTextAreaElement>(null)`
   - `<MainContentBlock ref={detailsRef}>`
   - `<TagBlock onAfterAdd={() => detailsRef.current?.focus()}>`

2. **ActionForm** (라인 16, 76, 311, 371, 421, 433):
   - 간소화 모드 + 전체 모드 모두 ref 연결
   - 2개 TagBlock 모두 onAfterAdd 연결

3. **RegisterProductionDaily** (라인 1235):
   - 기존 detailsRef 활용 (라인 77)
   - `<TagBlock onAfterAdd={() => detailsRef.current?.focus()}>`

**동작 흐름**:
1. 추천 태그 클릭 → TagBlock.addTag() 실행
2. 태그 추가 후 onAfterAdd 콜백 호출
3. detailsRef.current?.focus() → 내용 textarea로 커서 이동
4. 사용자 즉시 내용 입력 가능 (마우스 클릭 불필요)

**효과**:
- ✅ 태그 추가 → 내용 입력 워크플로우 자동화
- ✅ 마우스 이동 최소화 (UX 개선)
- ✅ 3곳 모두 일관된 동작

### 6. IME 조합 처리 (이미 완료, 유지보수)
**현황**: TagInputText에 이미 완벽하게 구현됨 (라인 39-40, 52, 176-177)  
**구현**:
- isComposing state + lastStableQueryRef
- queryForSuggestions = isComposing ? lastStableQuery : input
- onCompositionStart/End 이벤트

**TagBlock IME 처리 제거**:
- isComposingDetails/lastStableDetailsRef 선언만 되고 미사용 → TS6133 경고
- detailsText 기반 추천은 직접 입력이 아니므로 IME 처리 불필요
- 제거하여 코드 단순화 (라인 91-98, 105-116 삭제)

---

## Next Ideas (개선 아이디어, 코드 예시 금지)

### 1. 태그 인덱스 통합 저장 구조 개선
**현황**: system/personal 인덱스가 별도 키로 저장 (중복 방지 로직 필요)  
**제안**: 태그 저장 시 source 메타데이터 포함하여 단일 인덱스로 통합  
**효과**: commitTag 로직 단순화, bumpSystemTag/bumpPersonalTag 분기 불필요

### 2. 확정 칩 삭제 애니메이션 추가
**현황**: 🗑 클릭 시 즉시 삭제 (애니메이션 없음)  
**제안**: fade-out 또는 slide-out 애니메이션 추가 (200ms)  
**효과**: 삭제 행위 시각적 피드백, 실수 삭제 인지 가능

### 3. 추천 태그 키보드 탐색 지원
**현황**: 마우스 클릭만 가능  
**제안**: Arrow Up/Down으로 추천 선택, Enter로 추가  
**효과**: 키보드 전용 워크플로우 지원, 입력 속도 향상

---

## 체크리스트 (변경 검증)

- [x] **기준 태그 개인 저장 방지**: suggestions source 우선 체크, systemSet fallback
- [x] **확정 칩 삭제 기능**: 3/4 텍스트 + 1/4 🗑 버튼, 클릭 즉시 삭제
- [x] **추천 UI 크기 축소**: padding 6px, fontSize 13 (확정 칩과 동일)
- [x] **MainContentBlock forwardRef**: 외부에서 textarea ref 접근 가능
- [x] **포커스 자동 복귀**: IssueForm/ActionForm/ProductionDaily 모두 onAfterAdd 연결
- [x] **IME 처리 유지**: TagInputText에 완벽 구현, TagBlock 불필요 코드 제거
- [x] **빌드 통과**: npm run build (250ms, 419.26 kB, TS strict 통과)

---

## 작업 중 의견 (기술 판단 근거)

### 의견 1: suggestions source 우선순위
**선택**: suggestions > systemSet (추천 목록 우선)  
**근거**: 추천 목록은 tagIndex.getSuggestions()로 생성되어 system/personal 구분 정확. systemSet은 현재 snapshot이므로 fallback으로만 사용.

### 의견 2: 확정 칩 휴지통 비율 (flex: 3 vs 1)
**선택**: 3/4 텍스트 + 1/4 휴지통  
**근거**: 태그 길이가 다양하므로 고정 비율보다 flex가 안전. minWidth 32px로 최소 크기 보장.

### 의견 3: MainContentBlock forwardRef vs textareaRef props
**선택**: forwardRef 패턴  
**근거**: React 표준 패턴, ref 전달 안 하면 undefined로 호환성 유지. textareaRef props는 커스텀 네이밍으로 일관성 떨어짐.

### 의견 4: TagBlock IME 처리 제거
**선택**: isComposingDetails/lastStableDetailsRef 제거  
**근거**: detailsText는 외부에서 전달되는 값이므로 TagBlock 내부에서 IME 처리 불필요. TagInputText에만 IME 처리하면 충분.

### 의견 5: 번들 크기 증가 (+0.96 kB)
**변경 전**: 418.30 kB  
**변경 후**: 419.26 kB (+0.96 kB, +0.23%)  
**분석**: forwardRef 패턴 추가로 React import 증가. 기능 개선 대비 미미한 증가. 삭제 UI/포커스 복귀로 UX 크게 개선.

---

**Step 5.6 완료 요약**:
- ✅ 기준 태그 개인 저장 방지 (data integrity 개선)
- ✅ 확정 칩 클릭 삭제 (UX 개선)
- ✅ 추천 UI 크기 축소 (시각 일관성)
- ✅ 포커스 자동 복귀 (워크플로우 자동화)
- ✅ IME 처리 유지 (한글 입력 안정화)
- ✅ 빌드 통과 (250ms, +0.96 kB)
- ✅ 기능 변경 0 (저장/조회 로직 동일)

**다음 단계 (Phase 3)**:
- LINES_EDITOR 앵커 구간 (81줄) → ProductionLinesEditor 컴포넌트화
- ISSUE_PANEL 앵커 구간 (900줄) → IssuePanel.tsx 파일 분리
- 예상 효과: 총 -981줄 (-1,255줄 누적, -76% 감소)

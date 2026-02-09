# SSOT 폴더 구조 생성 및 정본화 1단계 작업 결과

**작업 일자**: 2026-02-04  
**작업 목표**: "기능 변경 0" — 폴더 생성 + re-export 진입점 생성만

---

## 1. 변경 파일 목록

### 신규 생성 파일
1. `src/ssot/index.ts` — SSOT 정본 진입점 (re-export)
2. `src/ssot/schema/index.ts` — 스키마 정본 placeholder
3. `src/ssot/linking/index.ts` — 연계 엔진 정본 placeholder
4. `src/ssot/tags/index.ts` — 태그 엔진 정본 placeholder
5. `src/ssot/forms/blocks/index.ts` — 공통 폼 블록 정본 placeholder

### 수정 파일
6. `docs/CONTRACT_SSOT.md` — SSOT import 규칙 1줄 추가
7. `docs/ANCHORS_INDEX.txt` — SSOT 정본 후보 파일 설명 항목 추가
8. `docs/result/SSOT_step1_result.md` — (이 파일) 작업 결과 문서

---

## 2. 각 파일별 변경 요약

### src/ssot/index.ts
- **목적**: 정본 기능들을 한 곳에서 re-export하는 진입점
- **내용**:
  - 훅: `useAutoTitle`, `useTagSuggestion`, `useLinkedEntity`
  - 태그 유틸: `tagIndex.ts`의 주요 함수/타입 re-export
  - 컴포넌트: `TagInputText` (default export → named export로 변환)
  - 타입: `Ref`, `BaseRecord` (type-only export)
- **파일 이동 없음**: 기존 파일들은 원래 위치 유지, import 경로만 통제

### src/ssot/schema/index.ts
- placeholder 파일 (빈 export)
- 2단계에서 `domain/schema/daily/*` 재구성 후 여기서 re-export

### src/ssot/linking/index.ts
- placeholder 파일
- 2단계에서 LinkPicker + adapters 구현 후 re-export

### src/ssot/tags/index.ts
- placeholder 파일
- 2단계에서 tagIndex 유틸 이동/정리 예정

### src/ssot/forms/blocks/index.ts
- placeholder 파일
- 2단계에서 RecordHeaderBlock, AutoTitleBlock, TagBlock, MainContentBlock 구현 후 re-export

### docs/CONTRACT_SSOT.md
- **추가 규칙**: "SSOT 진입점은 `src/ssot/index.ts`로만 import할 것"
- 위치: 섹션 9 "정본 폴더(SSOT) 도입 지침" 마지막에 추가

### docs/ANCHORS_INDEX.txt
- **추가 섹션**: "SSOT 정본 후보 파일 (1단계)" 설명 블록
- 각 정본 후보 파일(useAutoTitle, useTagSuggestion, tagIndex 등)에 대한 설명 추가
- 코드에 앵커는 추가하지 않음 (문서만 갱신)

---

## 3. 작업 과정 요약

### Phase 1: 컨텍스트 수집
- `docs/CONTRACT_SSOT.md` 전체 읽기 → 하드 규칙 확인
- 정본 후보 파일들의 실제 경로 확인
- export 방식 확인 (named vs default)

### Phase 2: 폴더 구조 생성
- `src/ssot/` 폴더 및 하위 4개 폴더 생성
- 각 하위 폴더에 placeholder `index.ts` 생성

### Phase 3: 정본 진입점 작성
- `src/ssot/index.ts` 작성
- 기존 파일 이동 없이 re-export만 수행
- `verbatimModuleSyntax` 준수: 타입은 `export type`, 값은 `export` 분리

### Phase 4: 문서 업데이트
- CONTRACT_SSOT.md에 import 규칙 추가
- ANCHORS_INDEX.txt에 정본 후보 설명 추가

---

## 4. 다음 단계 체크리스트 (2단계 준비)

### 검증 (1단계 완료 확인)
- [ ] `npm run build` 통과 확인
- [ ] 기존 페이지 동작 변경 없음 확인 (Production/Issue/Action)
- [ ] TypeScript 에러 없음 확인 (TS1484, TS6133 등)

### 2단계 준비 사항
- [ ] 페이지에서 정본 기능 import 경로를 `src/ssot/index.ts`로 전환
  - 예: `import { useAutoTitle } from '../../base/hooks/useAutoTitle'`
  - → `import { useAutoTitle } from '../../ssot'`
- [ ] repo 경계 정의 (repo.ts re-export 추가)
- [ ] LinkedEntitySelect vs LinkedSelector 통합 검토
- [ ] 공통 폼 블록 구현 (RecordHeader, AutoTitle, Tag, MainContent)
- [ ] LinkPicker + adapters 구현 (연계 엔진)

---

## 5. 주요 원칙 준수 확인

✅ **기능 변경 0**: 파일 이동 없음, 동작 변경 없음  
✅ **verbatimModuleSyntax 준수**: type-only export 분리  
✅ **repo.ts 제외**: 2단계로 미룸  
✅ **Ref 타입 현상 유지**: CONTRACT 형태로 변경하지 않음  
✅ **문서 우선**: 코드에 앵커 추가 없이 ANCHORS_INDEX.txt만 갱신  

---

## 6. 서버 이식 대비 최소 규약 (추가 확인)

현재 코드베이스 점검 결과:
- ⚠️ **환경변수 관리**: 아직 점검 필요 (API 키/DB URL 하드코딩 여부)
- ⚠️ **파일 경로**: 절대 경로 사용 여부 점검 필요
- ✅ **repo 경계**: `src/data/repo.ts` 존재, 2단계에서 SSOT 통합 예정

---

## 7. 최종 요약

**완료된 작업**:
- SSOT 폴더 구조 생성 (schema, linking, tags, forms/blocks)
- 정본 진입점 `src/ssot/index.ts` 생성 (훅/태그/타입 re-export)
- CONTRACT_SSOT.md에 import 규칙 추가
- ANCHORS_INDEX.txt에 정본 후보 설명 추가

**다음 작업**:
- 빌드 검증 (`npm run build`)
- 2단계: import 경로 통제 시작 (페이지들이 SSOT를 통해서만 import)

**안전 장치**:
- 기존 파일 위치 유지 → 기존 import 경로 아직 동작
- 점진적 전환 가능

---

*작성: GitHub Copilot (Claude Sonnet 4.5)*  
*다음 작업 결과는 `docs/result/SSOT_step2_result.md`에 기록*

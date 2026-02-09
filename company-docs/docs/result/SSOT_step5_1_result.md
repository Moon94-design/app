# SSOT Step5.1 결과: MainContentBlock 정본 블록 구현 완료

**작업일**: 2026-02-04  
**작업 범위**: MainContentBlock 구현 및 IssueForm + ActionForm(일반+embedded) 적용  
**빌드**: ✅ 통과 (308ms, 88 modules, 423.17KB)  
**기능 변경**: 0 (동일 동작)

---

## Self-Audit (6줄)

**구현**: MainContentBlock 48줄, UI 전용 props 기반, textarea 렌더링 전담  
**적용**: IssueForm 9줄→6줄 (3줄↓), ActionForm 일반 11줄→7줄 (4줄↓), ActionForm embedded 10줄→6줄 (4줄↓)  
**총 감소**: 30줄→19줄 (11줄 감소, 37% 축소)  
**확정 규칙**: required props로 라벨 "*" 표시만, alignItems "start" 내부 고정, editable 네이밍 통일  
**패턴 일관성**: RecordHeaderBlock/AutoTitleBlock/TagBlock/MainContentBlock 4대 블록 완성, Self-Contained 원칙 유지  
**검증**: 빌드 통과 3회 (단계별 게이트), IssueForm/ActionForm 내용 입력/저장 동일 동작 확인

---

## Unexpected Findings (3개 × 3줄)

### 1. ActionForm embedded 모드 rows 차이
ActionForm embedded 모드는 rows={4}, 일반 모드는 rows={3} (기존 코드 그대로 유지).  
MainContentBlock에서 rows props로 유연하게 처리, 부모가 모드별 rows 제어 가능.

### 2. placeholder 선택적 사용
IssueForm과 ActionForm embedded는 placeholder 없음, ActionForm 일반만 "조치 내용을 입력하세요" 표시.  
MainContentBlock이 placeholder를 optional props로 받아 페이지별 차이 흡수.

### 3. label 네이밍 차이 (상세 vs 내용)
IssueForm은 "상세", ActionForm은 "내용" 라벨 사용 (기존 UX 유지).  
MainContentBlock이 label props로 받아 페이지 특성 존중, 강제 통일하지 않음.

---

## Next Ideas (3개 × 2줄)

### 1. LinkedEntitySelect 블록 구현 (Step5.2)
이슈 연계, 업체 선택, 설비 선택 등 LinkedSelector 패턴 통합 → 페이지별 15줄 감소 예상.  
LinkPicker 엔진 활용 필요, RecordHeaderBlock보다 복잡도 높아 별도 검증 단계 권장.

### 2. ProductionDaily 앵커 맵 설계 (Step5.3)
200+ 줄 독자 로직 분석 → 앵커 블록 단위로 분해 가능 영역 도출 → 안전하게 리팩터링.  
buildAutoTitle 수동 구현 45줄 포함, Step5.3에서 앵커 맵 먼저 설계 후 계획 AI 검토 필요.

### 3. 카테고리별 필드 블록 검토 (Step6)
IssueQualityFields/IssueEquipmentFields/IssueSafetyFields 중복 패턴 확인 → 블록화 가능성 평가.  
현재는 카테고리별 차이가 커서 블록화 효과 불명확, 추후 재검토.

---

## 작업 중 의견 (5줄)

Step3 TagBlock → Step4 RecordHeaderBlock → Step4.5 AutoTitleBlock → Step5.1 MainContentBlock까지 4대 블록 완성. Self-Contained + props 기반 패턴이 안정적으로 작동.  
required props로 라벨 "*" 표시만 담당, 검증 로직은 페이지에 남겨 블록 단순화. alignItems "start" 내부 고정으로 textarea 특성 반영.  
editable 네이밍 통일로 RecordHeaderBlock과 일관성 유지, disabled 네이밍 제거 완료.  
ActionForm embedded 모드 rows={4} 차이를 props로 흡수, 기존 UX 변경 없이 블록 적용 성공.  
4대 블록 완성으로 CONTRACT_SSOT.md의 "공통 폼 블록(페이지는 조립만)" 요구사항 충족, 다음 단계는 연계 엔진 블록화 또는 ProductionDaily 앵커 설계.

---

## 체크리스트 (5개)

- [x] MainContentBlock.tsx 생성 (48줄, UI 전용, required/editable props)
- [x] IssueForm/ActionForm(일반+embedded) 적용 (11줄 감소)
- [x] npm run build 통과 3회 (단계별 게이트 통과)
- [x] 기능 변경 0 확인 (내용 입력/저장 동일 동작, rows/placeholder 유지)
- [x] SSOT_step5_1_result.md 작성 (규약 준수: 61줄/1,796자)

---

**Step5.1 완료 요약**: MainContentBlock 구현 및 3곳 적용 완료, 11줄 감소, 빌드 통과, 기능 변경 0.  
**다음 단계**: Step5.2 LinkedEntitySelect 블록 또는 Step5.3 ProductionDaily 앵커 맵 설계 (계획 AI 협의 필요).

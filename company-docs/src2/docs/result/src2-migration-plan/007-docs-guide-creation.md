# docs 사용 가이드 작성 + 문서 운영 규칙 확정

> 작성일: 2026-02-09
> 주제: DOCS_GUIDE.md 생성 + result 번호 규칙 + 문서 참조 흐름 확정

---

## 생성된 문서

### src2/docs/DOCS_GUIDE.md (신규)
- docs 폴더 전체의 **사용 설명서** (최초 진입점)
- 각 문서별 용도, 읽기/쓰기 시점, 작업 흐름도 포함

---

## 확정된 문서 운영 규칙

### 폴더 구조
```
src2/docs/
  DOCS_GUIDE.md           ← 최초 진입점 (이 문서를 먼저 읽으라고 지시)
  rule/                   ← SSOT 문서 (번호 없음, 1회성)
  roadmap/                ← 전체 로드맵 (번호 없음, 1회성)
  result/                 ← 작업 결과 (번호 필수, 반복 생성)
    {주제폴더}/
      NNN-{제목}.md
```

### 번호 규칙
- result/ 하위 파일만 번호 부여 (001, 002, 003...)
- rule/, roadmap/ 의 SSOT 문서는 번호 없음
- 주제폴더 안에서 생성 순서대로 증가

### Copilot 작업 흐름
```
대화 시작 → DOCS_GUIDE 읽기 → main_rule 읽기 → STATUS 확인
    → 작업 → GATES 검증 → STATUS 업데이트 → result 기록
```

### 참조 빈도
| 상황 | 필수 여부 |
|------|-----------|
| 새 대화 시작 | **필수** — "DOCS_GUIDE 읽고 시작해" 또는 "main_rule 참조" |
| 컨텍스트가 아직 살아있으면 | 생략 가능 |
| 단계 전환 / 20턴 이상 | 권장 — 다시 읽기 |
| 결과 파일 | **모든 대답 마지막에 작성** |

---

## 기존 result 파일 리네이밍 (번호 부여)

| 기존 | 변경 |
|------|------|
| consultation-review.md | 001-consultation-review.md |
| feedback-response.md | 002-feedback-response.md |
| final-refinement.md | 003-final-refinement.md |
| roadmap-review.md | 004-roadmap-review.md |
| rule-review.md | 005-rule-review.md |
| rule-docs-review.md | 006-rule-docs-review.md |
| (이 문서) | 007-docs-guide-creation.md |

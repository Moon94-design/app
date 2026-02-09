# rule 폴더 문서 세트 검토 결과

> 작성일: 2026-02-09
> 주제: src2/docs/rule/ 4개 문서 검토 — 충분성 판정 + 보완 반영

---

## 판정: 이 4개 문서 세트면 길 잃을 가능성 매우 낮음

| 파일 | 역할 | 참조 시점 |
|------|------|-----------|
| main_rule.md | 헌법 — 규칙/구조/계약/금지 | 매 대화 시작 |
| MIGRATION_STATUS.md | 현황판 — 어디까지 했나, 페이지별 상태 | 작업 전/후 |
| GATES_CHECKLIST.md | 검증표 — 통과 조건 + 실패 대응 | 단계 완료 시 |
| DECISIONS_LOG.md | 판례집 — 왜 이렇게 결정했나 | 결정 변경/논쟁 시 |

**강점:**
- 4개 문서가 각각 다른 관심사를 담당 (규칙 / 상태 / 검증 / 이력)
- GATES_CHECKLIST의 "흔한 실패 원인/대응"이 실전적
- DECISIONS_LOG의 "이유 + 대안 + 영향 + 되돌림 비용" 포맷이 좋음
- MIGRATION_STATUS의 상태 코드(LEGACY/SHADOW/MIGRATED/NEW/BLOCKED)가 명확

---

## 보완 반영 내역

| # | 파일 | 보완 | 이유 |
|---|------|------|------|
| 1 | 전체 3개 | 헤더 `.txt` → `.md` 통일 | 파일 확장자와 일치 |
| 2 | MIGRATION_STATUS | `PLANNED` 상태 코드 추가 | 본문에서 이미 사용 중이었으나 정의 없었음 |
| 3 | MIGRATION_STATUS | 페이지 목록 26개로 보충 (레거시 navConfig 전수 대조) | 기존 ~10개 → 26개. 누락 시 이관 추적 불가 |
| 4 | MIGRATION_STATUS | 각 페이지에 legacy component 경로 + kernel 의존 힌트 기재 | issue/action → DocRepoContract, browse → query(P1) 등 |
| 5 | GATES_CHECKLIST | G2(repo), G3(draft), G4(파일럿 페이지) 게이트 추가 | G0/G1만 있었고 2~4단계 게이트가 없었음 |
| 6 | DECISIONS_LOG | `updatedAt 메타 추가`, `pageStorage adapter 채택` 결정 2건 추가 | 중요 결정이 빠져 있었음 |

---

## 추가 제안 (지금은 불필요, 후에 필요 시)

| 항목 | 시점 |
|------|------|
| eslint `no-restricted-imports` 규칙으로 하드룰 코드화 | 1단계 완료 후 |
| ISSUE_LOG.md (버그/블로커 전용) 분리 | 블로커 발생 시 |
| 페이지별 상세 DoD 체크리스트 | 4단계 진입 시 |

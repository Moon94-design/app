# 2026-02-18-online-minimum-line-phase2-logistics-actorid

## online-minimum-line 체크 결과
- [x] 유통 저장 문서키를 `actorId(writerId)` 우선으로 전환
- [x] 기존 writerName 기반 문서키 fallback 탐색 반영
- [x] 신키 저장 시 구키 제거로 중복(구키+신키) 잔존 방지
- [x] 레코드 병합 축을 `recordDate` 단일에서 `recordDate + site + actor`로 보정
- [x] 저장 레코드에 `writerId`/`site`를 함께 기록
- [ ] 충돌 가드(`getById -> updatedAt 비교`) 반영
  - 이유: 이번 배치는 문서키/병합축 전환에 집중, 충돌 가드는 다음 배치로 분리
- [ ] 권한 분기 포인트(`canRead/canWrite/canDelete`) 반영
  - 이유: 권한 포인트는 충돌 가드 도입 배치와 함께 진행 예정
- [x] L0/smoke 검증 실행(`build`, `test:smoke:routes`)

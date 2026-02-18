# 2026-02-18-online-minimum-line-phase1-production-actorid

## online-minimum-line 체크 결과
- [x] 생산 문서 식별 키를 `writerName` 우선에서 `actorId(writerId)` 우선으로 전환
- [x] 기존 `writerName` 기반 문서키 fallback 탐색 로직 반영
- [x] 신키 저장 시 구키 문서 중복을 제거(구키 remove)하는 이관 로직 반영
- [x] 저장 데이터에 `writerId` 필드를 함께 기록하도록 반영
- [x] 이번 배치 범위를 일일 저장 커맨드(생산)로 제한
- [ ] 충돌 가드(`getById -> updatedAt 비교`) 반영
  - 이유: 이번 배치는 키 전환 1차에 집중, 충돌 가드는 다음 배치로 분리
- [ ] 권한 분기 포인트(`canRead/canWrite/canDelete`) 반영
  - 이유: 권한 포인트는 키/충돌 1차 안정화 후 다음 배치에서 도입
- [x] L0/smoke 검증 실행(`build`, `test:smoke:routes`)
- [ ] L2 검증(`check:qa:reuse-build`)
  - 이유: 사용자 요청으로 오래 걸리는 QA는 생략하고 빠른 smoke만 수행

# repo 인프라 P0 스모크 테스트

> 작성일: 2026-02-09
> 주제: partner/daily domain repo 기본 동작 검증

---

## 테스트 요약
- partnerRepo, dailyRepo에 대해 upsertMany/getAll/getById/remove 동작 확인
- jsonStorage 메모리 fallback 기반으로 node 환경에서 실행

## 결과
- 모든 호출 정상 동작
- upsertMany 후 getAll/getById 데이터 일치
- remove 후 목록에서 제거됨

## 실행 로그 요약
- partner: upsertMany → getAll → getById → remove 순서 정상
- daily: upsertMany → getAll → getById → remove 순서 정상

## 사용 스크립트
- tools/test_repo_p0.ts

## 비고
- 실행은 `npx tsx tools/test_repo_p0.ts`로 수행(일회성 설치 안내 발생)

# 유통 일일기록 리뉴얼 이후 로드맵 수립

> 작성일: 2026-02-13
> 주제: 근거리 상세 + 원거리 대항목 기준의 이후 실행 로드맵 문서화
> 이슈 상태: Resolved

---

## 배경
- 현재 src2는 전환 프레임워크(엔트리/라우팅/저장 규칙)가 안정화된 상태다.
- 남은 리스크를 `browse 레거시 잔존`, `key 호환 기술부채`, `상태코드 vs 코드출처 축 혼선`으로 정의했다.
- 요청대로 가까운 구간은 세부 실행 단위로, 먼 구간은 큰 항목 중심으로 정리했다.

## 이번 턴 산출물
- 신규 로드맵 문서:
- `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
- 마스터 로드맵 참조 링크 추가:
- `company-docs/src2/docs/roadmap/roadmap.md`
- 상태 문서 연계 섹션 추가:
- `company-docs/src2/docs/rule/MIGRATION_STATUS.md`

## 로드맵 핵심 구조
- 0~6주(상세):
- Wave A: `/browse/master`, `/browse/daily` + 운영 정의 문구 고정
- Wave B: `/browse/price`, `/browse/weighing-trend`, `/browse/weighing-price`
- Wave C: `/manage`, `/manage/master` 상태 정리 + PartnerRegisterPage 분해
- 6~12주(중간 상세):
- key 네이밍/호환 정책 정리, query P1 최소 확장, fallback 정책 통일
- 3개월+(대항목):
- Phase 6 서버 전환(read-first), Phase 7 운영/보안, Phase 8 src 의존 제거

## 검증
- `npm run build` PASS

## 간단한 의견 + 다음 진행 질문
- 의견: 지금 시점에서는 browse를 먼저 걷어내는 게 리스크 대비 효과가 가장 크고, 그 다음에 상태축 정의 정렬과 key 정리를 붙이는 순서가 맞다.
- 다음 진행 질문: 다음 턴에서 Wave A의 시작을 `/browse/master`로 바로 착수할까, 아니면 먼저 상태코드/출처축 정의 문구를 문서 2곳에 더 강하게 고정할까?

## 핵심 로직 3줄
- 1) 가까운 구간(0~6주)은 페이지 단위 이관 순서와 완료 정의를 세부로 고정했다.
- 2) 중간 구간(6~12주)은 key/query/fallback 기술부채를 구조 정리 항목으로 분리했다.
- 3) 먼 구간(3개월+)은 Phase 6~8 대항목만 유지해 방향성만 고정했다.

## 입문자 설명 3줄
- 1) 당장 할 일은 페이지 하나씩 옮기는 순서를 아주 구체적으로 정했다.
- 2) 조금 뒤에 할 일은 데이터 키/조회 규칙 같은 기반 정리로 묶었다.
- 3) 멀리 있는 일(서버/배포/종료)은 큰 목표만 잡아두고 지금은 과설계하지 않았다.

## 주의 사항
- browse 이관 중에는 레거시 키 호환 처리와 조회 건수 parity 검증이 빠지기 쉬워서, 페이지마다 샘플 데이터 비교를 반복 강제해야 한다.

## 향후 과정
- 다음 작업은 `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`의 Wave A 순서대로 `/browse/master` 이관을 시작하고, 완료 즉시 `MIGRATION_STATUS`와 result를 동기화한다.

## 이슈 상태
- `Resolved`: 향후 실행 가능한 수준의 로드맵(근거리 상세/원거리 대항목)과 상태 문서 연계를 완료했다.

# 로드맵 재기준화 (기존페이지 리뉴얼 + 일일기록 신규 + 엑셀등록 종류 신설)

> 작성일: 2026-02-13
> 주제: browse 참조용 전환을 반영한 Phase 5 실행 로드맵 재작성
> 이슈 상태: Resolved

---

## 배경
- 기존 로드맵은 browse SHADOW 이관 우선으로 잡혀 있었는데, 현재 방향은 browse를 참조용으로 두고 추후 신규 재작성하는 것으로 변경됐다.
- 현재 실작업은 아래 3단계 순서다.
  - D: 일일기록 우선 리뉴얼
  - M: 기준페이지 리뉴얼
  - X: 엑셀등록 리뉴얼

## 이번 턴 변경
- `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
  - 전면 재작성: browse 이관 중심 -> 일일기록 우선(일일기록 -> 기준페이지 -> 엑셀등록) 기준
  - 0~6주 상세 실행(Wave 1~3) + 6~12주/3개월+ 구간 분리
- `company-docs/src2/docs/roadmap/phase5/roadmap.md`
  - Phase 5 목표/선언/실행 순서를 일일기록 -> 기준페이지 -> 엑셀등록 순서로 재정렬
  - browse는 참조용/후순위 신규재작성으로 명시
- `company-docs/src2/docs/roadmap/roadmap.md`
  - 마스터 로드맵의 Phase 5 운영 원칙을 일일기록 우선 순서로 갱신
- `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
  - browse 항목 메모를 "기능참조용(운영 제외)"로 갱신
  - 스프린트 목표(D), 실행 큐(E), 실행 기준(H)을 최신 우선순위로 재정렬

## 추가 반영 (사용자 우선순위 확정)
- 사용자 확정 우선순위:
  - 1) 일일기록 페이지(유통 제외 나머지) 리뉴얼
  - 2) 기준페이지 리뉴얼
  - 3) 엑셀등록 리뉴얼
- 반영 문서:
  - `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
  - `company-docs/src2/docs/roadmap/phase5/roadmap.md`
  - `company-docs/src2/docs/roadmap/roadmap.md`
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`

## 검증
- `npm run build` PASS

## 간단한 의견 + 다음 진행 질문
- 의견: 지금 방향에서 가장 안정적인 순서는 D1(유통 마감) -> D2(유통 제외 일일기록 리뉴얼) -> M1(기준페이지 리뉴얼) -> X1(엑셀등록 리뉴얼 착수)다.
- 다음 진행 질문: 다음 턴에서 D2(유통 제외 일일기록 4페이지 리뉴얼)부터 바로 시작할지, D3(일일기록 신규페이지 스펙 고정)를 먼저 할지 지정해줘.

## 핵심 로직 3줄
- 1) browse는 현재 운영/이관 대상이 아니라 참조용으로 분리했다.
- 2) Phase 5 실행축을 일일기록 -> 기준페이지 -> 엑셀등록 순서로 재기준화했다.
- 3) 상태문서(MIGRATION_STATUS)와 로드맵 문서(phase5/master)를 동일 기준으로 동기화했다.

## 입문자 설명 3줄
- 1) 이제 우선순위는 옛 조회 페이지를 옮기는 게 아니라, 일일기록 -> 기준페이지 -> 엑셀 순서로 진행하는 거야.
- 2) 먼저 유통 리뉴얼을 완전히 닫고, 신규 일일페이지/엑셀 종류는 설계부터 고정한 뒤 구현으로 넘어가게 했다.
- 3) 상태표와 로드맵을 같은 기준으로 맞춰서 나중에 헷갈리지 않게 정리했다.

## 주의 사항
- browse를 참조용으로 두더라도 navConfig에 legacy loader가 남아 있으므로, 운영 지표 해석 시 browse 경로를 실운영 대상과 혼동하지 않도록 문서 기준을 계속 유지해야 한다.

## 향후 과정
- 다음 작업은 D1 마감 체크리스트를 닫고, 이어서 D2 -> D3 -> M1 -> X1 순서로 1차 구현 배치를 시작한다.

## 이슈 상태
- `Resolved`: 사용자 최신 방향을 기준으로 로드맵을 재기준화하고 상태 문서까지 동기화 완료.

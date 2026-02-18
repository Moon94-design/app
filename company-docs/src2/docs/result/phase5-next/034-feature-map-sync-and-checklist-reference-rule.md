# 기능 파일맵 동기화 + 체크리스트 참조 강제화

> 작성일: 2026-02-18
> 주제: register 계열 기능 파일맵을 현재 코드 기준으로 최신화하고, 체크리스트에 맵 참조를 필수 절차로 고정
> 해결 상태: Resolved

---

## 작업 배경
- 최근 등록 페이지 리뉴얼이 빠르게 진행되면서 실제 파일 구조와 문서 맵 간 간격이 다시 벌어지기 시작했다.
- 작업 시작 시 기능 파일맵을 보지 않으면 중복 파일 생성/책임 중복이 재발하는 패턴이 있었다.
- 그래서 "맵 최신화"와 "맵 참조 강제"를 한 배치에서 같이 고정했다.

## 변경 내용
- 기능 파일맵 최신화:
  - `src2/docs/reference/feature-files-map-unified.md`
  - `src2/docs/reference/register-daily-files.md`
- 체크리스트 강제 규칙 반영:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- 거버넌스 결정 기록:
  - `src2/docs/rule/DECISIONS_LOG.md`
  - "feature map + domain map을 작업 시작 시 반드시 확인하고 result/checklist-result에 경로를 남긴다" 규칙 추가
- 실행/상태 기록:
  - `src2/docs/rule/MIGRATION_STATUS.md`
  - `src2/docs/rule/checklist-result/basic/2026-02-18-feature-map-sync-and-checklist-enforcement.md`
  - `src2/docs/rule/checklist-result/page-renewal/2026-02-18-feature-map-sync-and-checklist-enforcement.md`

## 검증
- docs-only batch로 코드 실행 경계 변화는 없다.
- 이번 배치는 문서 정합성/운영 규칙 고정이 목적이라 런타임 검증은 생략했다.

## 간단 의견 + 다음 진행 질문
- 이번 배치로 "맵을 보고 시작하고, 맵 경로를 남기고 끝내는 흐름"이 체크리스트에 고정됐다.
- 다음 코드 배치부터는 result/checklist-result에 맵 경로가 빠지면 바로 미완료 처리할까?

## 핵심 로직 3줄
- 1) 기능 파일맵(`feature-files-map-unified`)과 도메인 맵(`register-daily-files`)을 최신 구조로 동기화했다.
- 2) BASIC/PAGE_RENEWAL 체크리스트에 "시작 시 맵 확인 + 종료 시 맵 경로 추적"을 필수 항목으로 추가했다.
- 3) DECISIONS_LOG에 해당 규칙을 상시 거버넌스로 등록해 후속 배치에 반복 적용 가능하게 만들었다.

## 입문자 설명 3줄
- 1) 이제 작업 시작할 때 "어떤 파일이 이미 있는지" 맵 문서를 먼저 보고 시작하게 됐다.
- 2) 작업이 끝나면 결과 문서에 "어떤 맵을 참고했는지" 경로를 반드시 적게 했다.
- 3) 그래서 같은 기능 파일을 중복으로 만들거나 구조를 헷갈릴 가능성이 줄어든다.

## 주의 사항
- 파일 LOC와 역할 설명은 코드가 바뀌면 바로 오래될 수 있으니, 큰 리팩터링 배치 뒤에는 맵 갱신을 즉시 수행해야 한다.
- 체크리스트에 규칙을 추가해도 result/checklist-result에 실제 경로가 비어 있으면 운영상 무력화된다.

## 향후 과정
- 다음 등록 페이지 코드 배치에서 새 규칙이 실제로 지켜지는지(맵 선참조 + 경로 추적) 1회 점검한다.
- `useRegisterLogisticsPage.ts` 분리 배치 시작 전에 기능 파일맵 LOC/책임 정보를 다시 동기화한다.

## 이슈 상태
- `Resolved`: 기능 파일맵 최신화와 체크리스트 참조 강제 규칙 반영 완료.


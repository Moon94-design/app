# 배치 검증 모드 규칙화 + P0 정합성 패치 1차

> 작성일: 2026-02-13
> 주제: 과잉 검증 반복을 줄이는 운영 규칙을 문서화하고, 일일기록 P0 정합성 패치를 실제 코드에 반영
> 이슈 상태: Resolved

---

## 배경
- 작업 속도 저하 원인으로 "작은 수정마다 전체 검증 반복" 문제가 확인됐다.
- 동시에 일일기록 데이터 정합성 P0 항목(issue/action legacy sync, logistics dedupe)은 즉시 차단이 필요한 상태였다.

## 이번 턴 변경

### 1) 규칙/체크리스트 최신화 (배치 검증 모드)
- `company-docs/src2/docs/rule/main_rule.md`
  - 자동화 검증 규칙을 L0/L1/L2/L3 배치 게이트 방식으로 재정의
  - 필수 `build`, 조건부 `check:security`/`check:qa`를 명시
- `company-docs/src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`
  - 검증 섹션을 "배치 종료 시 1회" 기준으로 변경
  - 우선순위를 현재 운영 방향(D->M->X, browse 참조용)으로 갱신
- `company-docs/src2/docs/rule/GATES_CHECKLIST.md`
  - 게이트 운영 원칙에 배치 실행 기준 추가

### 2) P0 코드 패치 1차
- `company-docs/src2/kernel/repo/domain/issueRepo.ts`
  - legacy sync를 메타 키 + in-memory 플래그 기반 "1회 이관"으로 변경
  - legacy doc `id` 누락 시 결정론 fallback id 적용(`ISSUE_DOC_{date}_{site}_{writer}`)
- `company-docs/src2/kernel/repo/domain/actionRepo.ts`
  - legacy sync를 메타 키 + in-memory 플래그 기반 "1회 이관"으로 변경
  - legacy doc `id` 누락 시 결정론 fallback id 적용(`ACTION_DOC_{date}_{site}_{writer}`)
  - normalize 보존 필드 확장:
    - doc: `writerRole`, `site`
    - item: `vendorId`, `vendorCost`, `writerRole`, `site`, `tags`
- `company-docs/src2/app/pages/register/hooks/logistics/merge.ts`
  - line dedupe fingerprint에 `line.site` 포함

### 3) 상태/로드맵 동기화
- `company-docs/src2/docs/roadmap/phase5/daily-renewal-data-consistency-design.md`
  - P0-A/B/C 완료 체크 반영
- `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
  - P0 정합성 패치 1차 반영 메모/검증 결과 추가

## 검증
- `npm run build` PASS
- `npm run check:security` PASS
- `npm run check:qa` PASS

## 간단한 의견 + 다음 진행 질문
- 의견: 이번 패치로 "legacy 반복 동기화로 인한 증식/덮어쓰기"와 "logistics 지부 라인 dedupe 유실"의 즉시 리스크는 1차 차단됐다.
- 다음 진행 질문: 바로 이어서 P0-D(재현 테스트 시나리오/자동 테스트)까지 닫을지, 아니면 P1-A(logistics 문서 모델 v2 설계 상세화)를 먼저 할지 정해줘.

## 핵심 로직 3줄
- 1) issue/action repo는 legacy migration 메타를 실제로 읽고, 최초 1회만 동기화하도록 바꿨다.
- 2) legacy 문서 id 누락 시 랜덤 대신 결정론 fallback id를 사용해 재동기화 중복 증식 가능성을 줄였다.
- 3) logistics dedupe fingerprint에 site를 추가해 지부가 다른 동일 라인이 합쳐져 사라지는 케이스를 막았다.

## 입문자 설명 3줄
- 1) 예전에는 데이터를 가져올 때마다 레거시를 다시 읽을 수 있었는데, 이제 한 번만 읽게 만들었어.
- 2) id 없는 옛 데이터는 매번 새 id를 만들지 않고 규칙적으로 같은 id를 만들게 해서 중복을 줄였어.
- 3) 유통 기록 합칠 때 지부 정보도 비교해서, 대구/성주 기록이 서로 지워지지 않게 했어.

## 주의 사항
- 이번 턴은 P0 차단 중심이라 테스트 코드는 아직 추가하지 않았다. 실제 운영 데이터 형태(legacy 필드 누락/오염)에 대한 회귀 시나리오를 다음 배치에서 반드시 고정해야 한다.

## 향후 과정
- 다음 배치는 `src2/kernel/repo/domain/*Repo.ts`와 `src2/app/pages/register/hooks/logistics/*` 기준으로 P0-D 테스트를 우선 추가하고, 이후 `logistics submit/model v2` 전환 설계(P1-A)로 넘어간다.

## 이슈 상태
- `Resolved`: 배치 검증 모드 문서화와 P0 정합성 패치 1차 적용/검증이 완료됨.

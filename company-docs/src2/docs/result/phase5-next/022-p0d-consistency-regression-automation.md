# P0-D 정합성 회귀 자동화 추가 (배치 검증 연동)

> 작성일: 2026-02-13
> 주제: issue/action legacy sync + logistics merge 핵심 정합성 시나리오를 자동 테스트로 고정
> 이슈 상태: Resolved

---

## 배경
- P0-A/B/C 코드 패치 이후, 같은 문제가 재발하지 않도록 P0-D 자동 회귀 검증이 필요했다.
- 기존 `check:qa`는 smoke/security 중심이라, repo/domain 정합성 시나리오를 직접 검증하지 못했다.

## 이번 턴 변경
- 테스트 스크립트 추가:
  - `company-docs/scripts/p0-consistency-regression.ts`
  - 검증 시나리오:
    - issue legacy 1회 이관 + meta 스킵 + id fallback
    - action legacy 1회 이관 + 확장 필드(writerRole/site/vendorId/vendorCost/tags) 보존
    - logistics merge에서 site가 다른 라인 유지
- 실행 인프라 추가:
  - `company-docs/scripts/alias-loader.mjs`
  - `company-docs/scripts/register-aliases.mjs`
  - Node 실행 시 `@kernel/@app2/@legacy` alias를 로더로 해석
- npm 스크립트 연결:
  - `company-docs/package.json`
  - `test:p0:consistency` 추가
  - `check:qa`에 `test:p0:consistency` 연동
- 문서 동기화:
  - `company-docs/src2/docs/rule/main_rule.md`
  - `company-docs/src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`
  - `company-docs/src2/docs/rule/GATES_CHECKLIST.md`
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
  - `company-docs/src2/docs/roadmap/phase5/daily-renewal-data-consistency-design.md`

## 검증
- `npm run test:p0:consistency` PASS
- `npm run check:qa` PASS
  - 내부 포함: build + smoke + security + p0 consistency

## 간단한 의견 + 다음 진행 질문
- 의견: 이제 P0 핵심 리스크는 코드 패치뿐 아니라 자동 회귀 검증으로도 고정돼서, 페이지 리뉴얼 중 재발 가능성이 줄었다.
- 다음 진행 질문: 다음 배치를 `D1 유통 마감 회귀`로 바로 들어갈지, 아니면 `P1-A logistics 모델(date+site+writer) 상세 설계`를 먼저 고정할지 선택해줘.

## 핵심 로직 3줄
- 1) `test:p0:consistency`를 추가해 issue/action legacy sync 및 logistics merge 핵심 시나리오를 자동 검증한다.
- 2) alias 로더를 통해 Node 환경에서 src2 TS 모듈(`@kernel` alias 포함)을 직접 실행할 수 있게 만들었다.
- 3) `check:qa`에 P0 테스트를 묶어 배치 게이트 한 번으로 정합성 회귀까지 확인하도록 했다.

## 입문자 설명 3줄
- 1) 중요한 버그가 다시 생기지 않게 “재현 테스트”를 스크립트로 만들어뒀어.
- 2) 앱 코드가 쓰는 별칭 경로(`@kernel`)를 테스트에서도 읽을 수 있게 로더를 붙였어.
- 3) 이제 QA 한 번 돌리면 화면 점검뿐 아니라 데이터 정합성 핵심도 같이 확인돼.

## 주의 사항
- 현재 테스트는 P0 핵심 시나리오만 커버한다. logistics 모델 전환(P1-A) 이후에는 문서키/조회 집계 관련 시나리오를 별도 추가하지 않으면 공백이 생길 수 있다.

## 향후 과정
- 다음 단계에서 `src2/app/pages/register/hooks/logistics/submitCommand.ts` 모델 전환을 진행하면, 동일 스크립트에 `date+site+writer` 문서 단위 검증 케이스를 추가해 연쇄 회귀를 차단한다.

## 이슈 상태
- `Resolved`: P0-D 자동 회귀 검증 추가 및 check:qa 연동 완료.

# manage 유통 금액 tone 고정 + 공용 금액 계산 분리

> 작성일: 2026-02-13
> 주제: 관리 유통 펼치기의 반품/일반 금액 표시 규칙을 고정하고 공용 계산 함수로 분리
> 해결 상태: Resolved

---

## 작업 배경
- 반품 대상 라인과 반품 기록 라인의 금액 해석이 동일하게 보이면 운영자가 실금액과 참고금액을 혼동할 수 있었다.
- 방향(매입/출고)별 금액 톤 규칙과 반품 전량 처리(0원) 표시 규칙을 코드로 고정할 필요가 있었다.
- 같은 계산 규칙을 추후 다른 페이지에서도 재사용할 수 있도록 공용 함수 분리가 필요했다.

## 변경 내용
- 공용 계산 추가:
  - `src2/kernel/schema/daily/logisticsAmountView.ts`
  - `getDirectionTone`, `getLogisticsLineAmountView` 추가
- schema export 반영:
  - `src2/kernel/schema/daily/index.ts`
- 관리 펼치기 적용:
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
  - 금액 표시 규칙 고정
    - 일반 라인: 매입=빨강, 출고=초록
    - 반품대상 라인: 순중량(원중량-반품중량) 기준 금액, 전량 반품 시 0원 흰색
    - 반품기록 라인: 반품중량 기준 참고금액 흰색(합계 제외)
  - 방향 셀을 tone 배지로 표시(행 전체 배경색은 미사용)

## 문서 동기화
- `src2/docs/reference/feature-files-map-unified.md`
  - `logisticsAmountView.ts` 공용 파일 매핑 추가
- `src2/docs/rule/DECISIONS_LOG.md`
  - manage 금액 tone/집계 분리 규칙 결정 추가
- `src2/docs/rule/MIGRATION_STATUS.md`
  - O 섹션(이번 배치) 추가

## 검증
- `npm run build` PASS
- `npm run check:qa` PASS

## 추가 반영 (2026-02-13, 동일 배치 후속)
- register 하단 목록(`src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`)에도 동일 금액 규칙을 적용했다.
  - 단가/금액 표시 추가
  - 반품대상/반품기록/일반 라인 tone 규칙을 manage와 동일하게 고정
- 색상 상수는 `src2/kernel/components/status/LogisticsAmountTone.ts`로 분리해 manage/register가 공통 사용한다.
- 후속 검증:
  - `cmd /c npm run build` PASS
  - `cmd /c npm run check:qa` PASS

## 간단 의견 + 다음 진행 질문
- 관리/등록의 금액 해석 축이 동일해져서 반품 라인의 실금액/참고금액 오해 가능성이 더 줄었다.
- 다음은 register 하단 목록의 정보 밀도(한 줄 표시 vs 두 줄 표시) UX 튜닝만 남겨두면 된다. 바로 레이아웃 압축까지 진행할까?

## 핵심 로직 3줄
- 1) `getLogisticsLineAmountView`로 라인별 금액 계산과 tone 결정을 공용화했다.
- 2) 반품대상 라인은 순중량 기준 금액만 실적으로 보고, 전량 반품은 0원 흰색으로 고정했다.
- 3) 반품기록 라인은 참고금액만 표시하고 합계 계산에는 포함하지 않도록 분리했다.

## 입문자 설명 3줄
- 1) 반품 관련 금액은 “원본에서 빠지는 돈”과 “반품 처리 참고값”을 다르게 보여줘야 헷갈리지 않아.
- 2) 그래서 관리 화면에서 반품 대상과 반품 기록의 금액 표시 규칙을 따로 정했어.
- 3) 계산 함수를 공용 파일로 빼서 다른 화면에서도 같은 규칙을 그대로 쓸 수 있게 했어.

## 주의 사항
- register 하단 목록 금액 표시는 완료됐지만, 향후 목록 항목이 더 늘어나면 카드 가독성(줄바꿈/폭)이 다시 깨질 수 있다.
- 반품 소스 메타(`returnSource*`)가 없는 레거시 라인은 반품 대상 매칭이 제한될 수 있으므로 lineId/소스 보강 정책이 계속 필요하다.

## 향후 과정
- register 하단 목록에서 금액/중량 라인 분리 여부를 UX 기준으로 확정하고, 필요 시 요약 줄 재배치(모바일 우선) 조정한다.
- browse 신규 트랙 시작 시 금액 집계/표시도 동일 공용 함수를 사용해 반품 상쇄 규칙을 일치시킨다.

## 해결 상태
- `Resolved`: manage 유통 금액 tone 규칙 고정, 공용 계산 분리, 문서/게이트 동기화 완료.

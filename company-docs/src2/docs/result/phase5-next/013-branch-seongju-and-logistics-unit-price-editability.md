# 013-branch-seongju-and-logistics-unit-price-editability

> 작성일: 2026-02-12
> 주제: 지부 값 정정(대구/성주) + 유통 단가 자동추천/수동수정 정책 보정
> 이슈 상태: Resolved

---

## 요약
- 지부 공용값을 `대구/성주`로 정정하고, legacy `경주` 값은 `성주`로 정규화되도록 처리했다.
- 유통 단가가 입력 즉시 다시 덮어써지던 문제를 수정해서, 자동추천 후에도 사용자가 직접 수정할 수 있게 변경했다.

## 변경 파일
- `src2/kernel/schema/daily/siteOptions.ts`
- `src2/kernel/repo/domain/issueRepo.ts`
- `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- `src2/docs/reference/page-renewal-common-spec.md`
- `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- `src2/docs/reference/register-daily-files.md`
- `src2/docs/reference/feature-files-map-unified.md`
- `src2/docs/rule/MIGRATION_STATUS.md`
- `src2/docs/result/checklist/002-branch-daegu-seongju-and-logistics-unitprice-editable.md`

## 검증
- `npm.cmd run build` 통과
- `npm.cmd run lint:src2` 통과

## 핵심 로직 3줄
- 1) `DAILY_BRANCH_OPTIONS`를 `대구/성주`로 교체하고 `normalizeDailyBranch`로 legacy `경주`를 `성주`로 수렴시켰다.
- 2) 유통 `updateDraft`에서 단가 자동계산을 "거래처/방향/종류/품목 변경 시"에만 실행하도록 제한했다.
- 3) 단가 필드를 직접 수정할 때(`patch.unitPricePerKg`)는 자동계산을 건너뛰어 수동 입력이 유지되게 했다.

## 입문자 설명 3줄
- 1) 지부 이름 목록을 고쳤고, 옛날 데이터의 `경주`도 자동으로 `성주` 취급하게 만들었다.
- 2) 유통 단가는 거래처 고를 때 기본값이 채워지지만, 이제 사용자가 바로 덮어써도 값이 유지된다.
- 3) 즉, 자동완성은 "추천" 역할만 하고, 최종 입력은 사용자가 결정할 수 있다.

## 주의 사항
- 다른 도메인에서 `경주` 문자열을 직접 비교하는 코드가 추가되면 정규화 누락이 다시 생길 수 있다.
- 유통 단가 자동추천 조건을 더 넓게 바꾸면 동일 회귀(수동입력 불가)가 재발할 수 있다.
- 기존 저장 데이터 화면에서 지부 fallback 표기가 필요한 곳은 browse/manage 수동 확인이 필요하다.

## 향후 과정
- 다음 리뉴얼에서도 자동추천 필드는 기본적으로 editable 정책을 체크리스트로 강제한다.
- browse/manage 이관 시 지부 필드의 legacy 값(`경주`) 렌더링 결과를 한 번에 점검한다.
- 계정 연동 단계에서 작성자 고정 시에도 단가 수동 수정 정책은 유지 여부를 명시적으로 결정한다.

## 이슈 상태
- `Resolved`: 요청한 2건(지부 값 정정, 유통 단가 수동수정 가능화) 반영/검증 완료.

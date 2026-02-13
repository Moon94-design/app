# quick-add 직후 선택 미인식 수정 + 공통 선택 해석 유틸 도입

> 작성일: 2026-02-13
> 주제: 거래처/차량 quick-add 직후 저장 시 선택값 미인식 문제 해결, id->표시값 해석 공통화
> 해결 상태: Resolved

---

## 배경
- 유통 등록에서 거래처/차량을 quick-add로 추가한 직후 바로 저장하면,
  `id`는 들어왔지만 `partnerLabel/vehicleNo`가 빈값으로 남아 "선택해 주세요" 검증에 걸리는 문제가 있었다.
- 원인은 옵션 목록(state) 갱신 타이밍보다 draft 검증이 먼저 도는 케이스에서
  선택 표시값을 빈값으로 덮어쓰는 로직이었다.

## 변경 내용
- 공통 선택 해석 유틸 추가:
  - `src2/app/pages/register/hooks/common/selection.ts`
  - 선택 `id`를 기준으로 옵션에서 표시값을 찾고,
    옵션 미갱신 시 `fallbackValue -> currentValue` 순으로 안전하게 복원.

- quick-add 결과에 선택 표시값 포함:
  - `src2/app/pages/register/hooks/logistics/types.ts` (`CreateResult.selectedText`)
  - `src2/app/pages/register/hooks/logistics/partnerCommands.ts`
  - `src2/app/pages/register/hooks/logistics/vehicleCommands.ts`
  - 중복 선택/신규 생성 모두 `selectedText`를 반환.

- 유통 페이지 적용:
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - quick-add 저장 직후 `updateDraft`에 `partnerId + partnerLabel`, `vehicleId + vehicleNo`를 함께 전달.

- 유통 draft 업데이트 공통화:
  - `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - `partnerId/vehicleId` 패치 시 `resolveSelectionValue`를 사용해 표시값 누락을 방지.

- 다른 선택 페이지에도 공통 적용:
  - `src2/app/pages/register/hooks/useRegisterActionPage.ts`
  - `vendorId/issueId` 선택도 동일 공통 유틸로 처리해 타이밍 이슈로 라벨이 비는 문제를 예방.

## 문서 동기화
- `src2/docs/reference/feature-files-map-unified.md`에 `hooks/common/selection.ts` 추가
- `src2/docs/rule/MIGRATION_STATUS.md`에 quick-add 선택 미인식 수정 항목 추가
- `src2/docs/rule/DECISIONS_LOG.md`에 선택 해석 공통화 결정 추가

## 검증
- 실행: `npm run check:qa`
- 결과: PASS
  - build PASS
  - smoke PASS
  - security PASS
  - p0 consistency PASS

## 간단 의견 + 다음 진행 질문
- 이번 수정으로 "추가 직후 바로 저장" 흐름이 안정화됐고, 선택 로직을 공통화해서 다른 페이지에도 같은 실수를 반복하지 않게 막았다.
- 다음 배치에서 선택 입력이 많은 office/production 보조 선택 흐름까지 같은 유틸로 정리할지 확정할까?


## 추가 보강(최근 1회 단가 자동반영)
- src2/app/pages/register/hooks/logistics/draftUpdater.ts
- 거래처 선택 시 최근 1회 유통 라인의 unitPricePerKg를 우선 자동반영하도록 보강.
- 거래처 기준정보 단가 자동추천은 최근 단가가 없는 경우에만 fallback 적용.
- 단가 필드는 기존과 동일하게 수동 수정 가능(사용자 입력 시 자동 덮어쓰기 없음).
## 핵심 로직 3줄
- 1) 선택 id로 표시값을 찾을 때 옵션 미갱신 상황을 고려해 fallback/current 순 복원 규칙을 공통화했다.
- 2) quick-add 결과에 선택 표시값을 포함해, 목록 갱신 전에도 draft가 유효한 상태를 유지하도록 바꿨다.
- 3) action 선택(vendor/issue)에도 같은 공통 해석 유틸을 적용해 선택 라벨 소실을 예방했다.

## 입문자 설명 3줄
- 1) 새 항목을 추가하자마자 저장해도, 이제 선택값이 비었다고 나오지 않는다.
- 2) 목록이 아직 화면에 반영되지 않았어도, quick-add 결과에서 받은 이름/차량번호를 임시로 써서 저장 검증을 통과시킨다.
- 3) 이런 선택 처리 규칙을 한 파일로 공통화해서 다른 페이지도 같은 방식으로 동작하게 했다.

## 주의 사항
- 공통 유틸이 `fallbackValue`를 신뢰하므로, 호출부에서 잘못된 fallback을 넘기면 잘못된 표시값이 잠깐 남을 수 있다. quick-add 결과 생성부의 텍스트 품질을 계속 같이 관리해야 한다.

## 향후 과정
- 선택형 필드가 많은 다른 폼(특히 office 추가 항목/생산 보조 선택)에도 `resolveSelectionValue`를 단계적으로 적용해, id/라벨 불일치 케이스를 줄인다.
- 필요하면 e2e 수준에서 "추가 직후 즉시 저장" 회귀 시나리오를 smoke 확장으로 추가한다.

## 해결 상태
- `Resolved`: quick-add 직후 선택 미인식 문제 수정 완료, 공통 선택 해석 유틸 적용 및 QA 게이트 통과.

## 추가 보강(처리 단가 편집 + 관리 유통 분리)
- `src2/app/pages/register/hooks/logistics/constants.ts`
  - `hasPriceSelection` 규칙에 처리(방향)를 포함해 단가 입력 필드를 활성화.
- `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - 처리 전환 시 단가를 강제로 0으로 초기화하지 않게 조정.
  - 거래처 기준 단가 자동추천은 매입/출고(카테고리 선택 도메인)에서만 동작하도록 제한.
- `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
  - 관리 유통 목록/수정 대상은 매입·출고 라인만 노출.
  - 저장 시 원본 레코드의 처리 라인은 보존되도록 merge하여 데이터 손실 방지.

검증
- `npm run check:qa` PASS

간단 의견
- 현재 요구사항 기준으로 "등록에서는 처리도 기록, 관리 유통에서는 제외"가 반영됐다.
- 처리 전용 메뉴/탭(폐기물/폐수)은 이후 별도 페이지에서 설계하는 게 맞다.

## 추가 보강(조합 단가 최근 1회 자동반영)
- `src2/app/pages/register/hooks/logistics/selectors.ts`
  - 거래처 + 방향 + 종류 + 품목 조합 기준 최근 1회 단가 조회 유틸 추가.
- `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - 거래처/방향/종류/품목 변경 시 조합 최근 단가를 우선 자동반영.
  - 조합 최근값이 있으면 profile 단가 fallback보다 우선 적용.
  - 수동 입력 단가는 기존처럼 우선(자동 덮어쓰기 없음).

검증
- `npm run check:qa` PASS

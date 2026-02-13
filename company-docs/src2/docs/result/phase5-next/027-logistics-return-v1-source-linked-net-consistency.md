# 유통 반품 v1: 원본 연결 저장 + 과반품 차단 + 관리 순중량 계산

> 작성일: 2026-02-13
> 주제: 유통 반품을 "원본 참조 가능한 데이터"로 저장하고, 관리 집계가 정합성을 유지하도록 1차 잠금
> 해결 상태: Resolved

---

## 배경
- 반품을 일반 매입/출고 라인처럼만 저장하면, 나중에 "어느 원본을 얼마나 상쇄했는지"를 추적할 수 없어서 조회/통계 정합성이 깨진다.
- 부분반품이 가능한 운영 특성상, 원본 중량 대비 누적 반품량을 계산할 수 있는 데이터 구조가 필요했다.

## 변경 내용
- 반품 메타 저장 필드 추가
  - `isReturn`, `returnSourceRecordId`, `returnSourceLineId`, `sourceDirection`, `sourceKg`, `returnedKg`, `lineId`
- 등록 화면 반품 패널 추가
  - 거래처 기준 최근 5건(또는 날짜 필터) 원본 항목 선택
  - 선택 시 방향 반전(매입↔출고), 종류/품목/차량/단가/중량 자동 반영
- 저장 검증 강화
  - 원본 항목 존재 검증
  - 원본 방향과 반품 방향 정합 검증
  - 잔여 중량 초과(과반품) 차단
- 관리 유통 표시/집계 보강
  - 반품 라인 주황 태그 표시
  - 순중량/순금액을 `원본 - 누적 반품` 기준으로 계산
- 자동 추천 보정
  - 최근 단가/스크랩 세부품목 자동 추천에서 반품 라인 제외

## 반영 파일
- `src2/app/pages/register/hooks/logistics/types.ts`
- `src2/app/pages/register/hooks/logistics/constants.ts`
- `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
- `src2/app/pages/register/hooks/logistics/selectors.ts`
- `src2/app/pages/register/hooks/logistics/submitCommand.ts`
- `src2/app/pages/register/hooks/logistics/lineEdit.ts`
- `src2/app/pages/register/hooks/logistics/merge.ts`
- `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
- `src2/app/pages/register/sections/logistics/ReturnSourcePanel.tsx`
- `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
- `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`

## 검증
- 실행: `npm run check:qa`
- 결과: PASS
  - build PASS
  - smoke PASS
  - security PASS
  - p0 consistency PASS

## 간단 소견 + 다음 진행 질문
- 반품을 "원본 참조 가능한 이벤트"로 고정했기 때문에, 이후 browse/통계 리뉴얼에서 상쇄 계산 규칙을 안전하게 확장할 수 있는 기반은 확보됐다.
- 다음 배치로 바로 `스크랩 > 기타`를 고정 버튼 누적이 아니라 "히스토리 드롭다운(선택/삭제)"로 전환할까?

## 추가 보강(반품 UX 잠금 + 저장 시 내부 반전)
- 반품 원본 선택 직후 draft 방향을 UI에서 즉시 반전하지 않도록 수정했다.
- 반품 모드에서 원본 선택이 완료되면 방향/종류/품목(세부 품목 포함)을 잠그고, 저장 시점에만 내부 방향을 반전(매입↔출고) 처리하도록 변경했다.
- 등록/관리 하단 목록의 방향 표시는 반품 라인일 때 `반품`으로 표기해 사용자가 즉시 구분할 수 있게 했다.
- 훅 비대화 방지를 위해 반품 선택 patch 생성 로직을 `hooks/logistics/returnSource.ts`로 분리했다.

## 핵심 로직 3줄
- 1) 반품 라인 저장 시 원본 라인 식별자(`recordId+lineId`)와 원본/반품 중량 메타를 함께 저장한다.
- 2) 반품 저장 직전에 누적 반품량을 계산해 `요청 반품량 <= 잔여 중량`을 강제한다.
- 3) 관리 집계는 반품 라인을 별도 태그로 표시하고, 원본 라인 합계에서 누적 반품량을 차감해 순중량/순금액을 계산한다.

## 입문자 설명 3줄
- 1) 이제 반품은 "그냥 반대 방향 입력"이 아니라 "원본을 찍고 되돌리는 입력"이야.
- 2) 이미 다 반품된 건을 또 반품하려고 하면 저장이 막혀.
- 3) 관리 화면 합계는 반품이 자동으로 빠진 실제 값(순값)으로 보여준다.

## 주의 사항
- 원본 라인 식별(`lineId`)이 없는 과거 데이터는 반품 원본 후보로 잡히지 않을 수 있다. merge/정규화 과정에서 `lineId` 보강이 빠지면 반품 후보 공백이 생길 수 있다.
- 반품 후보 필터 규칙(거래처 기준/처리 제외/날짜 필터)은 향후 처리 전용 메뉴 도입 시 재검토가 필요하다.

## 향후 과정
- `src2/app/pages/register/hooks/logistics/selectors.ts`: 스크랩 기타 히스토리 조회/삭제 selector 확장 시 반품 제외 조건을 동일하게 유지해야 한다.
- `src2/app/pages/register/sections/logistics/LogisticsFormSection.tsx`: 기타 입력 UI를 드롭다운+삭제 UX로 바꿀 때 기존 빠른 입력 흐름(직접 입력)과 충돌하지 않게 분리해야 한다.
- `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`: 통계/조회 리뉴얼 시 "원본중량/반품중량/순중량" 3값 동시 노출 요구가 오면 현재 집계 로직을 공용 유틸로 승격하는 게 안전하다.

## 해결 상태
- `Resolved`: 반품 v1 저장 모델/검증/관리 집계/표시까지 일관 연결 완료, QA 게이트 통과.

# 015-logistics-record-title-and-vehicle-suggestion-placement

> 작성일: 2026-02-12
> 주제: 유통 저장 후 하단 제목 표시 보정 + 차량추천 문구 위치를 차량선택칸 아래로 정렬
> 이슈 상태: Resolved

---

## 요약
- 선택 날짜 하단 리스트에서 제목이 거래처명으로만 보이던 문제를, 저장된 `record.title` 우선 표시로 보정했다.
- 병합 단계에서 제목을 덮어쓰지 않도록 조정해 유통 제목 템플릿이 유지되게 했다.
- 차량추천 문구/버튼을 차량 선택 필드 바로 아래로 이동해 요청한 위치로 맞췄다.

## 핵심 변경
- `src2/app/pages/register/hooks/logistics/merge.ts`
  - 날짜 병합 시 `title`을 강제 문자열로 덮어쓰지 않고, 기존 `base.title`이 있으면 유지하도록 수정.
- `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - 선택 날짜 레코드의 `title`을 추출해 하단 리스트 컴포넌트로 전달.
- `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - `recordTitle` 표시 영역 추가(라인 리스트 위 카드).
- `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - 차량추천 문구/추천 버튼 블록을 차량 선택 칸 내부 하단으로 이동.

## 검증
- `npm.cmd run build` 통과
- `npm.cmd run lint:src2` 통과

## 체크리스트 결과
- `src2/docs/result/checklist/004-logistics-selected-list-title-and-vehicle-suggestion-position.md`

## 핵심 로직 3줄
- 1) 유통 레코드 병합 시 제목은 `base.title`을 우선 사용하고, 없을 때만 fallback 제목을 생성한다.
- 2) 등록 페이지는 선택 날짜 레코드에서 제목을 꺼내 하단 리스트에 별도 전달한다.
- 3) 차량추천 UI는 거래처 영역이 아니라 차량 선택 필드 하단에서 렌더링한다.

## 입문자 설명 3줄
- 1) 이제 저장한 유통 제목이 아래 기록 영역에서 그대로 보입니다.
- 2) 시스템이 제목을 임의 문자열로 바꿔버리던 부분을 막았습니다.
- 3) 차량 추천 안내는 차량 선택 칸 바로 밑에서 확인할 수 있습니다.

## 주의 사항
- 기존 데이터 중 제목이 비어있는 건 fallback 제목으로 계속 보일 수 있다.
- 동일 날짜에 과거 중복 레코드가 많은 경우, 병합 결과(제목/라인)가 기대와 다른지 수동 확인이 필요하다.
- 차량추천 문구 위치는 맞췄지만, 브라우저 폭이 좁을 때 줄바꿈 동작은 추가 확인이 필요하다.

## 향후 과정
- 하단 리스트에서 제목/라인 가독성(모바일 포함)만 한 번 더 수동 점검한다.
- 같은 패턴으로 표시되는 다른 일일 페이지에도 `recordTitle` 표준을 공통 컴포넌트로 확장 검토한다.
- 이슈/조치 인라인 모달에서도 제목 템플릿이 저장 리스트에 일관되게 보이는지 연속 검증한다.

## 추가 보정 (2026-02-12)
- 사용자 요청에 따라 유통/이슈/조치 제목에서 `작성자/직책` 라벨 괄호를 제거했다.
- 변경 파일: `src2/kernel/schema/daily/titleTemplates.ts`
- 체크리스트: `src2/docs/result/checklist/005-logistics-title-remove-writer-role-labels.md`

## 이슈 상태
- `Resolved`: 요청한 제목 표시 보정과 차량추천 위치 조정 반영 완료.

# 반품 상태 배지 공용화와 체크리스트 보강

> 작성일: 2026-02-13
> 주제: 반품 상태 표시를 상태 배지 공용 규칙으로 고정하고, 기본 체크리스트에 운영 중 학습 항목 반영 규칙 추가
> 해결 상태: Resolved

---

## 작업 배경
- 반품 상태 표시가 라인 강조로 오해될 수 있어서, 상태 셀의 배지로만 표시하는 규칙을 코드로 고정할 필요가 있었음.
- 같은 상태 표시를 다른 페이지에서도 재사용할 수 있도록 공용 함수/컴포넌트 경계가 필요했음.
- 작업 중 새로 발견한 반복 리스크를 체크리스트에 즉시 반영하는 운영 습관을 명시적으로 강제할 필요가 있었음.

## 변경 내용
- 상태 표시 공용화
  - `src2/kernel/schema/daily/logisticsReturnStatus.ts`
    - 반품 상태 계산/중량 표기 포맷 공용화
    - `buildReturnedKgBySourceFromLines` 추가
  - `src2/kernel/components/status/ReturnStatusBadge.tsx`
    - 상태 배지(반품기록/반품대상 색상 분리) 공용 컴포넌트 사용
- 화면 적용
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
    - 상태 컬럼: 반품 상태는 `ReturnStatusBadge`로만 표시
    - 중량 컬럼: `formatReturnWeightText` 공용 포맷 적용
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
    - 하단 목록에도 동일 배지/중량 포맷 적용
- 체크리스트/맵 문서 최신화
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
    - 추가 항목: "작업 중 반복 리스크 발견 시 체크리스트 즉시 추가 + 채팅 응답에 추가 항목 명시"
  - `src2/docs/reference/feature-files-map-unified.md`
    - 신규/활용 기능 파일 매핑 추가

## 검증
- `npm run build` PASS
- `npm run check:qa` PASS

## 간단 의견 + 다음 진행 질문
- 반품 상태는 이제 "상태 셀 배지"로 고정돼서 화면 해석 오차가 줄었고, 등록/관리 둘 다 같은 계산 기준을 쓰게 됐음.
- 다음은 `ManageLogisticsListSection.tsx`의 금액 색상 규칙(입고/출고/반품대상/반품기록)을 네가 정한 최종 정책으로 고정할지 바로 이어서 갈까?

## 핵심 로직 3줄
- 1) 반품 상태 계산을 `logisticsReturnStatus.ts`로 모아 등록/관리 화면이 동일한 판단 함수를 사용하게 했다.
- 2) 반품 표시를 라인 배경이 아니라 `ReturnStatusBadge`로 통일해 상태 컬럼에서만 강조되게 했다.
- 3) 반품 중량 텍스트는 `formatReturnWeightText`로 공용화해 반품기록/반품대상 표기를 일관되게 맞췄다.

## 입문자 설명 3줄
- 1) "반품인지"를 각 페이지에서 따로 계산하지 않고, 한 파일에서 같이 계산하게 정리했어.
- 2) 이제 반품은 행 전체가 물들지 않고, 작은 상태 배지로만 보여서 덜 헷갈려.
- 3) 중량 표기도 한 함수에서 만들어서 화면마다 다르게 보일 일이 줄었어.

## 주의 사항
- 관리/등록은 공용 상태 함수를 쓰도록 맞췄지만, 추후 browse 신규 구현 시에도 같은 함수를 재사용하지 않으면 다시 표기 불일치가 생길 수 있음.
- `statusRecordId`가 없는 데이터(과거 레거시 라인)에서는 반품대상 매칭이 일부 불완전할 수 있어, 레거시 정규화 단계에서 lineId 보강 정책을 계속 유지해야 함.

## 향후 과정
- 금액/중량 색상 정책 확정 시 `ManageLogisticsListSection.tsx`와 관련 schema helper를 동시에 수정해 표시·계산 규칙을 함께 잠글 것.
- 반품 통계(상쇄 로직) 착수 전에 `logisticsReturnStatus.ts`를 기준 모듈로 두고 manage/browse 집계 로직을 동일 인터페이스로 연결할 것.

## 해결 상태
- `Resolved`: 반품 상태 배지 공용화, 등록/관리 적용, 체크리스트 항목 추가, QA 게이트 통과까지 완료.

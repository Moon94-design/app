# 014-logistics-type-layout-and-title-template-standardization

> 작성일: 2026-02-12
> 주제: 유통 종류/품목 UI 정리 + 차량추천 레이아웃 안정화 + 유통/이슈/조치 제목 템플릿 통일
> 이슈 상태: Resolved

---

## 요약
- 유통 타입 영역에서 `종류 (PP/PE)` 표기를 정리하고, 처리 방향에서는 PP/PE 선택/품목 라벨을 숨기도록 수정했다.
- 거래처 선택 후 차량 추천이 뜰 때 2열 입력 레이아웃이 흔들리던 문제를 완화했다.
- 유통/이슈/조치 제목 생성을 공통 템플릿에서 요청한 태그 접두사 포맷으로 통일했다.

## 핵심 변경
- 유통 타입 UI
  - `src2/app/pages/register/sections/logistics/LogisticsTypeFields.tsx`
  - 변경 사항:
    - `종류 (PP/PE)` -> `종류`
    - 처리 방향(`direction=처리`)일 때 PP/PE 선택 영역 비노출
    - 처리 방향일 때 `품목` 라벨 대신 `종류` 라벨에 폐기물/폐수 노출
- 차량 추천 레이아웃
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - 변경 사항:
    - 2열 그리드에 `alignItems:start` 적용
    - 차량 추천 UI를 2열 블록 아래로 분리하여 거래처 칸 스트레치 완화
- 제목 템플릿 공통화/보정
  - `src2/kernel/schema/daily/titleTemplates.ts`
  - `src2/app/pages/register/hooks/logistics/formatters.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - 변경 포맷:
    - 유통: `[일일][유통] 작성자(작성자) 직책(직책) 작성. YYYY-MM-DD`
    - 이슈(유통): `[이슈][일일][유통] 제목(이슈제목) 작성자(작성자) 직책(직책) 작성. YYYY-MM-DD`
    - 조치(유통): `[조치][일일][유통] 제목(이슈제목) 작성자(작성자) 직책(직책) 작성. YYYY-MM-DD`

## 검증
- `npm.cmd run build` 통과
- `npm.cmd run lint:src2` 통과

## 체크리스트 결과
- `src2/docs/result/checklist/003-logistics-type-ui-and-title-template-fix.md`

## 문서 최신화
- `src2/docs/reference/page-renewal-common-spec.md`
- `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- `src2/docs/reference/register-daily-files.md`
- `src2/docs/reference/feature-files-map-unified.md`
- `src2/docs/rule/MIGRATION_STATUS.md`

## 핵심 로직 3줄
- 1) 처리 방향이면 PP/PE 선택을 숨기고 `종류` 버튼(폐기물/폐수)만 보여주도록 UI 분기를 바꿨다.
- 2) 차량 추천 영역을 2열 필드 외부로 분리해 거래처 필드 높이가 같이 늘어나는 현상을 줄였다.
- 3) 유통/이슈/조치 제목을 `titleTemplates.ts`에서 태그 접두사 포맷으로 일괄 생성하도록 통일했다.

## 입문자 설명 3줄
- 1) 처리 입력에서는 이제 헷갈리는 PP/PE 영역이 안 나오고, 폐기물/폐수만 종류에서 고를 수 있다.
- 2) 차량 추천이 떠도 거래처 선택 칸이 같이 늘어나 보이던 문제가 줄어든다.
- 3) 저장되는 제목은 페이지마다 따로 만들지 않고 공통 규칙으로 동일하게 만들어진다.

## 주의 사항
- 유통/이슈/조치 제목 포맷이 바뀌었기 때문에 기존 저장 데이터와 신규 데이터 제목 패턴이 혼재될 수 있다.
- 추후 다른 일일 페이지(생산/사무)에 같은 접두사 규칙을 적용할 때, 기존 자동제목과 충돌하지 않게 단계적으로 이관해야 한다.
- UI 라벨(종류/품목) 의미가 다시 바뀌면 `LogisticsTypeFields`와 검증 문구를 반드시 같이 수정해야 한다.

## 향후 과정
- 전 일일 페이지 제목 규칙을 같은 템플릿 계열로 확장할 때 도메인별 접두사 정책을 먼저 문서화한다.
- 조회/관리 페이지에서 신규 제목 패턴이 잘 보이는지 화면 점검 후 필요하면 검색 키워드 정책을 조정한다.
- 처리 방향 UX(종류/품목) 수동 테스트 결과를 바탕으로 버튼 순서/문구를 추가 보정한다.

## 이슈 상태
- `Resolved`: 요청한 유통 UI/레이아웃/제목 템플릿 수정 완료.

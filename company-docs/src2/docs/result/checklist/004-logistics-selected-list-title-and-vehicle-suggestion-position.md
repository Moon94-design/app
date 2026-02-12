# 004-logistics-selected-list-title-and-vehicle-suggestion-position

> 작성일: 2026-02-12
> 작업: 유통 하단 리스트 제목 표시 보정 + 차량추천 문구 위치를 차량선택칸 아래로 조정
> 참조: `src2/docs/reference/page-renewal-common-spec.md`, `src2/docs/reference/feature-files-map-unified.md`, `src2/docs/reference/register-daily-files.md`, `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`

---

## A) 선참조 체크
- [x] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [x] `src2/docs/reference/feature-files-map-unified.md` 확인
- [x] `src2/docs/reference/register-daily-files.md` 확인
- [x] `src2/docs/rule/main_rule.md` 확인
- [x] 신규 파일 생성 없음

## B) 리뉴얼 체크

### B-1) 범위/분석
- [x] 하단 선택일 리스트가 거래처명만 보여주는 원인 확인
- [x] 차량추천 문구 위치 요구사항 확인
- [x] merge 단계에서 title 덮어쓰기 여부 확인

### B-2) 설계/구조
- [x] title은 merge 단계에서 보존, 없을 때만 fallback 사용
- [x] 선택일 리스트는 record title 표시 + 라인 상세는 별도 노출
- [x] 차량추천 문구는 차량선택 폼필드 내부로 재배치

### B-3) 구현
- [x] `merge.ts`에서 `base.title` 보존
- [x] `SelectedDateLogisticsList`에 `recordTitle` 표시 추가
- [x] `RegisterLogisticsDailyPage`에서 `recordTitle` 전달
- [x] `LogisticsIdentityFields`에서 차량추천을 차량선택칸 아래로 이동

### B-4) 검증
- [x] `npm.cmd run build` 통과
- [x] `npm.cmd run lint:src2` 통과
- [ ] 수동 검증(저장 직후 하단 제목/차량추천 위치)

## C) 핵심 변경 파일
- `src2/app/pages/register/hooks/logistics/merge.ts`
- `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
- `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
- `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`

## D) 잔여 확인 필요
- [ ] 선택일 리스트에서 title/line 정보 가독성 확인
- [ ] 차량추천 노출 시 거래처칸/차량칸 높이 안정성 수동 점검

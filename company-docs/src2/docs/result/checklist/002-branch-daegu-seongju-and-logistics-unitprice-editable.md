# 002-branch-daegu-seongju-and-logistics-unitprice-editable

> 작성일: 2026-02-12
> 작업: 지부 옵션 대구/성주 정정 + 유통 단가 자동추천 후 수동수정 허용
> 참조: `src2/docs/reference/page-renewal-common-spec.md`, `src2/docs/reference/feature-files-map-unified.md`, `src2/docs/reference/register-daily-files.md`, `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`

---

## A) 선참조 체크
- [x] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [x] `src2/docs/reference/feature-files-map-unified.md` 확인
- [x] `src2/docs/reference/register-daily-files.md` 확인
- [x] `src2/docs/rule/main_rule.md` 확인
- [x] 신규 파일 생성 없음(기존 공용/훅 보강)

## B) 리뉴얼 체크

### B-1) 범위/분석
- [x] 범위 고정: 지부명 정정 + 유통 단가 입력 회귀 수정
- [x] 원인 분석: `useRegisterLogisticsPage.updateDraft`에서 단가를 매번 자동값으로 재할당
- [x] 영향 범위: logistics register, site 공용 타입, issue legacy site 정규화

### B-2) 설계/구조
- [x] 자동추천은 유지, 수동입력은 잠그지 않는 정책으로 수정
- [x] 지부 값은 공용 상수 SSOT에서 일괄 교정
- [x] 구값(경주) 호환 정규화 처리 추가

### B-3) 구현
- [x] `DAILY_BRANCH_OPTIONS`를 `대구/성주`로 변경
- [x] legacy `경주 -> 성주` 정규화 함수 추가
- [x] issue repo site normalize에 정규화 함수 적용
- [x] 유통 단가 자동재계산 조건을 "관련 필드 변경 시에만"으로 제한

### B-4) 검증
- [x] `npm.cmd run build` 통과
- [x] `npm.cmd run lint:src2` 통과
- [ ] 수동 검증(유통 화면에서 거래처 선택 후 단가 직접 수정/저장)

## C) 핵심 변경 파일
- `src2/kernel/schema/daily/siteOptions.ts`
- `src2/kernel/repo/domain/issueRepo.ts`
- `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`

## D) 잔여 확인 필요
- [ ] 기존 저장 데이터의 `경주` 표시가 화면에서 `성주`로 일관되게 보이는지 수동 확인
- [ ] 유통 단가 직접 수정 후 저장/재진입 시 값 반영 확인

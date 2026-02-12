# 005-logistics-title-remove-writer-role-labels

> 작성일: 2026-02-12
> 작업: 유통/이슈/조치 제목에서 `(작성자)`, `(직책)` 라벨 제거
> 참조: `src2/docs/reference/page-renewal-common-spec.md`, `src2/docs/reference/feature-files-map-unified.md`, `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`

---

## A) 선참조 체크
- [x] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [x] `src2/docs/reference/feature-files-map-unified.md` 확인
- [x] `src2/docs/rule/main_rule.md` 확인

## B) 리뉴얼 체크

### B-1) 범위/분석
- [x] 제목 템플릿 생성 지점(`titleTemplates.ts`) 단일화 여부 확인
- [x] 작성자/직책 라벨 제거 대상 범위(유통/이슈/조치) 확인

### B-2) 구현
- [x] `formatDailyLogisticsTitle`에서 작성자/직책을 라벨 없이 값만 출력
- [x] `formatIssueDailyLogisticsTitle`에서 작성자/직책 라벨 제거
- [x] `formatActionDailyLogisticsTitle`에서 작성자/직책 라벨 제거
- [x] 이슈제목 라벨(`(이슈제목)`)은 기존 유지

### B-3) 검증
- [x] `npm.cmd run build` 통과
- [x] `npm.cmd run lint:src2` 통과
- [ ] 수동 검증(유통 저장 + 이슈/조치 저장 시 제목 문자열 확인)

## C) 핵심 변경 파일
- `src2/kernel/schema/daily/titleTemplates.ts`

## D) 잔여 확인 필요
- [ ] 기존 저장 데이터(이전 포맷)와 신규 저장 데이터(라벨 제거 포맷) 혼재 표시 확인

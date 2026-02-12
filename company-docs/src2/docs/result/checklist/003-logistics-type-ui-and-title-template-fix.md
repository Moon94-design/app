# 003-logistics-type-ui-and-title-template-fix

> 작성일: 2026-02-12
> 작업: 유통 종류/품목 UI 규칙 정리 + 차량추천 레이아웃 안정화 + 유통/이슈/조치 제목 템플릿 보정
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
- [x] 유통 타입 필드 라벨/표시 규칙 점검
- [x] 차량추천 표시 시 레이아웃 변형 원인 점검
- [x] 저장 제목 템플릿 생성 경로(titleTemplates) 점검

### B-2) 설계/구조
- [x] 제목 규칙은 `@kernel/schema/daily/titleTemplates.ts` SSOT 유지
- [x] 유통 UI 조건 분기(처리 시 품목 라벨 숨김) 최소 수정
- [x] 자동추천과 수동수정 정책 충돌 없이 유지

### B-3) 구현
- [x] `종류 (PP/PE)` 라벨에서 `(PP/PE)` 제거
- [x] 처리 방향에서 PP/PE 선택 영역 비노출, 폐기물/폐수는 `종류` 라벨에 노출
- [x] 처리 방향에서 `품목` 라벨 비노출
- [x] 차량추천을 2열 필드 밖으로 분리 + 2열 row `alignItems:start`로 레이아웃 흔들림 완화
- [x] 유통 제목 템플릿을 `[일일][유통] 작성자/직책/작성일` 형식으로 보정
- [x] 이슈/조치 제목 템플릿도 동일 패턴(`[이슈]...`, `[조치]...`)으로 보정

### B-4) 검증
- [x] `npm.cmd run build` 통과
- [x] `npm.cmd run lint:src2` 통과
- [ ] 수동 검증(유통 저장 제목, 처리 방향 라벨, 추천차량 노출 시 레이아웃)

## C) 핵심 변경 파일
- `src2/kernel/schema/daily/titleTemplates.ts`
- `src2/app/pages/register/hooks/logistics/formatters.ts`
- `src2/app/pages/register/hooks/logistics/submitCommand.ts`
- `src2/app/pages/register/sections/logistics/LogisticsTypeFields.tsx`
- `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`

## D) 잔여 확인 필요
- [ ] 기존 저장 레코드 제목과 신규 템플릿 혼재 상태에서 관리/조회 화면 가독성 확인
- [ ] 처리 방향 전환 시 종류/품목 라벨 상태가 UX 기대와 일치하는지 수동 확인

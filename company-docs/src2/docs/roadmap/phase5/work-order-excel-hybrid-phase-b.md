# 공장 방식 작업 순서표 - Excel Hybrid Phase B (/excel native 이관 완료)

작성일: 2026-02-11
목적: 하이브리드 전략에서 B단계(`/excel` @legacy 제거 완료)만 집중 실행
참조:
- `company-docs/src2/docs/roadmap/phase5/excel-rule-migration-sequencing-roadmap.md`
- `company-docs/src2/docs/roadmap/phase5/work-order-excel-import-hub-migration.md`
- `company-docs/src2/docs/reference/excel-expression-normalization-matrix-v1.md`
- `company-docs/src2/docs/reference/excel-rule-dictionary-v1.md`

================================================================================
대상
- 라우트: `/excel`
- 현재 상태: SHADOW
- 목표 상태: MIGRATED 직전 조건 충족 (native 경로 + 검증 완료)

================================================================================
시작 체크 (Guide 우선)
- [x] DOCS_GUIDE 확인
- [x] main_rule 확인
- [x] MIGRATION_STATUS 현재 상태 확인 (`/excel` SHADOW 확인)
- [ ] GATES_CHECKLIST의 G4/G5 확인

================================================================================
범위 고정 (이번 B단계)
- [x] `src2/app/pages/excel/**`에서 `@legacy` import 0 달성
- [x] partner/weighing/vehicle 업로드 패널을 src2 native 컴포넌트로 교체
- [x] parser bridge에서 legacy parser 호출 제거
- [x] parse result type을 src2 native 타입으로 교체
- [x] 저장 경로는 domain repo만 사용

금지
- [ ] learned rule/price-band 고도화(Phase D) 선착수 금지
- [ ] mergePolicy 확장 구현 선착수 금지
- [ ] kernel에서 @legacy import 금지

================================================================================
파일 단위 체크리스트

## 1) 타입/계약
- [ ] `src2/kernel/adapters/excel/common/types.ts`에 src2 native parse result 타입 확정
- [x] `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`의 legacy type import 제거

## 2) 파서/어댑터
- [x] `src2/app/pages/excel/adapters/partnerExcelBridge.ts` legacy parser 제거
- [x] `src2/app/pages/excel/adapters/weighingExcelBridge.ts` legacy parser 제거
- [x] `src2/app/pages/excel/adapters/vehicleExcelBridge.ts` legacy parser 제거
- [x] `src2/kernel/schema/excel/expressionNormalization.ts` 적용 경로 연결(날짜/숫자 정규화)
- [ ] `src2/kernel/schema/excel/ruleDictionarySeed.ts` 참조 지점 연결(최소 후보 분류)

## 3) UI 섹션
- [x] `ExcelPartnerUploadSection.tsx` native 업로드/미리보기/적용 흐름으로 교체
- [x] `ExcelWeighingUploadSection.tsx` native 업로드/미리보기/적용 흐름으로 교체
- [x] `ExcelVehicleUploadSection.tsx` native 업로드/미리보기/적용 흐름으로 교체
- [x] `ExcelHubLayoutSection.tsx` 탭/상태 표시 유지

## 4) 저장/적용
- [x] partner 적용 시 `createPartnerRepo` 경유
- [x] weighing 적용 시 `createWeighingRepo` 경유
- [x] weighing 중복키를 `site+ticketNo` 기준으로 판정(대구/성주 분리)
- [x] vehicle 적용 시 `createVehicleRepo` 경유
- [x] localStorage 직접 접근 0

================================================================================
게이트 (B단계 완료 조건)
- [x] `npm run build` 성공
- [ ] `/excel` 직접 URL 진입 + 새로고침 OK
- [ ] 샘플 업로드 시나리오 3종 수동 통과
  - [ ] partner 파일 1개
  - [ ] weighing 파일 1개
  - [ ] vehicle 파일 1개
- [ ] 업로드 후 manage/browse에서 반영 데이터 확인
- [x] `/excel` 경로 내부 @legacy import 0 재검색 확인
  - 명령: `rg -n "@legacy" company-docs/src2/app/pages/excel`

================================================================================
완료 후 문서 반영
- [x] MIGRATION_STATUS `/excel` 메모 업데이트
- [ ] GATES_CHECKLIST 체크 반영
- [x] result 기록(phase5-excel)
- [ ] 필요 시 DECISIONS_LOG에 예외 기록

================================================================================
리스크 메모
- 3차 분류(level3)는 자동확정하지 않는다(반자동 검토 유지).
- 누락/중복은 숨기지 않고 이후 C단계(queue 구현) 입력값으로 남긴다.
- 이번 단계는 “동작 경로 통일”이 목적이며, 분류 정확도 최적화는 후속 단계다.

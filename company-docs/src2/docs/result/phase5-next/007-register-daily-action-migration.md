# register/daily/action src2 이관 완료

> 작성일: 2026-02-12
> 주제: SHADOW `/register/daily/action`를 src2 페이지/훅으로 전환하고 문서 상태를 최신화
> 이슈 상태: Resolved

---

## 작업 요약
- `/register/daily/action` loader를 `@app2/pages/register/RegisterActionPage`로 교체해 SHADOW를 해소했다.
- 액션 등록 전용 훅(`useRegisterActionPage`)을 추가해 draft, repo 저장, 최근 목록 삭제 흐름을 src2로 통합했다.
- 상태 문서를 갱신해 분포를 `MIGRATED 19 / SHADOW 7`로 반영했다.

## 검증 결과
- `npm run build`: PASS
- `npm run check:qa`: FAIL (기존 보안 debt 1건 유지)
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts` localStorage 직접 접근

## 변경 파일
- `company-docs/src2/app/pages/register/RegisterActionPage.tsx`
- `company-docs/src2/app/pages/register/hooks/useRegisterActionPage.ts`
- `company-docs/src2/kernel/draft/draftKeys.ts`
- `company-docs/src2/app/nav/navConfig.ts`
- `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
- `company-docs/src2/docs/roadmap/roadmap.md`

## 간단 의견
- 이번 턴에서 register/daily 4개 묶음(logistics/office/production/action)이 모두 MIGRATED가 되어, 이후는 browse/관리 축을 집중적으로 줄이면 된다.

## 다음 진행 질문
- 다음 이관을 `/browse/master`로 바로 진행할지, 아니면 `check:security` debt 1건을 먼저 정리할지 우선순위를 확정할까?

## 핵심 로직 3줄
- 1) `useRegisterActionPage`에서 draft 입력값을 검증 후 action repo에 upsert한다.
- 2) navConfig loader를 src2 페이지로 교체해 Shadow Router 의존을 제거한다.
- 3) 이관 직후 `MIGRATION_STATUS`와 `roadmap` 분포 수치를 즉시 갱신한다.

## 입문자 설명 3줄
- 1) 이제 조치 등록 화면은 레거시가 아니라 새 src2 코드로 열려.
- 2) 입력 중 내용은 draft로 보존되고, 저장하면 src2 저장소 규칙으로 기록돼.
- 3) 문서 숫자(MIGRATED/SHADOW)도 실제 코드 상태와 맞게 업데이트했어.

## 주의 사항
- browse 쪽은 아직 SHADOW라, register/action 저장 결과가 browse 화면에서 같은 의미로 보이는지 parity를 계속 확인해야 한다.
- `check:qa` 실패 원인이 기존 보안 debt라서, 다음 턴에서 debt를 방치하면 게이트 신뢰도가 떨어질 수 있다.
- navConfig가 인코딩 민감 파일이라, 라벨 텍스트 수정 시 빌드 전후 문법/문자 깨짐을 같이 점검해야 한다.

## 향후 과정
- 다음 대상 후보: `company-docs/src2/app/nav/navConfig.ts` 기준 `/browse/master` SHADOW 해소.
- browse 이관 시 연쇄 영향: `src2/app/pages/browse/*`, 관련 query/repo 계약, 결과 문서 및 상태판 동기화.
- 보안 debt 정리 시 영향: `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`와 storage adapter 규칙 정합성 점검.

## 이슈 상태
- `Resolved`: `/register/daily/action` src2 이관 및 문서 동기화 완료.

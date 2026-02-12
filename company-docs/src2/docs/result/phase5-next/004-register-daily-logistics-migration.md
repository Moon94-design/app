# register/daily/logistics src2 이관

> 작성일: 2026-02-11
> 주제: SHADOW 11 실행 큐 1번(`/register/daily/logistics`)을 MIGRATED로 전환
> 이슈 상태: Open

---

## 변경 요약
- `register/daily/logistics` 페이지를 src2 네이티브로 신규 작성했다.
- 레거시 loader를 `@legacy`에서 `@app2`로 교체해 라우트 기준 SHADOW -> MIGRATED 전환했다.
- 저장 구조는 `@kernel/repo(createDailyRepo)` + `@kernel/draft(useDraft)` + `@kernel/schema/daily`를 사용하도록 맞췄다.

## 코드 변경
- 신규
  - `company-docs/src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `company-docs/src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- 수정
  - `company-docs/src2/app/nav/navConfig.ts`
    - `/register/daily/logistics` loader -> `@app2/pages/register/RegisterLogisticsDailyPage`
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
    - logistics 항목 `MIGRATED` 반영
    - SHADOW 실행 큐 1번 체크 완료
    - 분포 수치 `MIGRATED 16 / SHADOW 10` 반영
  - `company-docs/src2/docs/roadmap/roadmap.md`
    - 분포 수치 `MIGRATED 16 / SHADOW 10` 반영

## 검증
- `npm.cmd run build`: 성공
- `npm.cmd run check:qa`: 실패
  - 원인: 기존 보안 점검 부채 1건
  - 항목: `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`의 direct `localStorage` 접근
  - 이번 이관 변경 파일과 직접 연관 없는 기존 이슈로 확인

## 다음 진행 제안
- SHADOW 실행 큐 2번 `/register/daily/office` 이관으로 바로 이어간다.
- 동시에 보안 부채 1건(`useExcelImportHubPage.ts`)은 별도 턴에서 정리해 `check:qa`를 게이트로 복구한다.

## 핵심 로직 3줄
- 1) 물류 등록 화면을 src2 페이지/훅 구조로 분리하고 draft 기반 입력 흐름을 구성했다.
- 2) 저장 시 `dailyRepo`의 `logistics` 문서에 라인을 누적하도록 표준 저장 경로를 통일했다.
- 3) nav loader를 src2 타깃으로 교체해 라우팅 레벨에서 SHADOW 상태를 제거했다.

## 입문자 설명 3줄
- 1) 이제 물류 등록 화면은 예전 코드가 아니라 새 구조(src2)에서 실행된다.
- 2) 입력 중 내용은 draft로 임시 저장되고, 저장 버튼을 누르면 daily 저장소로 들어간다.
- 3) 메뉴 경로는 그대로 두고, 내부에서 불러오는 파일만 바꿔서 안전하게 이관했다.

## 주의 사항
- 파트너 데이터의 가격 행(`prices`) 구조가 도메인별로 다를 수 있어 자동 단가 보정은 일부 케이스에서 0으로 남을 수 있다.
- `check:qa`는 현재 프로젝트의 기존 보안 부채가 해결되기 전까지 계속 실패할 수 있다.

## 향후 과정
- 다음 이관 대상인 `company-docs/src2/app/pages/register/RegisterOfficeDailyPage.tsx` 설계 시 이번 훅 패턴(얇은 페이지 + 훅 분리)을 그대로 재사용하면 속도가 오른다.
- `company-docs/src2/app/nav/navConfig.ts`의 나머지 SHADOW 경로(`/register/daily/office`, `/register/daily/production`, `/register/daily/action`)를 동일 패턴으로 순차 교체해야 한다.

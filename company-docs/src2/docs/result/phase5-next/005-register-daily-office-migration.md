# register/daily/office src2 이관

> 작성일: 2026-02-11
> 주제: SHADOW 실행 큐 2번(`/register/daily/office`)을 MIGRATED로 전환
> 이슈 상태: Open

---

## 변경 요약
- `/register/daily/office`를 src2 네이티브 페이지로 신규 구성했다.
- draft 저장은 `@kernel/draft`(`draft:daily:office`)를 사용하고, 실제 저장은 `@kernel/repo/createDailyRepo`로 통일했다.
- nav loader를 `@legacy`에서 `@app2`로 교체해 SHADOW 상태를 제거했다.

## 코드 변경
- 신규
  - `company-docs/src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `company-docs/src2/app/pages/register/hooks/useRegisterOfficePage.ts`
- 수정
  - `company-docs/src2/kernel/draft/draftKeys.ts`
    - `officeDaily: "draft:daily:office"` 추가
  - `company-docs/src2/app/nav/navConfig.ts`
    - `/register/daily/office` loader -> `@app2/pages/register/RegisterOfficeDailyPage`
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
    - office 항목 `MIGRATED` 반영
    - SHADOW 실행 큐 2번 체크 완료
    - 분포 수치 `MIGRATED 17 / SHADOW 9` 반영
  - `company-docs/src2/docs/roadmap/roadmap.md`
    - 분포 수치 `MIGRATED 17 / SHADOW 9` 반영

## 검증
- `npm.cmd run build`: 성공
- 별도 메모: `check:qa`는 이전 턴과 동일하게 기존 보안 부채 1건(`useExcelImportHubPage.ts` localStorage) 영향이 남아 있어, 이 턴에서는 build 게이트 중심으로 검증했다.

## 범위/판단 메모
- 현재 정책에 맞춰 browse는 보류하고 register/manage/excel 우선 이관을 유지했다.
- office 화면은 레거시 인라인 기관 등록 UI까지 1:1 복제하지 않고, 기존 등록된 기관 선택 + 추가 입력 기록 흐름 중심으로 먼저 이관했다.

## 다음 진행 제안
- SHADOW 실행 큐 3번 `/register/daily/production` 이관을 이어서 진행한다.
- office 화면의 인라인 기관 등록(레거시 `AgencyForm` 동작)은 필요성 확정 시 src2 기준으로 별도 보강한다.

## 핵심 로직 3줄
- 1) office 등록 draft를 `useDraft` + `draft:daily:office` 키로 고정해 입력 상태를 일관 관리했다.
- 2) 저장 시 `dailyRepo`에 `kind: "office"` 레코드를 upsert해 저장 경로를 kernel repo로 단일화했다.
- 3) nav loader를 src2 페이지로 교체해 `/register/daily/office` 경로의 SHADOW 의존을 제거했다.

## 입문자 설명 3줄
- 1) 사무기록 화면이 이제 새 구조(src2)로 동작하고, 작성 중 내용은 임시저장된다.
- 2) 저장 버튼을 누르면 공용 저장소(daily repo)에 사무기록이 들어간다.
- 3) 메뉴 경로는 그대로고 내부 파일만 바꿔서 안전하게 이관했다.

## 주의 사항
- 레거시의 인라인 기관 등록 폼 기능은 이번 이관에 포함하지 않아, 기관 신규 생성은 별도 등록 화면을 먼저 사용해야 한다.
- `check:qa`의 기존 보안 부채가 남아 있어 자동 게이트를 완전히 회복한 상태는 아니다.

## 향후 과정
- 다음 대상 `company-docs/src2/app/pages/register/RegisterProductionDailyPage.tsx` 이관 시에도 `얇은 페이지 + hooks 분리 + nav loader 교체` 패턴을 그대로 적용한다.
- 보안 게이트 정상화를 위해 `company-docs/src2/app/pages/excel/hooks/useExcelImportHubPage.ts`의 direct localStorage 제거를 별도 턴에서 처리해야 한다.

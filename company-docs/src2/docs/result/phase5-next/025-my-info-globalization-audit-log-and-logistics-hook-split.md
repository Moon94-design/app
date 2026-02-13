# 내 정보 공통화 + repo 감사로그 자동기록 + 유통 훅 기능 분리

> 작성일: 2026-02-13
> 주제: 파일 비대화 완화(유통 훅 분리), 내 정보 기반 일일 메타 고정, 페이지 누락 없는 내부 감사로그 기반 확보
> 해결 상태: Resolved

---

## 배경
- `useRegisterLogisticsPage.ts`가 커진 상태에서 기능 추가가 계속 붙으면 유지보수 리스크가 커진다.
- 상단에서 사용자(이름/직책/지부)를 한 번 설정하고 일일 페이지들이 동일 정보를 재사용해야 한다.
- 어떤 페이지가 해당 정보를 명시적으로 안 써도, 나중에 누가 등록/수정/삭제했는지 내부적으로 추적 가능한 기반이 필요하다.

## 이번 배치 변경
- 유통 훅 분리(파일 비대화 완화):
  - `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - `src2/app/pages/register/hooks/logistics/lineEdit.ts`
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - draft patch 계산/라인 수정·삭제 커맨드를 기능 파일로 분리하고 훅은 오케스트레이션 중심으로 정리.

- 하단 항목 리스트 레이아웃 압축:
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - 제목 아래로 세부정보를 바로 붙여 간격을 줄이고 카드 폭 체감을 축소.
  - 우측 수정/삭제 버튼 크기/배치는 유지.

- 내 정보 공통 SSOT 신설:
  - `src2/kernel/user/myInfo.ts`
  - `src2/kernel/user/index.ts`
  - `src2/kernel/repo/keys.ts` (`uiMyInfoProfile` 키 추가)
  - Shell 상단 `내 정보` 버튼/모달 추가:
    - `src2/app/shell/Shell.tsx`
    - `src2/app/shell/MyInfoModal.tsx`
    - `src2/app/shell/shell.css`

- 일일 등록 훅 공통 동기화:
  - `src2/app/pages/register/hooks/common/useActorProfileDraftSync.ts`
  - 적용 대상:
    - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
    - `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
    - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
    - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
    - `src2/app/pages/register/hooks/useRegisterActionPage.ts`
  - 내 정보가 있으면 `writerName/writerRole/site`를 자동 주입하고 잠금 상태(writerLocked)로 전달.

- 화면 잠금 반영:
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - 내 정보가 설정된 경우 지부/작성자/직책 필드를 잠금.

- 내부 감사로그 자동기록(공통):
  - `src2/kernel/repo/impl/repoAudit.ts`
  - `src2/kernel/repo/impl/localRepo.ts`
  - `src2/kernel/repo/keys.ts` (`repoAuditEventLogV1` 키 추가)
  - repo 공통 계층에서 create/update/delete 시 actor 정보(내 정보 또는 미설정 상태)와 요약 snapshot 자동 기록.

## 문서 동기화
- `src2/docs/reference/feature-files-map-unified.md` 갱신
- `src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`에 “파일 급증 시 기능 분리/공용화/파일맵 동기화” 항목 추가
- `src2/docs/rule/main_rule.md`에 “대형 단일 파일 증가 시 책임 분리 우선” 규칙 보강
- `src2/docs/rule/MIGRATION_STATUS.md`에 K 섹션 추가
- `src2/docs/rule/DECISIONS_LOG.md`에 관련 결정 2건 추가

## 검증
- `npm run check:qa` PASS
  - build PASS
  - smoke PASS
  - security PASS
  - p0 consistency PASS

## 간단 의견 + 다음 진행 질문
- 이번 배치로 “내 정보 기반 메타 고정”과 “페이지 누락 없는 감사로그”의 기본 골격은 잡혔다.
- 다음 배치에서 `repoAuditEventLogV1` 조회 화면(간단 필터/최근 100건)까지 같이 열어둘지 결정이 필요하다. 바로 붙일까?

## 핵심 로직 3줄
- 1) `useRegisterLogisticsPage`의 무거운 로직을 `draftUpdater/lineEdit` 기능 파일로 분리해 훅 책임을 축소했다.
- 2) Shell의 `내 정보`를 kernel SSOT로 저장하고, 일일 등록 훅 공통 동기화로 writer/site 메타를 자동 주입·잠금했다.
- 3) localRepo 공통 계층에서 create/update/delete를 가로채 actor 기반 감사 이벤트를 자동 저장하도록 고정했다.

## 입문자 설명 3줄
- 1) 큰 파일에 코드를 계속 붙이지 않고, 역할별 파일로 나눠서 관리하기 쉽게 바꿨다.
- 2) 이제 사용자 정보는 상단 `내 정보`에서 한 번만 설정하면 일일 페이지들이 자동으로 가져온다.
- 3) 저장/수정/삭제를 누가 했는지는 페이지마다 따로 코드를 안 넣어도 repo 공통층에서 자동 기록된다.

## 주의 사항
- `useActorProfileDraftSync`는 현재 “내 정보가 있으면 draft 메타를 맞춘다” 정책이라, 과거 데이터 편집 시 다른 작성자로 임시 수정하려는 요구가 생기면 정책 분기(잠금 해제 모드)가 추가로 필요할 수 있다.

## 향후 과정
- 감사로그 조회 UI(최근 내역/액션 필터/도메인 필터)를 `manage` 트랙에 붙여 실제 운영 점검 루프를 닫는다.
- 일일 외 페이지(예: 기준정보 등록/수정)에서 표시되는 작성자 정보도 감사로그 이벤트와 연결해 운영 추적성을 보강한다.

## 해결 상태
- `Resolved`: 유통 훅 분리 + 내 정보 공통화 + repo 감사로그 자동기록 + 체크리스트/파일맵/상태 문서 동기화 완료.

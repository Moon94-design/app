# register/daily 운영 전환 (분해 중단 + 결과 파일 분리 정책)

> 작성일: 2026-02-12
> 주제: production/office 훅 분해 완료 후, 추가 분해 중단 및 결과 문서 운영 방식 전환
> 이슈 상태: Open

---

## 작업 요약
- `useRegisterProductionPage.ts`, `useRegisterOfficePage.ts` 분해를 완료하고 빌드/린트를 통과했다.
- 사용자 요청에 따라 "추가 분해 작업"은 일단 중단하고, 다음 작업은 기능 안정화/회귀 점검 중심으로 전환한다.
- 결과 문서는 `008`에 누적하지 않고, 이번 턴부터 `009`부터 번호를 올려 분리 기록한다.

## 변경 파일
- `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
- `src2/app/pages/register/hooks/production/constants.ts`
- `src2/app/pages/register/hooks/production/selectors.ts`
- `src2/app/pages/register/hooks/production/commands.ts`
- `src2/app/pages/register/hooks/production/types.ts`
- `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
- `src2/app/pages/register/hooks/office/constants.ts`
- `src2/app/pages/register/hooks/office/selectors.ts`
- `src2/app/pages/register/hooks/office/commands.ts`
- `src2/app/pages/register/hooks/office/types.ts`
- `src2/docs/reference/feature-files-map-unified.md`
- `src2/docs/reference/register-daily-files.md`

## 검증
- `npm.cmd run build`: PASS
- `npm.cmd run lint:src2`: PASS

## 운영 결정
- 결과 파일 정책: `phase5-next`는 `009`부터 신규 작업 단위로 번호를 증가시켜 기록한다.
- 작업 방향: 당분간 구조 분해보다 기능 동작 정합성(저장/추천/연계/문구) 점검 우선.

## 다음 진행 질문
- 다음 턴을 `register/daily/logistics` 기능 회귀 점검(저장/추천/이슈-조치 연계)으로 바로 시작할까?

## 핵심 로직 3줄
- 1) 생산 훅의 저장/태그 파생/상수 책임을 `hooks/production/*`로 분리했다.
- 2) 사무 훅의 기관 매핑/추가 항목 조립/저장 책임을 `hooks/office/*`로 분리했다.
- 3) 분해 완료 후 결과 기록 체계를 `009`부터 작업 단위 파일로 전환했다.

## 입문자 설명 3줄
- 1) 긴 훅을 역할별 파일로 나눠서 읽기 쉽고 수정하기 쉽게 만들었다.
- 2) 이제부터는 문서도 한 파일에 계속 붙이지 않고, 작업마다 새 번호 파일에 남긴다.
- 3) 다음 작업은 구조 바꾸기보다 실제 동작이 맞는지 점검하는 데 집중한다.

## 주의 사항
- 분해를 멈췄지만, logistics 훅은 여전히 상대적으로 길어 요구사항 누적 시 다시 비대화될 수 있다.
- 기능 안정화 단계에서 회귀 체크를 생략하면 저장/연계 흐름에서 운영 이슈가 발생할 수 있다.
- 결과 파일을 번호 분리로 전환했으므로, 다음 턴에서 번호 중복 생성 실수에 주의해야 한다.

## 향후 과정
- 다음 턴에서 `register/daily/logistics` 저장/추천/이슈-조치 연계를 실제 시나리오로 점검한다.
- 점검 결과를 `010-*.md`로 분리 기록한다.
- 필요한 경우에만 최소 범위 수정하고, 구조 분해는 보류한다.

## 이슈 상태
- `Open`: 분해 작업은 일단 중단, 기능 안정화 단계로 전환.

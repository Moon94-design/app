# 유통 일지 제목 괄호 제거 + 이슈/조치 메타 고정 잠금

> 작성일: 2026-02-13
> 주제: 유통 일지 연계 이슈/조치 등록에서 메타 불일치 방지와 제목 노이즈 제거
> 해결 상태: Resolved

---

## 배경
- 유통 일지 제목에 `(작성자)(직책)` 같은 라벨 괄호가 섞여 보이는 문제가 있었다.
- 유통 화면에서 여는 이슈/조치 모달은 폼 재사용 구조라서, 기록일/지부/작성자/직책이 유통 일지 작성 맥락과 어긋날 여지가 있었다.
- 이번 배치 목표는 "UI 잠금 + submit 강제"를 같이 적용해 정합성을 코드 레벨에서 고정하는 것이다.

## 이번 배치 변경
- 제목 정리:
  - `src2/kernel/schema/daily/titleTemplates.ts`
  - writer 토큰 정규화(`sanitizeWriterToken`)를 추가해서 `(작성자)`, `(직책)`, `(이름)` 라벨 괄호를 제거했다.
  - 유통/이슈/조치 일일 제목 템플릿에 동일하게 적용했다.

- 메타 필드 잠금 확장:
  - `src2/kernel/components/record/DailyMetaFields.tsx`
  - `lockSite`, `lockWriterRole` 옵션을 추가해서 지부/직책도 read-only 잠금이 가능하게 했다.
  - `src2/app/pages/register/components/IssueRegisterForm.tsx`
  - `src2/app/pages/register/components/ActionRegisterForm.tsx`
  - 두 폼이 새 잠금 옵션을 그대로 전달하도록 연결했다.

- 유통 모달 고정 적용:
  - `src2/app/pages/register/sections/logistics/IssueActionModal.tsx`
  - 이슈/조치 폼에 기록일/지부/작성자/직책 4개를 모두 잠금으로 고정했다.

- submit 레벨 강제(하드 가드):
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
  - `src2/app/pages/register/hooks/action/types.ts`
  - `src2/app/pages/register/hooks/action/commands.ts`
  - `enforceRecordDate/enforceSite/enforceWriterName/enforceWriterRole` 옵션을 사용해, submit 시점에도 유통 일지 메타를 우선 적용하도록 강제했다.
  - 문서 ID 생성과 저장 필드도 enforced 값을 기준으로 사용하도록 맞췄다.

- 유통 페이지 연결:
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - 모달에서 issue/action submit 호출 시 유통 draft 메타를 enforce 옵션으로 전달한다.
  - 이슈 완료 후 조치 프리셋도 issue draft가 아니라 유통 draft 기준으로 다시 고정한다.

- 회귀 테스트 보강:
  - `scripts/p0-consistency-regression.ts`
  - 유통 제목 템플릿에서 writer 라벨 괄호 제거 케이스를 추가했다.

## 검증
- 실행: `npm run check:qa`
- 결과: PASS
  - build PASS
  - smoke PASS
  - security PASS
  - p0 consistency PASS(제목 괄호 제거 케이스 포함)

## 간단 의견 + 다음 진행 질문
- 이번 수정은 "폼 잠금만"이 아니라 "저장 강제"까지 묶어서, 유통 리뉴얼 미완 상태에서도 메타 드리프트 리스크를 실질적으로 차단했다.
- 다음 배치에서 유통 D1 마감 회귀를 먼저 할지, 유통 제외 일일 4페이지 리뉴얼(office/production/issue/action)을 바로 시작할지 우선순위만 정하면 된다.

## 핵심 로직 3줄
- 1) 제목 템플릿에서 writer/role 토큰의 라벨 괄호를 제거해 출력 문자열 노이즈를 없앴다.
- 2) 유통 모달의 메타 4필드를 UI에서 잠그고, submit 옵션으로 동일 값을 강제해 저장 시점까지 정합성을 유지했다.
- 3) 회귀 스크립트에 제목 정규화 케이스를 추가해 같은 문제가 다시 들어오는 것을 자동 차단했다.

## 입문자 설명 3줄
- 1) 화면에서 못 바꾸게 막아도, 저장 코드가 열려 있으면 데이터는 틀어질 수 있어서 둘 다 막았다.
- 2) 유통 화면에서 시작한 이슈/조치는 유통 기록의 날짜/지부/작성자/직책을 그대로 쓰게 고정했다.
- 3) 제목에 붙어 있던 `(작성자)`, `(직책)` 같은 글자는 저장 전에 자동으로 지워지게 했다.

## 주의 사항
- DailyMetaFields 잠금 옵션을 다른 페이지에서 재사용할 때, 잠금만 적용하고 submit 강제 옵션을 빼면 다시 메타 드리프트가 생길 수 있다. "UI 잠금 + submit 강제"를 세트로 유지해야 한다.

## 향후 과정
- 유통 D1 마감 배치에서 `src2/app/pages/register/hooks/logistics/submitCommand.ts` 기준 조회/관리 시나리오를 점검하고, 필요 시 `test:p0:consistency`에 "유통 모달 메타 강제 저장" 케이스를 추가한다.
- 이후 일일 4페이지 리뉴얼 시 동일 패턴(메타 잠금 + submit enforce + 회귀 테스트)을 공통 체크리스트 항목으로 복제한다.

## 해결 상태
- `Resolved`: 유통 연계 이슈/조치 메타 고정 및 제목 괄호 정리 반영 완료, QA 게이트 통과.

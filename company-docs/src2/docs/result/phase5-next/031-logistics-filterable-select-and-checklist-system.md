# 유통 선택 포함검색 + 체크리스트 체계 개편

> 작성일: 2026-02-13
> 주제: 유통 등록의 거래처/차량 선택 UX 개선(포함검색)과 체크리스트 운영 구조(원본/작성본 분리) 도입
> 해결 상태: Resolved

---

## 작업 배경
- 유통 등록에서 거래처/차량이 전체 목록 선택 방식이라 입력 속도가 느렸다.
- 단일 칸에서 타이핑하고 바로 하단 자동추천 목록을 선택하는 흐름이 필요했다.
- 동시에, 반복 리뉴얼에서 재작업을 줄이기 위해 BASIC 중심 체크리스트 체계를 확정하고 작성본 저장 폴더를 분리할 필요가 있었다.

## 변경 내용
- 선택 검색 공용 컴포넌트 추가
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx`
  - 단일 자동완성 입력 + 하단 목록 선택 구조 적용
  - 포함검색(대소문자 무시)으로 옵션 축소, 빈 입력 상태에서 목록 열기 시 전체 옵션 노출
  - 검색어는 저장하지 않고, 목록 선택 시에만 값 반영
- 유통 등록에 적용
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - 거래처/차량 선택을 `FilterableSelect`로 교체
- 체크리스트 구조 개편
  - BASIC 상단에 추가 체크리스트 목차/경로 고정
    - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - 공용화 강제 문구 고정
    - "이번 작업 수정사항 중 공용화 가능한 항목은 원본 체크리스트에 즉시 반영하고, 반영 사실과 참조 경로를 채팅/결과 문서에 명시한다."
  - 작업별 원본 체크리스트 폴더 신설
    - `src2/docs/rule/checklist/README.md`
    - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - 체크리스트 작성본 폴더 신설
    - `src2/docs/rule/checklist-result/README.md`
    - `src2/docs/rule/checklist-result/basic/2026-02-13-logistics-filter-select.md`
    - `src2/docs/rule/checklist-result/logistics-daily-renewal/2026-02-13-logistics-filter-select.md`
  - 페이지 리뉴얼 체크리스트 결과 저장 경로 규칙 갱신
    - `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- 문서 맵 반영
  - `src2/docs/reference/feature-files-map-unified.md`

## 검증
- `cmd /c npm run build` PASS

## 추가 반영 (2026-02-13, 동일 배치 후속)
- `FilterableSelect`를 2칸(입력+select) 구조에서 단일 자동완성 필드로 변경했다.
- 입력이 비어 있을 때 목록 열기 버튼으로 전체 옵션을 노출하고, 값 확정은 목록 선택으로만 처리한다.
- 체크리스트 원본에 "공용화 가능한 수정사항 즉시 승격" 고정 문구와 선택 UI 패턴 항목을 반영했다.
- 체크리스트 범위를 유통 전용에서 "모든 일일 페이지 공용"으로 승격했다.
  - 신규 SSOT: `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - 기존 유통 파일: deprecated 안내 문서로 전환
- 후속 검증:
  - `cmd /c npm run build` PASS

## 간단 의견 + 다음 진행 질문
- 이번 배치로 선택 UX 속도와 체크리스트 실행 일관성이 같이 올라갔다.
- 다음은 동일 `FilterableSelect`를 issue/action/office 등 다른 선택 UI에도 확장할지 결정하면 된다. 바로 확장할까?

## 핵심 로직 3줄
- 1) 단일 입력 필드에서 검색과 목록 선택을 처리하고, 값 확정은 목록 선택에서만 수행했다.
- 2) 필터 기준은 prefix가 아니라 includes(포함검색)로 고정했고, 빈 입력 시 전체 목록을 노출했다.
- 3) 체크리스트는 원본(`rule/checklist`)과 작성본(`rule/checklist-result`)을 분리해 반복 작업에서 재사용성을 높였다.

## 입문자 설명 3줄
- 1) 글자를 입력하면 목록이 줄어들지만, 저장은 목록에서 고른 값만 돼.
- 2) 그래서 오타로 새 값이 들어가거나 이상한 값이 저장되지 않아.
- 3) 체크리스트도 "규칙 문서"와 "이번 작업 체크 결과"를 따로 보관해서 다음 작업이 빨라져.

## 주의 사항
- `FilterableSelect`는 현재 유통 등록에만 적용됐다. 다른 페이지에 확장할 때 선택 id/label 매핑 규칙이 페이지별로 다르면 별도 어댑터가 필요할 수 있다.
- 체크리스트 결과 문서는 형식을 단순화했기 때문에, 장문 회고를 넣기 시작하면 다시 운영 부담이 커질 수 있다.

## 향후 과정
- 동일 선택 패턴이 있는 페이지(issue/action/office/production)의 select를 `FilterableSelect`로 단계적 교체한다.
- 체크리스트 신규 항목이 생기면 `BASIC_EXECUTION_CHECKLIST.md`의 "추가 작업 체크리스트 목차"에 경로를 즉시 추가한다.

## 해결 상태
- `Resolved`: 유통 등록 선택 포함검색 적용, 체크리스트 원본/작성본 분리 구조 도입, 문서 동기화 완료.

---

## 추가 업데이트 (2026-02-16, 동일 주제 후속)
- 요청사항:
  - 입고+스크랩에서 세부품목 기본 선택지와 기타 입력값이 섞여 보이는 문제를 분리
  - 기타 입력값은 기타 전용 드롭다운에서만 선택하도록 고정
- 코드 반영:
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - `src2/app/pages/register/sections/logistics/LogisticsTypeFields.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsFormSection.tsx`
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
- 핵심 변경:
  - 세부품목 버튼은 기본 선택지 전용으로 유지
  - 기타 등록값은 `customScrapDetailOptions`로 분리해 기타 드롭다운에서만 노출
  - 기타는 단일 모드로 동작(기본 버튼 선택과 동시 활성 금지)
  - 기타 입력창에 포함검색 추천 목록을 붙이고, 직접입력 `등록/적용`을 유지
- 문서 반영:
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - `src2/docs/rule/checklist-result/daily-renewal-commonization/2026-02-16-logistics-scrap-etc-dropdown.md`
  - `src2/docs/rule/DECISIONS_LOG.md`
  - `src2/docs/rule/MIGRATION_STATUS.md`
  - `src2/docs/reference/feature-files-map-unified.md`
- 검증:
  - `npm.cmd run build` PASS
  - `npm.cmd run check:qa` PASS

## 간단 의견 + 다음 진행 질문
- 유통 도메인의 "기본 선택지 vs 기타 입력값" 경계가 분리돼서 오입력 해석 충돌이 줄어들었다.
- 같은 패턴이 필요한 선택 필드(office/issue/action)에도 기타 전용 드롭다운 규칙을 확장할까?

## 핵심 로직 3줄
- 1) 입고+스크랩 세부품목은 기본 버튼 목록과 기타 입력 후보 목록을 데이터 레벨에서 분리했다.
- 2) 기타 입력 후보는 포함검색 드롭다운에서만 선택되게 하고, 기본 버튼 목록에는 병합하지 않았다.
- 3) 기타 모드는 단일 선택 상태로 고정해 기본 버튼과 동시 활성화되지 않게 했다.

## 입문자 설명 3줄
- 1) 이제 세부품목 버튼에는 기본 항목만 보여서 헷갈림이 줄어들어.
- 2) 기타로 직접 등록한 이름은 기타 전용 목록에서만 다시 고를 수 있어.
- 3) 입력창에 글자를 치면 아래 추천이 줄어들고, 없으면 바로 새 값으로 등록할 수 있어.

## 주의 사항
- 기존 데이터에 기본 항목과 같은 텍스트가 기타로 저장돼 있으면, 이번 분리 규칙에서 기본 버튼 우선으로 보일 수 있다.
- 기타 후보 추천은 최근 데이터 기반이므로, 저장 전 임시 입력값은 드롭다운 후보에 즉시 누적되지 않는다.

## 향후 과정
- `register/daily/office`, `register/daily/issue`, `register/daily/action`의 기타/직접입력 필드에도 동일한 "기본 선택지와 기타 후보 분리" 규칙 적용 여부를 점검한다.
- 선택 규칙 확장 시 공용 체크리스트 원본(`daily-renewal-commonization-checklist.md`)을 기준으로 체크리스트 작성본을 함께 갱신한다.

## 해결 상태
- `Resolved`: 유통 입고+스크랩 세부품목/기타 분리, 기타 전용 추천 드롭다운/직접입력 적용, 문서/게이트 동기화 완료.

---

## 추가 업데이트 (2026-02-16, 같은 주제 후속 2)
- 요청사항:
  - 사용자 노출 문구에서 반말 금지(존댓말 통일)
  - 배치 마지막 `build/smoke/qa` 검증 시간을 줄이기 위한 최소 실행 경로 정리
- 코드 반영:
  - `src2/app/pages/register/sections/logistics/LogisticsTypeFields.tsx`
  - `src2/app/pages/register/sections/logistics/ReturnSourcePanel.tsx`
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
  - `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `package.json`
- 핵심 변경:
  - 반말 문구를 모두 존댓말로 수정(안내/빈상태/경고/confirm 포함)
  - `test:smoke:routes` 추가: 기존 build 산출물만 사용해 라우트 smoke 실행
  - `check:qa:reuse-build` 추가: `smoke:routes + security + p0 consistency`만 실행
  - `test:smoke`는 `build + smoke:routes`로 재구성해 full/reuse 경로를 분리
- 체크리스트 반영:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/GATES_CHECKLIST.md`
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
- 문서 동기화:
  - `src2/docs/rule/main_rule.md`
  - `src2/docs/rule/DECISIONS_LOG.md`
  - `src2/docs/rule/MIGRATION_STATUS.md`
  - 체크리스트 작성본 2건 갱신
- 최종 실행 가이드(시간 최적화):
  - full 필요: `npm run check:qa` (내부에서 build 포함)
  - 같은 배치에서 이미 build 수행 후 재검증: `npm run check:qa:reuse-build`
  - smoke만 재확인: `npm run test:smoke:routes`

## 간단 의견 + 다음 진행 질문
- 이제 문구 톤과 배치 검증 경로가 같이 고정되어, UX 일관성과 실행 시간이 동시에 안정화되었습니다.
- 다음 배치부터는 L2 검증에서 `build`를 이미 통과한 경우 `check:qa:reuse-build`를 기본으로 사용할까요?

## 핵심 로직 3줄
- 1) 사용자 노출 문자열을 존댓말로 통일해 반말 문구를 제거했습니다.
- 2) QA 스크립트를 full(build 포함)와 reuse-build(build 재사용)로 분리했습니다.
- 3) BASIC/TASK/GATES/일일 공용 체크리스트에 최소 실행 규칙을 추가해 중복 검증을 차단했습니다.

## 입문자 설명 3줄
- 1) 화면 문구를 전부 공손한 표현으로 맞춰 사용자가 혼란스럽지 않게 했습니다.
- 2) 이미 빌드한 뒤에는 다시 빌드하지 않고 QA만 빠르게 돌릴 수 있게 만들었습니다.
- 3) 체크리스트에 그 규칙을 적어두어서 다음 작업에서도 같은 방식으로 실행할 수 있습니다.

## 주의 사항
- `check:qa:reuse-build`는 같은 배치에서 `build`가 이미 성공한 상태를 전제로 사용해야 합니다.
- 문구 톤 검수는 자동화가 아직 없어, 신규 문구 추가 시 사람이 체크리스트 항목으로 계속 확인해야 합니다.

## 향후 과정
- 반말 금지 규칙을 다른 도메인(office/issue/action/manage 전체)에도 일괄 점검해 잔여 문구를 제거합니다.
- CI 도입 시 `build -> check:qa:reuse-build` 파이프라인을 기본 템플릿으로 고정해 배치 시간을 더 줄입니다.

## 해결 상태
- `Resolved`: 반말 문구 제거, QA/smoke/build 최소 실행 경로 도입, 체크리스트 동기화 완료.

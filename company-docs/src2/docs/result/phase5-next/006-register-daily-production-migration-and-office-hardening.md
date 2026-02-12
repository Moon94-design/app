# register/daily/production src2 이관 + office 보강 + 생산 품질 보강

> 작성일: 2026-02-12
> 주제: `/register/daily/production` 이관 품질 보강(작성자 충돌 방지, 자동 제목, 공용 태그/제목 컴포넌트화)
> 이슈 상태: Resolved

---

## 변경 요약
- 기존 006 작업(생산 이관 + office 보강)을 유지하면서, 운영 리스크였던 생산 저장 품질 문제를 추가로 보강했다.
- 핵심 보강 포인트는 아래 3개다.
  - `writerName` 필수 검증 추가로 문서 ID 충돌 위험 제거
  - 이름/직책 입력 시 제목 자동 반영(`AutoTitleField`) 적용
  - src 태그 기능을 공용 컴포넌트로 분리(`TagBlock`, `TagInputText`)해 이후 페이지 재사용 가능하게 정리

## 이번에 반영된 파일
- 생산 페이지/훅
  - `company-docs/src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `company-docs/src2/app/pages/register/hooks/useRegisterProductionPage.ts`
- 공용 컴포넌트(재사용 기반)
  - `company-docs/src2/kernel/components/record/AutoTitleField.tsx`
  - `company-docs/src2/kernel/components/record/index.ts`
  - `company-docs/src2/kernel/components/tag/TagInputText.tsx`
  - `company-docs/src2/kernel/components/tag/TagBlock.tsx`
  - `company-docs/src2/kernel/components/tag/index.ts`
  - `company-docs/src2/kernel/components/index.ts`
- 태그 인덱스 유틸/키
  - `company-docs/src2/kernel/utils/tagIndex.ts`
  - `company-docs/src2/kernel/utils/index.ts`
  - `company-docs/src2/kernel/repo/keys.ts`
- 스키마
  - `company-docs/src2/kernel/schema/daily/productionTypes.ts`
  - `company-docs/src2/kernel/schema/daily/index.ts`

## 기능 관점 판정
- 방향성: 맞음
- 안정성: 이전 대비 개선됨
- parity: **100%라고 보긴 어렵다**
  - 이유: 레거시 생산 화면의 이슈 패널/엑셀 패널까지 이번 src2 페이지에 완전 복제한 범위는 아님
  - 현재 상태는 “핵심 등록 플로우 + 데이터 안정성 + 공용화” 중심

## 검증
- `npm.cmd run build`: 성공
- `npm.cmd run check:qa`: 실패(기존 보안 부채 1건 유지)
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts` localStorage 직접 접근

## 다음 큐 가이드
- 다음 순차 이관 대상은 계획대로 `register/daily/action`.
- action 이관 시 이번에 만든 공용 블록을 우선 적용하면 중복 구현을 줄일 수 있음.

## 핵심 로직 3줄
- 1) 생산 저장 전에 `writerName`, `recordDate`, `lines`를 필수 검증해서 빈 작성자 저장을 차단했다.
- 2) 제목은 `AutoTitleField`가 `기록일 + 이름 + 직책 + suffix` 규칙으로 자동 작성하고, 수동 수정도 가능하게 유지했다.
- 3) 태그 입력/추천/개인태그 관리를 `TagBlock` + `TagInputText` + `tagIndex` 유틸로 분리해 다른 페이지가 그대로 재사용 가능해졌다.

## 입문자 설명 3줄
- 1) 이제 작성자 없이 저장하면 막아서 같은 문서가 덮어써지는 문제가 줄어든다.
- 2) 이름이랑 직책을 쓰면 제목이 자동으로 채워져서 입력 실수가 줄어든다.
- 3) 태그 기능을 공용으로 빼놔서 다음 페이지에서도 복붙이 아니라 같은 부품을 연결하면 된다.

## 주의 사항
- 공용 태그 기능을 붙일 때 scope 문자열(`production`, `issue`, `action` 등)을 페이지마다 일관되게 안 맞추면 추천 품질이 분산될 수 있다.
- 자동 제목은 사용자가 수동 수정한 뒤에는 자동 갱신을 멈추도록 설계되어 있어서, 의도와 다르면 UX 정책을 먼저 합의해야 한다.
- 이번 턴은 생산 등록 핵심 안정화가 목적이라, 레거시의 부가 패널까지 parity 100%로 오해하면 안 된다.

## 향후 과정
- 다음 `register/daily/action` 이관 시 `AutoTitleField`/`TagBlock`을 우선 적용해 패턴을 통일한다.
- action 이관 후에는 register/day 계열에서 공통 검증 규칙(작성자/제목/태그) 템플릿화를 한 번 더 진행한다.
- browse/manage 이관에 들어가기 전, register 계열의 저장 스키마 필드 합치 여부를 먼저 점검해 회귀 비용을 줄인다.

## 이슈 상태
- `Resolved`: 생산 저장 리스크(작성자 공백 충돌)와 공용화 요구(제목 자동입력, 태그 기능 분리)는 이번 턴에서 반영 완료.


---

## 2026-02-12 추가 보정 (태그 자동추천)
- 증상: 기준정보/개인태그 자동추천이 상황에 따라 비거나 색상(source) 분류가 기대와 다르게 보이는 문제.
- 조치:
  - `TagBlock`에서 전달 후보와 기본 후보를 병합하도록 변경(기존은 전달 후보로 완전 대체).
  - 동일 태그가 중복될 때 `system` 소스를 우선 유지하도록 변경(기준태그 파란색 유지).
  - 생산 훅의 기준정보 태그 추출을 `base.*` 중첩 필드까지 읽도록 보강.
- 결과: 내용 입력 기반 자동추천에서 기준정보(파랑)/개인태그(회색) 분류가 다시 작동.

## 2026-02-12 추가 보정 2 (A -> Aa 추천 소거 방지)
- 증상: 태그 추천에서 `A` 입력 시 보이던 후보가 `Aa`로 확장하면 바로 사라지는 케이스.
- 조치:
  - `src2/kernel/components/tag/TagBlock.tsx`
    - 추천 점수 계산에 `query contains tag` 보조 매칭 추가.
  - `src2/kernel/utils/tagIndex.ts`
    - 입력창 추천(`getSuggestions`)에도 동일한 보조 랭크(`b.includes(a)`) 추가.
- 결과: 입력어가 길어져도 후보가 갑자기 0개로 끊기는 현상을 완화.

## 2026-02-12 추가 보정 3 (추천 유지 + 실시간 반영 + 칩 UI)
- 요청 반영:
  - 띄어쓰기 후 다른 단어를 써도 추천이 유지되도록 수정
  - 개인태그 추가 시 새로고침 없이 추천 목록 즉시 갱신
  - 등록된 태그 칩이 두 줄로 꺾이지 않도록 한 줄 형태로 수정
- 변경:
  - `src2/kernel/components/tag/TagBlock.tsx`
    - 마지막 토큰 1개 기반에서 내용 전체 토큰(최근 12개) 병합 추천으로 변경
    - 태그 인덱스 업데이트 이벤트를 구독해 기본 후보(system/personal) 즉시 재계산
  - `src2/kernel/components/tag/TagInputText.tsx`
    - 인덱스 업데이트 이벤트 구독 추가(추천/색상 즉시 반영)
    - 태그 칩 스타일을 `inline-flex + nowrap`로 변경해 줄바꿈 방지
  - `src2/kernel/utils/tagIndex.ts`
    - 인덱스 저장 시 `tag-index-updated` 이벤트 발행
- 결과:
  - 추천이 문장 입력 중 더 안정적으로 유지되고,
  - 개인태그를 추가하면 새로고침 없이 추천/표시가 바로 갱신됨.

## 2026-02-12 추가 보정 4 (태그 컴포넌트 분리 리팩터링)
- 목적: 태그 파일 길이/책임 분리(`TagBlock`, `TagInputText`)
- 분리 내용:
  - 신규 훅
    - `src2/kernel/components/tag/hooks/useTagBlockSuggestions.ts`
    - 추천 후보 병합, 토큰 추출, 점수 계산, dismiss/showAll, 인덱스 이벤트 구독 분리
  - 신규 컴포넌트
    - `src2/kernel/components/tag/TagChips.tsx`
    - `src2/kernel/components/tag/PersonalTagManager.tsx`
  - 기존 파일 경량화
    - `TagBlock.tsx`: 264 -> 138 라인
    - `TagInputText.tsx`: 329 -> 210 라인
- 효과:
  - UI/상태/추천로직 책임이 나뉘어 이후 기능 추가 시 변경 영향 범위가 줄어듦.

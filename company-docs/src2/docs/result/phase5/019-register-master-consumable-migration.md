# 기준등록 소모품 페이지 이관 (/register/master/consumable)

> 작성일: 2026-02-10
> 주제: 소모품 이관 플랜 고정 후 Factory 방식으로 src2 이관 실행

---

## 이관 플랜(사전 정리)
- 레거시 `RegisterConsumable`의 동작을 1:1 유지한다.
- 페이지는 얇게 유지하고 폼/목록을 sections로 분리한다.
- 저장 경로는 `@kernel` domain repo만 사용한다.
- Draft 키는 `draft:` prefix 규칙을 따르는 전용 키를 추가한다.
- 설비(equipment)와 소모품(consumable) 연동(`consumableIds`) 정합을 유지한다.

## 변경 요약
- `/register/master/consumable` loader를 `@legacy` -> `@app2`로 교체.
- 페이지를 얇은 조립 구조로 만들고 폼/목록을 sections로 분리.
- consumable 도메인 draft/schema 정본 세트를 kernel에 추가.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/consumable` -> `@app2/pages/consumable/ConsumableRegisterPage`

- page:
  - `src2/app/pages/consumable/ConsumableRegisterPage.tsx`
  - `src2/app/pages/consumable/hooks/useConsumableRegisterPage.ts`
  - `src2/app/pages/consumable/sections/ConsumableFormSection.tsx`
  - `src2/app/pages/consumable/sections/ConsumableRecentList.tsx`

- kernel:
  - `src2/kernel/schema/consumable/consumableTypes.ts`
  - `src2/kernel/schema/consumable/index.ts`
  - `src2/kernel/schema/index.ts` (consumable export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`consumableRegister: draft:consumable:register` 추가)

## 문서/상태 갱신
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/consumable` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-consumable.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- URL 직접입력/재요청(새로고침 대체) 200 확인:
  - `/register/master/consumable`

다음 질문: 기준등록 마스터 라인 이관이 끝났으니, 다음은 `/manage/master` 추가 분리(섹션/훅)로 진행할까?

# 기준등록 설비 페이지 이관 (/register/master/equipment)

> 작성일: 2026-02-09
> 주제: Factory 방식으로 기준등록 equipment 페이지를 src2로 이관

---

## 변경 요약
- `/register/master/equipment` loader를 `@legacy` -> `@app2`로 교체.
- 페이지를 얇은 조립 구조로 만들고 폼/소모품 추가/목록을 sections로 분리.
- equipment 도메인 정본 세트(schema/repo/draft key)를 kernel에 추가.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/equipment` -> `@app2/pages/equipment/EquipmentRegisterPage`

- page:
  - `src2/app/pages/equipment/EquipmentRegisterPage.tsx`
  - `src2/app/pages/equipment/hooks/useEquipmentRegisterPage.ts`
  - `src2/app/pages/equipment/sections/EquipmentFormSection.tsx`
  - `src2/app/pages/equipment/sections/EquipmentConsumableSection.tsx`
  - `src2/app/pages/equipment/sections/EquipmentRecentList.tsx`

- kernel:
  - `src2/kernel/schema/equipment/equipmentTypes.ts`
  - `src2/kernel/schema/equipment/index.ts`
  - `src2/kernel/schema/index.ts` (equipment export 추가)
  - `src2/kernel/repo/domain/equipmentRepo.ts`
  - `src2/kernel/repo/domain/consumableRepo.ts`
  - `src2/kernel/repo/keys.ts` (`equipment`, `consumable` 레거시 키 호환 추가)
  - `src2/kernel/repo/index.ts` (equipment/consumable repo export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`equipmentRegister: draft:equipment:register` 추가)

## 문서/상태 갱신
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/equipment` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-equipment.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- URL 직접입력/재요청(새로고침 대체) 200 확인:
  - `/register/master/equipment`

다음 질문: 기준등록 다음 타깃을 `/register/master/consumable`로 이어갈까?

# 기준등록 직원 페이지 이관 (/register/master/employee)

> 작성일: 2026-02-09
> 주제: Factory 방식으로 기준등록 employee 페이지를 src2로 이관

---

## 변경 요약
- `/register/master/employee` loader를 `@legacy` -> `@app2`로 교체.
- 페이지를 얇은 조립 구조로 만들고 폼/목록을 sections로 분리.
- employee 도메인 정본 세트(schema/repo/draft key)를 kernel에 추가.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/employee` -> `@app2/pages/employee/EmployeeRegisterPage`

- page:
  - `src2/app/pages/employee/EmployeeRegisterPage.tsx`
  - `src2/app/pages/employee/hooks/useEmployeeRegisterPage.ts`
  - `src2/app/pages/employee/sections/EmployeeFormSection.tsx`
  - `src2/app/pages/employee/sections/EmployeeRecentList.tsx`

- kernel:
  - `src2/kernel/schema/employee/employeeTypes.ts`
  - `src2/kernel/schema/employee/index.ts`
  - `src2/kernel/schema/index.ts` (employee export 추가)
  - `src2/kernel/repo/domain/employeeRepo.ts`
  - `src2/kernel/repo/keys.ts` (`employee: local_employees_v1` 추가, 레거시 키 호환 유지)
  - `src2/kernel/repo/index.ts` (employee repo export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`employeeRegister: draft:employee:register` 추가)

## 문서/상태 갱신
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/employee` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-employee.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- URL 직접입력/재요청(새로고침 대체) 200 확인:
  - `/register/master/employee`

다음 질문: 기준등록 다음 타깃을 `/register/master/equipment`로 이어갈까?

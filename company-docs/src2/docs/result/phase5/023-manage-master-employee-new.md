# 기준정보 관리 employee 신규 구현 (/manage/master)

> 작성일: 2026-02-10
> 주제: src2 기준으로 직원 관리 페이지를 신규 구현하고 manage master에 연결

---

## 변경 요약
- `src`에 직원 관리 페이지가 없는 전제로 `ManageEmployeePage`를 신규 구현.
- page/hooks/sections 구조로 분리해 수정/확장 가능한 형태로 정리.
- `ManageMasterPage`에서 employee 메뉴를 활성화해 바로 진입 가능하게 연결.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageEmployeePage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageEmployeePage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageEmployeeListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageEmployeeEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `MasterMenu`에 `employee` 추가
    - employee 카드 클릭 활성화(추후 구현 예정 -> 실제 연결)

## kernel 연결
- `createEmployeeRepo`를 통해 조회/저장/삭제 수행
- `@kernel/schema/employee` 타입 사용
- 연락처는 `formatPhoneInput`으로 입력 정규화

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-employee.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `partner/vehicle/employee 완료, equipment 후속`으로 갱신

## 게이트 확인
- `npm run build` 성공

## 다음 단계
- `/manage/master` equipment 관리 신규 구현
- `/manage/daily` 생산/이슈·조치 상세 이관

다음 질문: 바로 `/manage/master/equipment` 신규 구현으로 이어갈까?

---

## 추가 작업 (공통 뼈대 선반영, 적용은 보류)
- 목적: 이관 속도 유지하면서 manage 공통 UI 표준을 먼저 고정.
- 원칙: 기존 페이지(`partner/vehicle/employee/logistics`)에는 즉시 적용하지 않고, 이후 이관 페이지부터 사용.

### 추가된 공통 자원
- `src2/kernel/components/manage/ManageInfoNotice.tsx` (신규)
  - 안내 문구 공통 컴포넌트
  - `신규 등록`, `엑셀 일괄 등록` 등 항목을 props로 주입
  - `enabled` 플래그로 향후 기능 준비 상태에 맞춰 표시 제어 가능
- `src2/kernel/components/manage/index.ts` (신규)
- `src2/kernel/components/index.ts` (manage export 추가)
- `src2/app/pages/manage/manage-page-layout.css` (신규)
  - manage 페이지 폭/간격/카드/안내 박스 토큰 및 클래스 정의

### 적용 전략
- 현재: 공통 뼈대 생성만 수행(기존 페이지 미적용)
- 다음 이관부터: 신규 manage 페이지는 `ManageInfoNotice` + layout 토큰 우선 사용
- 추후 별도 턴: 기존 manage 페이지 일괄 통일 적용

### 게이트
- `npm run build` 성공

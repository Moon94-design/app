# 기준정보 관리 vendor 신규 구현 (/manage/master)

> 작성일: 2026-02-10
> 주제: src2 기준으로 매입처/서비스 업체 관리 페이지를 신규 구현하고 manage master에 연결

---

## 변경 요약
- `ManageVendorPage`를 신규 구현해 `/manage/master`에서 vendor 관리 진입을 활성화.
- vendor 관리를 page/hooks/sections 구조로 분리.
- 신규 페이지에 공통 뼈대(`ManageInfoNotice`, manage layout 클래스)를 적용.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageVendorPage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageVendorPage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageVendorListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageVendorEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `MasterMenu`에 `vendor` 추가
    - vendor 카드 클릭 활성화

## kernel 연결
- `createVendorRepo`를 통한 조회/저장/삭제 처리
- `@kernel/schema/vendor` 타입/헬퍼(`getVendorStatusBadge`) 사용
- 연락처는 `@kernel/utils` 전화번호 정규화 적용

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-vendor.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `partner/vehicle/vendor/employee/equipment 완료`로 갱신

## 게이트 확인
- `npm run build` 성공

## 역할 스위칭 점검
- 주의할 점:
  - vendor 편집은 register 섹션(`VendorFormSection`, `VendorContactsSection`) 재사용이므로 공통 변경 시 manage도 같이 영향받음.
  - 현재 `agency`, `consumable`는 manage 신규 미구현 상태.
- Phase 6 대비 선조치 체크:
  - [x] 입력 정규화(전화번호) 적용
  - [x] repo/domain 경유 저장 유지
  - [ ] DTO 매핑 문서화(phase6 전 별도 문서 필요)
  - [ ] 권한/감사 필드(writerId/updatedBy) 확장 포인트 반영은 후속

## 다음 단계
- `/manage/master`에서 `agency` 신규 구현
- 이어서 `consumable` 신규 구현

다음 질문: 바로 `agency` 관리 페이지 신규 생성으로 이어갈까?

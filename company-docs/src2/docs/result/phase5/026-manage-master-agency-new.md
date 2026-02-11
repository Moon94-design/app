# 기준정보 관리 agency 신규 구현 (/manage/master)

> 작성일: 2026-02-10
> 주제: src2 기준으로 관계기관 관리 페이지를 신규 구현하고 manage master에 연결

---

## 변경 요약
- `ManageAgencyPage`를 신규 구현해 `/manage/master`에서 agency 관리 진입 활성화.
- agency 관리를 page/hooks/sections 구조로 분리.
- 신규 페이지에 공통 뼈대(`ManageInfoNotice`, manage layout 클래스)를 적용.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageAgencyPage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageAgencyPage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageAgencyListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageAgencyEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `MasterMenu`에 `agency` 추가
    - agency 카드 클릭 활성화

## kernel 연결
- `createAgencyRepo`를 통한 조회/저장/삭제 처리
- `@kernel/schema/agency` 타입/헬퍼(`displayAgencyName`) 사용
- 연락처는 `@kernel/utils` 전화번호 정규화 적용

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-agency.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `partner/vehicle/vendor/agency/employee/equipment 완료`로 갱신

## 게이트 확인
- `npm run build` 성공

## 역할 스위칭 점검
- 주의할 점:
  - agency 편집은 register 섹션(`AgencyFormSection`, `AgencyContactsSection`) 재사용이므로 공통 변경 시 manage도 영향.
  - `/manage/master`에서 남은 미생성은 `consumable` 1개.
- Phase 6 대비 선조치 체크:
  - [x] 입력 정규화(전화번호) 적용
  - [x] repo/domain 경유 저장 유지
  - [ ] DTO 매핑 문서화(phase6 전 별도 문서 필요)
  - [ ] 권한/감사 필드(writerId/updatedBy) 확장 포인트 반영은 후속

## 다음 단계
- `/manage/master`의 `consumable` 신규 구현
- `/manage/daily` 생산/이슈·조치 상세 이관

다음 질문: 바로 `consumable` 관리 페이지 신규 생성으로 이어갈까?

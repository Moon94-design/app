# 기준정보 관리 consumable 신규 구현 (/manage/master)

> 작성일: 2026-02-10
> 주제: src2 기준으로 소모품 관리 페이지를 신규 구현하고 manage master 완성도를 확장

---

## 변경 요약
- `ManageConsumablePage`를 신규 구현해 `/manage/master`에서 consumable 관리 진입을 활성화.
- consumable 관리를 page/hooks/sections 구조로 분리.
- 용어를 `서비스 업체`, `관계 기관`으로 통일.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageConsumablePage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageConsumablePage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageConsumableListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageConsumableEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `MasterMenu`에 `consumable` 추가
    - consumable 카드 클릭 활성화
    - 용어 교체: `서비스 업체`, `관계 기관`
  - `src2/app/pages/manage/ManageVendorPage.tsx`
    - 용어 교체: `서비스 업체`
  - `src2/app/pages/manage/ManageAgencyPage.tsx`
    - 용어 교체: `관계 기관`

- nav:
  - `src2/app/nav/navConfig.ts`
    - 기준정보 라벨 교체: `서비스 업체`, `관계 기관`

## kernel 연결
- `createConsumableRepo`, `createEquipmentRepo`, `createVendorRepo` 기반 CRUD
- 편집 저장/삭제 시 설비의 `consumableIds` 정합 갱신 처리

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-consumable.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `consumable 포함 완료`로 갱신
  - 기준등록 라벨 용어 교체 반영

## 게이트 확인
- `npm run build` 성공

## 역할 스위칭 점검
- 주의할 점:
  - consumable 편집에서 설비 변경 시 `consumableIds` 동기화가 핵심이므로, 이후 서버 이관 시 동일 규칙을 API/DB 트랜잭션으로 옮겨야 함.
  - `ManageConsumableEditFormSection`은 등록용 섹션 재사용 구조이므로 등록 폼 변경 시 관리 폼도 함께 영향 받음.
- 선조치 체크:
  - [x] domain repo 경유 저장/삭제 유지
  - [x] 하드코딩 키 직접 접근 없음
  - [x] 용어 통일(`서비스 업체`, `관계 기관`)
  - [ ] 서버 이관 대비 DTO/DB 매핑 명시(phase6 문서 단계에서 수행)
  - [ ] 권한/감사 필드(`updatedBy`, `role`) 반영은 phase6에서 수행

## 다음 단계
- `/manage/daily`의 생산/이슈·조치 상세 이관
- manage 공통 UX(오류 피드백/알림 문구) 표준화

다음 질문: `/manage/daily/production`부터 바로 이어갈까?


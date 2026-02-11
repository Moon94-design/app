# 기준정보 관리 vehicle 상세 이관 (/manage/master)

> 작성일: 2026-02-10
> 주제: Manage master의 vehicle 상세를 legacy에서 src2 + @kernel로 전환

---

## 변경 요약
- `ManageMasterPage`의 vehicle 분기를 `@legacy`에서 `src2` 페이지로 교체.
- vehicle 관리 화면을 page/hooks/sections 구조로 분리.
- vehicle 상태 판정 로직을 `kernel/schema/vehicle/statusHelpers.ts`로 정리.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `@legacy/app/pages/manage/master/VehicleManage` 제거
    - `ManageVehiclePage` 연결
  - `src2/app/pages/manage/ManageVehiclePage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageVehiclePage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageVehicleToolbar.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageVehicleListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageVehicleEditFormSection.tsx` (신규)

- kernel:
  - `src2/kernel/schema/vehicle/statusHelpers.ts` (신규)
  - `src2/kernel/schema/vehicle/index.ts` (status helper export 추가)

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-vehicle.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `partner/vehicle src2 완료` 기준으로 갱신

## 게이트 확인
- `npm run build` 성공
- `ManageMasterPage`에서 legacy vehicle import 제거 확인

## 다음 단계
- `/manage/master`의 employee/equipment 상세 이관
- `/manage/daily`의 생산/이슈·조치 상세 이관

## 후속 보완(즉시 반영)
- vehicle key 호환(A 패턴):
  - `repo:vehicle`가 비어있을 때만 `local_vehicles_v1`를 1회 이관.
  - 이관 메타(`meta:vehicle:legacy-v1:migrated`) 저장 후 재실행 방지.
- safeTrim 방어:
  - vehicle 완료 판정에서 `safeTrim` 사용으로 비정형 legacy 값(`null/number`)에도 런타임 예외 없이 처리.
- UX 개선 backlog:
  - manage 저장/삭제/보류 실패 피드백 표준화는 Phase 5 마무리 UX 항목으로 backlog 이관.

## 추가 점검/보강 (역할 스위칭 리뷰 반영)
- 이관 조건 안전성:
  - 기존 `repo:vehicle`가 일부만 채워진 부분 이관 상태도 대응하도록 보강.
  - 현재는 `primary 우선 + legacy 누락 ID만 보강` 병합 방식으로 1회 이관 수행.
- 메타 키 SSOT:
  - `vehicleLegacyMigratedMeta`는 `STORAGE_KEYS`에 정의된 키만 사용(문자열 하드코딩 없음).
- 데이터 정합(dedupe):
  - 1회 이관 시 Map(id) 병합으로 ID 중복 제거.
  - `primary`와 `legacy` 중복 ID 충돌 시 `primary`를 우선 보존.

다음 질문: `/manage/master`는 employee부터 이어갈까, equipment부터 이어갈까?

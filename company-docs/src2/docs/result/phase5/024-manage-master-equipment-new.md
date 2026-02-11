# 기준정보 관리 equipment 신규 구현 (/manage/master)

> 작성일: 2026-02-10
> 주제: src2 기준으로 설비 관리 페이지를 신규 구현하고 manage master에 연결

---

## 변경 요약
- `src`에 설비 관리 페이지가 없는 전제로 `ManageEquipmentPage`를 신규 구현.
- page/hooks/sections 구조로 분리해 유지보수 가능한 형태로 구성.
- `ManageMasterPage`에서 equipment 메뉴를 활성화해 실제 진입 가능 상태로 전환.
- 신규 페이지부터 공통 안내/레이아웃 뼈대(`ManageInfoNotice`, manage layout 클래스) 적용.

## 코드 변경
- manage:
  - `src2/app/pages/manage/ManageEquipmentPage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageEquipmentPage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageEquipmentListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageEquipmentEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageMasterPage.tsx`
    - `MasterMenu`에 `equipment` 추가
    - equipment 카드 클릭 활성화
    - `manage-page-layout.css` import 추가

## kernel 연결
- `createEquipmentRepo`로 조회/저장/삭제 처리
- `@kernel/schema/equipment` 타입 기반으로 폼/리스트 동작
- 안내 블록은 `@kernel/components/manage/ManageInfoNotice` 적용

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-master-equipment.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/master` 메모를 `partner/vehicle/employee/equipment 완료`로 갱신

## 게이트 확인
- `npm run build` 성공

## 다음 단계
- `/manage/daily` 생산/이슈·조치 상세 이관
- 기존 manage 페이지 공통 안내/레이아웃 일괄 적용 턴

다음 질문: `/manage/daily`의 생산 관리부터 이어갈까?

---

## 정책 고정(선조치 이행 명시)
- 사용자 지시 반영:
  - Phase 5 manage 이관에서 `엑셀 일괄등록`은 신규 구현하지 않음.
  - 이관 우선(속도/안정화) 원칙 유지, 엑셀 관련은 추후 정리 대상으로 보류.

### 문서 반영 파일
- `src2/docs/roadmap/phase5/roadmap.md`
  - manage 안내 규칙(엑셀 일괄등록 신규 구현 금지) 추가
  - 작업 시작 전 선조치 4항목(API 매핑/입력검증/key 호환/권한 확장) 체크 추가
- `src2/docs/roadmap/phase5/factory-process-checklist.md`
  - 사전 단계에 선조치 체크/엑셀 안내 규칙 확인 추가
  - 문서 단계에 역할 스위칭 점검 기록 추가
- `src2/docs/roadmap/phase5/first-target-work-order-template.md`
  - 0.1/0.2 단계로 선조치 체크와 엑셀 안내 규칙 확인 추가
  - 7단계에 역할 스위칭 점검 기록 추가
- `src2/docs/rule/DECISIONS_LOG.md`
  - 엑셀 일괄등록 신규 구현 금지 결정 추가
  - 선조치 4항목 체크 필수화 결정 추가

### 게이트
- `npm run build` 성공

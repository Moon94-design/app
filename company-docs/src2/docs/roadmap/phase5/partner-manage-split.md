# Partner Manage 분리 가이드

작성일: 2026-02-09
목적: PartnerManagePage 분리 대상/현황 정리

================================================================================
분리 대상(제안)
- src2/app/pages/partner/sections/PartnerManageToolbar.tsx
  - 검색 입력, 상태 필터 탭, 일괄 수정 토글
- src2/app/pages/partner/sections/PartnerManageList.tsx
  - 리스트 렌더링 + 행 컴포넌트 + 체크박스/선택 표시
- src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx
  - 일괄 수정 UI(필드 선택/적용/되돌리기 버튼)
- src2/app/pages/partner/bulk/usePartnerBulkEdit.ts
  - 선택 항목 -> nextItems 계산, upsertMany 1회, 스냅샷 저장/되돌리기

================================================================================
분리 시 지켜야 할 규칙
- 완료/보류 판정은 kernel/schema/partner helper만 사용
- upsertMany는 bulk 훅에서 1회만 호출
- 스냅샷 키는 kernel/repo/keys.ts SSOT 사용(하드코딩 금지)

PartnerManagePage.tsx 최종 책임
- 데이터 로드/탭·검색·선택 상태/하위 컴포넌트 조립만 담당한다.

bulk 훅 API(예시)
- usePartnerBulkEdit는 selectedIds, toggleSelect, applyBulk, undoBulk, canUndo, snapshotMeta를 반환한다.

================================================================================
src2 기능 파일 현황(관련 경로)
- src2/app/pages/partner/PartnerManagePage.tsx
  - 거래처 관리 페이지(검색/보류/일괄 수정/되돌리기 포함)
- src2/app/pages/partner/PartnerRegisterPage.tsx
  - 거래처 등록/수정 페이지(드래프트/완료 판정)
- src2/app/pages/partner/index.ts
  - 파트너 페이지 엔트리(현재 비어 있음)
- src2/app/pages/partner/sections/PartnerBaseSection.tsx
  - 거래처 기본 정보 섹션
- src2/app/pages/partner/sections/PartnerCreateFlow.tsx
  - 등록(Create) 단계형 폼
- src2/app/pages/partner/sections/PartnerExtraSection.tsx
  - 추가 정보 섹션(메모/중요도/관계현황)
- src2/app/pages/partner/sections/PartnerHeader.tsx
  - 페이지 헤더(모드/완료 표시)
- src2/app/pages/partner/sections/PartnerProfilesSection.tsx
  - 거래 프로필 편집 섹션
- src2/app/pages/partner/sections/PartnerRecentList.tsx
  - 최근 등록 목록
- src2/kernel/schema/partner/partnerTypes.ts
  - Partner 도메인 타입/완료·보류 판정 helper
- src2/kernel/schema/partner/index.ts
  - partner schema barrel export
- (EXIST) src2/kernel/repo/domain/partnerRepo.ts
  - Partner 저장소(domain repo)
- (EXIST) src2/kernel/repo/domain/partnerBulkSnapshotRepo.ts
  - 일괄 수정 스냅샷 저장소
- (EXIST) src2/kernel/repo/domain/dailyRepo.ts
  - Daily 저장소(domain repo)

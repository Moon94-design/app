# Partner Manage 기능 파일 현황

작성일: 2026-02-09
목적: src2 기능 파일 위치와 역할을 한 줄로 정리

================================================================================
(EXIST) src2/app/pages/partner/PartnerManagePage.tsx
- 거래처 관리 페이지(검색/보류/일괄 수정/되돌리기 포함)

(EXIST) src2/app/pages/partner/PartnerRegisterPage.tsx
- 거래처 등록/수정 페이지(드래프트/완료 판정)

(EXIST) src2/app/pages/partner/index.ts
- 파트너 페이지 엔트리(현재 비어 있음)

(EXIST) src2/app/pages/partner/sections/PartnerBaseSection.tsx
- 거래처 기본 정보 섹션

(EXIST) src2/app/pages/partner/sections/PartnerCreateFlow.tsx
- 등록(Create) 단계형 폼

(EXIST) src2/app/pages/partner/sections/PartnerExtraSection.tsx
- 추가 정보 섹션(메모/중요도/관계현황)

(EXIST) src2/app/pages/partner/sections/PartnerHeader.tsx
- 페이지 헤더(모드/완료 표시)

(EXIST) src2/app/pages/partner/sections/PartnerProfilesSection.tsx
- 거래 프로필 편집 섹션

(EXIST) src2/app/pages/partner/sections/PartnerRecentList.tsx
- 최근 등록 목록

(EXIST) src2/kernel/schema/partner/partnerTypes.ts
- Partner 도메인 타입/완료·보류 판정 helper

(EXIST) src2/kernel/schema/partner/index.ts
- partner schema barrel export

(EXIST) src2/kernel/repo/domain/partnerRepo.ts
- Partner 저장소(domain repo)

(EXIST) src2/kernel/repo/domain/partnerBulkSnapshotRepo.ts
- 일괄 수정 스냅샷 저장소

(EXIST) src2/kernel/repo/domain/dailyRepo.ts
- Daily 저장소(domain repo)

(PLANNED) src2/app/pages/partner/sections/PartnerManageToolbar.tsx
- 검색/필터/일괄 수정 토글 UI

(PLANNED) src2/app/pages/partner/sections/PartnerManageList.tsx
- 리스트 렌더 + 행 컴포넌트 + 체크박스

(PLANNED) src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx
- 일괄 수정 UI(필드 선택/적용/되돌리기 버튼)

(PLANNED) src2/app/pages/partner/bulk/usePartnerBulkEdit.ts
- 일괄 수정 로직(배치 적용/되돌리기/스냅샷)

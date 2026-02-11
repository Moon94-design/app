# Partner Manage 기능 파일 현황 (최신)

작성일: 2026-02-10
목적: partner 등록/관리 관련 파일의 현재 위치와 역할을 기준 문서로 유지

================================================================================
1) app/pages/partner

(EXIST) `src2/app/pages/partner/PartnerManagePage.tsx`
- 거래처 관리 조립 페이지(검색/필터/선택/보류/일괄수정/되돌리기 연결)

(EXIST) `src2/app/pages/partner/PartnerRegisterPage.tsx`
- 거래처 등록/수정 페이지(드래프트/상태 판정/저장)

(EXIST) `src2/app/pages/partner/index.ts`
- partner 페이지 엔트리(barrel)

--- sections
(EXIST) `src2/app/pages/partner/sections/PartnerManageToolbar.tsx`
- 검색/필터/일괄수정 토글 UI

(EXIST) `src2/app/pages/partner/sections/PartnerManageList.tsx`
- 거래처 목록 렌더 + 체크박스 + 상태 표시

(EXIST) `src2/app/pages/partner/sections/PartnerBaseSection.tsx`
- 거래처 기본정보 입력 섹션

(EXIST) `src2/app/pages/partner/sections/PartnerCreateFlow.tsx`
- 등록(Create) 플로우 조립 섹션

(EXIST) `src2/app/pages/partner/sections/PartnerExtraSection.tsx`
- 추가정보(메모/중요도/관계현황) 섹션

(EXIST) `src2/app/pages/partner/sections/PartnerProfilesSection.tsx`
- 거래 프로필 편집 섹션

(EXIST) `src2/app/pages/partner/sections/PartnerRecentList.tsx`
- 최근 등록 목록

--- bulk
(EXIST) `src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx`
- 일괄수정 패널 UI(필드 선택/적용/되돌리기)

(EXIST) `src2/app/pages/partner/bulk/usePartnerBulkEdit.ts`
- 일괄수정 상태/로직(배치 적용, 스냅샷, 되돌리기)

================================================================================
2) kernel/schema/partner

(EXIST) `src2/kernel/schema/partner/partnerTypes.ts`
- partner 타입, 기본 draft, 완료 판정 로직

(EXIST) `src2/kernel/schema/partner/profileHelpers.ts`
- 프로필 dedupe/merge 등 보조 로직

(EXIST) `src2/kernel/schema/partner/statusHelpers.ts`
- partner 상태 뱃지 매핑 helper

(EXIST) `src2/kernel/schema/partner/index.ts`
- partner schema barrel export

================================================================================
3) kernel/repo

(EXIST) `src2/kernel/repo/domain/partnerRepo.ts`
- partner domain repo

(EXIST) `src2/kernel/repo/domain/partnerBulkSnapshotRepo.ts`
- partner 일괄수정 스냅샷 저장소

================================================================================
4) 공통 SSOT 컴포넌트(연결점)

(EXIST) `src2/kernel/components/master/MasterFormHeader.tsx`
- 등록/수정 페이지 공통 헤더

(EXIST) `src2/kernel/components/status/StatusBadge.tsx`
- 상태 표시 공통 배지

(EXIST) `src2/kernel/components/profiles/ProfilesEditor.tsx`
- 프로필 편집 공통 컴포넌트

(EXIST) `src2/kernel/components/recent/BaseRecentList.tsx`
- 최근목록 공통 컴포넌트

================================================================================
메모
- 기존 `PartnerHeader.tsx`는 제거됨(현재 미사용, MasterFormHeader로 통일).

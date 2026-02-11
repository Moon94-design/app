# SSOT 공통섹션 작업 순서표 - ProfilesEditor (Partner Register + Bulk)

작성일: 2026-02-10
목적: 거래 프로필 편집 UI/정책을 공통화하고 Partner 등록/일괄수정에 재사용

================================================================================
대상 공통섹션
- 섹션명: `ProfilesEditor`
- 적용 범위: `partner` 도메인 (register + bulk)
- 목표: kernel SSOT + 재사용 2회 이상 + build 통과
- 범위 경계: 공통섹션/도메인 helper만 다루며, nav loader/신규 페이지 이관 없음

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정(섹션 1개)
- [x] 1) kernel 컴포넌트 생성
  - [x] `src2/kernel/components/profiles/ProfilesEditor.tsx`
  - [x] `src2/kernel/components/profiles/index.ts`
  - [x] `src2/kernel/components/index.ts` export 연결
- [x] 2) 도메인 helper 연결
  - [x] `src2/kernel/schema/partner/profileHelpers.ts` 생성
  - [x] `partner/index.ts` export 연결
- [x] 3) 도메인 적용
  - [x] `PartnerProfilesSection.tsx`가 `ProfilesEditor` 사용
  - [x] `PartnerBulkEditPanel.tsx`가 `ProfilesEditor` 사용
  - [x] `usePartnerBulkEdit.ts`가 `mergeTradeProfiles`/`createDefaultTradeProfile` 사용
- [x] 4) 중복 제거
  - [x] `PartnerCreateFlow.tsx` 내 프로필 UI 블록 제거 후 `PartnerProfilesSection` 재사용
- [x] 5) 게이트
  - [x] `npm run build`
- [x] 6) 문서
  - [x] result 기록

================================================================================
완료판정
- [x] 공통 컴포넌트가 kernel에서 export된다.
- [x] `grep`으로 `ProfilesEditor` import가 2개 컨텍스트(register section, bulk panel)에서 존재함을 확인한다.
- [x] 프로필 dedupe/merge 정책이 도메인 helper 1곳으로 수렴한다.
- [x] 게이트 통과 + 문서 기록 완료.

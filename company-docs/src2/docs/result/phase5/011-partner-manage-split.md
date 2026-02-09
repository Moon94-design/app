# Partner Manage 분리 작업

> 작성일: 2026-02-09
> 주제: PartnerManagePage 분리 및 문서 정리

---

## 변경 요약
- PartnerManagePage를 toolbar/list/bulk 패널/훅으로 분리해 조립 파일로 경량화.
- 일괄 수정 로직을 훅으로 이동하고, 스냅샷 정책/배치 저장 규칙 유지.
- 기능 파일 현황 문서를 reference 폴더로 이동하고 main_rule에서 참조 링크 갱신.

## 분리된 파일
- src2/app/pages/partner/sections/PartnerManageToolbar.tsx
  - 검색/필터/일괄 수정 토글 UI
- src2/app/pages/partner/sections/PartnerManageList.tsx
  - 리스트 렌더 + 행 컴포넌트 + 체크박스
- src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx
  - 일괄 수정 UI(필드 선택/적용/되돌리기 버튼)
- src2/app/pages/partner/bulk/usePartnerBulkEdit.ts
  - 일괄 수정 로직(배치 적용/되돌리기/스냅샷)

## 조립 파일 변경
- src2/app/pages/partner/PartnerManagePage.tsx
  - 데이터 로드/탭·검색·선택 상태/하위 컴포넌트 조립으로 책임 축소

## 문서 변경
- src2/docs/reference/partner-manage-files.md
  - 기능 파일 현황 문서 위치 이동(참조용 고정)
- src2/docs/rule/main_rule.md
  - Phase 5 분리 가이드/현황 문서 링크 갱신

## 확인
- 분리 후 /manage/master에서 콘솔 에러 없이 동작 확인

다음 질문: 분리 후 `npm run build` 재확인까지 진행할까?
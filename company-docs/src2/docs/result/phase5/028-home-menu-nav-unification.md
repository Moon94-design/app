# 홈/메뉴 이관 + 상단 네비/뒤로 UX 통일

> 작성일: 2026-02-10
> 주제: src2 홈/메뉴 페이지 이관, manage 하위 라우트 분리, 상단 네비/뒤로 동선 정리

---

## 변경 요약
- 홈/메뉴 성격 페이지를 src2로 이관해 legacy loader 의존을 축소.
- `manage/master`를 하위 라우트 구조로 바꿔 상세 진입 시 형제 탭(거래처/차량/설비/소모품...)이 노출되도록 수정.
- Shell 상단 UX를 비고정/비반투명으로 정리하고, 브랜드 하단에 breadcrumb+탭을 통합.
- 페이지 공통 뒤로 동선 강화를 위해 콘텐츠 상단 우측에 `뒤로` 버튼을 공통 배치.

## 코드 변경
- shell/nav
  - `src2/app/shell/Shell.tsx`
  - `src2/app/shell/shell.css`
  - `src2/app/nav/navConfig.ts`

- 홈/메뉴 페이지(src2 신규)
  - `src2/app/pages/home/HomeMainPage.tsx`
  - `src2/app/pages/register/RegisterHomePage.tsx`
  - `src2/app/pages/register/RegisterMasterPage.tsx`
  - `src2/app/pages/register/RegisterDailyPage.tsx`
  - `src2/app/pages/browse/BrowseHomePage.tsx`

- manage 라우팅/뒤로 정렬
  - `src2/app/pages/manage/ManageMasterPage.tsx` (내부 state 메뉴 -> 링크 메뉴)
  - `src2/app/pages/manage/ManageDailyPage.tsx` (내부 state 메뉴 -> 링크 메뉴)
  - `src2/app/pages/manage/ManageVehiclePage.tsx`
  - `src2/app/pages/manage/ManageEmployeePage.tsx`
  - `src2/app/pages/manage/ManageEquipmentPage.tsx`
  - `src2/app/pages/manage/ManageVendorPage.tsx`
  - `src2/app/pages/manage/ManageAgencyPage.tsx`
  - `src2/app/pages/manage/ManageConsumablePage.tsx`
  - `src2/app/pages/manage/ManageLogisticsPage.tsx`
  - `src2/app/pages/partner/PartnerManagePage.tsx`

## 핵심 반영 사항
- `/manage/master/partner` 같은 상세 URL로 직접 접근 가능.
- 해당 상세에서 quick-tab이 `거래처, 차량, 서비스 업체, 관계 기관, 직원, 설비, 소모품`으로 노출.
- 상단 네비는 상호명 아래로 합류했고, 스크롤 따라오는 반투명 바 제거.
- 메뉴 라벨은 필요한 단어 중심으로 유지(거래처/차량/설비/소모품 등).

## 문서 변경
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/`, `/register`, `/register/master`, `/register/daily`, `/browse`를 `MIGRATED`로 반영
  - 현재 loader 기준 컴포넌트 경로 갱신

## 게이트 확인
- `npm run build` 성공

## 역할 스위칭 점검
- 주의할 점:
  - `manage/master` 하위 상세를 경로로 분리했으므로 북마크/새로고침 동작 검증이 더 중요해짐.
  - 공통 `뒤로` 버튼과 각 페이지별 `뒤로` 버튼이 중복될 수 있어, 다음 UX 정리 때 한 가지 패턴으로 축소 권장.
- 선조치 체크:
  - [x] 상단 네비 구조 단순화(브랜드 하단 통합)
  - [x] 상세 페이지 형제 탭 노출 경로 확정
  - [x] 메뉴 페이지 src2 이관
  - [ ] manage/daily 생산/이슈·조치 상세 탭 구현은 후속

## 다음 단계
- `/manage/daily/production` 상세 페이지 신규 생성
- `/manage/daily/issue`, `/manage/daily/action` 상세 이관

다음 질문: `manage/daily`의 생산부터 같은 패턴으로 바로 이어서 만들까?


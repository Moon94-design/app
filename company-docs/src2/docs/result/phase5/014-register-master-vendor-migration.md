# 기준등록 매입처 페이지 이관 (/register/master/vendor)

> 작성일: 2026-02-09
> 주제: Factory 방식으로 기준등록 vendor 페이지를 src2로 이관

---

## 변경 요약
- `/register/master/vendor` loader를 `@legacy` -> `@app2`로 교체.
- 페이지를 얇은 조립 구조로 만들고 폼/연락처/목록을 sections로 분리.
- vendor 도메인 정본 세트(schema/repo/draft key)를 kernel에 추가.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/vendor` -> `@app2/pages/vendor/VendorRegisterPage`

- page:
  - `src2/app/pages/vendor/VendorRegisterPage.tsx`
  - `src2/app/pages/vendor/hooks/useVendorRegisterPage.ts`
  - `src2/app/pages/vendor/sections/VendorFormSection.tsx`
  - `src2/app/pages/vendor/sections/VendorContactsSection.tsx`
  - `src2/app/pages/vendor/sections/VendorRecentList.tsx`

- kernel:
  - `src2/kernel/schema/vendor/vendorTypes.ts`
  - `src2/kernel/schema/vendor/index.ts`
  - `src2/kernel/schema/index.ts` (vendor export 추가)
  - `src2/kernel/repo/domain/vendorRepo.ts`
  - `src2/kernel/repo/keys.ts` (`vendor: local_vendors_v1` 추가, 레거시 키 호환 유지)
  - `src2/kernel/repo/index.ts` (vendor repo export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`vendorRegister: draft:vendor:register` 추가)

## 문서 변경
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/vendor` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-vendor.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- dev 서버는 `127.0.0.1:5173` 유지 중.
- URL 직접입력/재요청(새로고침 대체) 200 확인.

다음 질문: 기준등록 다음 타깃을 `/register/master/agency`로 이어갈까?

## 후속 수정(런타임 흰화면)
- 증상: `/register/master/vendor` 진입 시 ErrorBoundary로 흰 화면.
- 원인: draft key가 `draft:` prefix 규칙을 위반(`draft_vendor_v1`).
- 수정: `src2/kernel/draft/draftKeys.ts`의 `vendorRegister`를 `draft:vendor:register`로 변경.
- 검증: `npm run build` 성공.

## 후속 게이트 확인
- `/register/master/vendor` 직접 URL 요청 200 확인.
- 재요청(새로고침 대체) 200 확인.
- Router 중복 경고 0은 브라우저 콘솔 수동확인 필요.

## dev 서버 정리
- 중복 `vite` 프로세스를 정리하고 1개만 유지.
- 현재 `127.0.0.1:5173` 단일 서버로 확인.

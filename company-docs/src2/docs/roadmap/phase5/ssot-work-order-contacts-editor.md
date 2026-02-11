# SSOT 공통섹션 작업 순서표 - ContactsEditor (Vendor + Agency)

작성일: 2026-02-10
목적: 연락처 편집 UI를 공통화하고 Vendor/Agency 양쪽에서 재사용 고정

================================================================================
대상 공통섹션
- 섹션명: `ContactsEditor`
- 적용 도메인: `vendor`, `agency`
- 목표: kernel SSOT + 재사용 2도메인 + build 통과
- 범위 경계: 공통섹션/문서 규칙만 적용, nav loader 교체/신규 이관 없음

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정(섹션 1개)
- [x] 1) kernel 컴포넌트 생성
  - [x] `src2/kernel/components/contacts/ContactsEditor.tsx`
  - [x] `src2/kernel/components/contacts/index.ts`
  - [x] `src2/kernel/components/index.ts` export 연결
- [x] 2) 도메인 결합 규칙 확인
  - [x] `kernel/components`에서 domain helper 직접 import 없음
  - [x] 도메인 차이(email 유무/placeholder)는 props로 주입
- [x] 3) 도메인 적용
  - [x] `VendorContactsSection.tsx` -> `ContactsEditor` 사용
  - [x] `AgencyContactsSection.tsx` -> `ContactsEditor` 사용
- [x] 4) 게이트
  - [x] `npm run build`
  - [x] `grep` 재사용 확인
- [x] 5) 문서
  - [x] SSOT 규칙(2도메인 기본+예외 로그 의무) 반영
  - [x] result 기록

================================================================================
완료판정
- [x] 공통 컴포넌트가 kernel에서 export된다.
- [x] 서로 다른 2도메인(vendor/agency)에서 같은 컴포넌트를 import한다.
- [x] `kernel/components`의 domain helper 직접 import가 없다.
- [x] 게이트 통과 + 문서 기록 완료.

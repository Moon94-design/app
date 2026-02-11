# SSOT 공통섹션 작업 순서표 (템플릿)

작성일: 2026-02-10
목적: 공통 섹션 1개를 SSOT로 고정할 때 복사해 쓰는 실행 템플릿

================================================================================
대상 공통섹션
- 섹션명: [MasterFormHeader / ProfilesEditor / ContactsEditor / StatusBadge / BaseRecentList]
- 적용 도메인: [최소 2개]
- 목표: kernel SSOT + 재사용 2회 이상 + build 통과
- 범위 경계: 본 작업은 공통섹션만 다루며, nav loader 교체/신규 페이지 이관은 별도 작업으로 분리

================================================================================
작업 순서(체크박스)
- [ ] 0) 범위 고정(섹션 1개)
- [ ] 1) kernel 컴포넌트 생성
  - [ ] `src2/kernel/components/<topic>/<Component>.tsx`
  - [ ] `src2/kernel/components/<topic>/index.ts`
- [ ] 2) 도메인 helper 연결(필요 시)
  - [ ] `src2/kernel/schema/<domain>/helpers|status.ts`
- [ ] 3) 도메인 1 적용(Partner)
  - [ ] 기존 section 대체
- [ ] 4) 도메인 2 적용(Vendor/Agency/...)
  - [ ] 같은 컴포넌트 재사용
- [ ] 5) 게이트
  - [ ] `npm run build`
  - [ ] URL + 새로고침
  - [ ] 핵심 기능 확인
- [ ] 6) 문서
  - [ ] 작업 기록(result)
  - [ ] 필요 시 MIGRATION_STATUS/DECISIONS_LOG 반영

================================================================================
완료판정
- [ ] 공통 컴포넌트가 kernel에서 export된다.
- [ ] 최소 2개 도메인이 같은 컴포넌트를 사용한다.
- [ ] `grep`으로 `<ComponentName>` import가 서로 다른 2개 도메인 페이지에 존재함을 확인한다.
- [ ] 페이지 파일은 조립 책임만 남는다.
- [ ] 게이트 통과 + 문서 기록 완료.

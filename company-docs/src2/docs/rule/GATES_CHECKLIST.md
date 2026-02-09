GATES_CHECKLIST.md
작성일: 2026-02-09
목적: 게이트를 매번 같은 방식으로 검증. 통과 못 하면 다음 단계 금지.

================================================================================
G0: 엔트리 전환 게이트(0단계)
목표: src2/app/main.tsx가 엔트리. 빌드/런/CSS/폰트/Provider 동일.

[체크]
[x] npm run build 성공
[x] npm run dev 정상 기동(콘솔 에러/워닝 치명 없음)
[x] 전역 CSS/테마/리셋 동일 적용(레거시 main.tsx import 누락 없음)
[x] 폰트/아이콘 정상 렌더링
[x] 전역 Provider/컨텍스트 동일(토스트/모달/테마/상태관리 등)

[흔한 실패 원인/대응]
- tsconfig include에 src2 누락 → include ["src","src2"]
- vite alias 누락/오타 → @kernel/@app2/@legacy 확인
- index.html 엔트리 경로 오타 → /src2/app/main.tsx
- CSS 깨짐 → src/main.tsx에서 import하던 css를 src2/app/main.tsx로 복사
- Provider 누락 → 레거시 App shell 감싸던 Provider 동일하게 이식

================================================================================
G1: Shadow Router 게이트(1단계)
목표: 메뉴/경로/화면 동일. 레거시 페이지 lazy 연결 100%. fallback/에러 처리.

[체크]
[x] 메뉴/경로 기존과 동일(navConfig 트리/label/icon/path 유지)
[x] 모든 레거시 페이지 정상 표시(React.lazy import 경로 정상)
[x] lazy 로딩 fallback(Loading UI) 정상 표시
[x] import 실패 시 ErrorBoundary 안내 표시
[x] URL 직접 입력/새로고침 정상 동작(BrowserRouter/Routes 설정 정상)
[x] 콘솔에서 Router 관련 경고 0개("You cannot render a <Router> inside another <Router>" 없음)
[x] navConfig는 loader만 사용(component 필드 없음), lazy는 routes에서만 처리됨
[x] Suspense는 App.tsx에만 존재(routes.tsx에는 없음)

[흔한 실패 원인/대응]
- 라우트 누락 → navConfig 복제 누락/flattenRoutes 버그
- 경로가 404 → Routes 생성 로직 확인, basename 사용 여부 점검
- 빈 화면 → Suspense fallback 미설정 or lazy import 실패
- 크래시 → ErrorBoundary 누락 or 잘못된 lazy 경로(@legacy 기준 확인)
- 라우터 중복 → 레거시 Shell 내부 Router 제거(라우터는 src2/app/main.tsx 1회)

================================================================================
G2: kernel/repo 인프라 게이트(2단계)
목표: repo 계약 확정 + localRepo 동작 + domain repo 사용 가능.

[체크]
[ ] repo/types.ts에 RepoContract + DocRepoContract 정의 완료
[ ] repo/keys.ts에 모든 storage key 정의(하드코딩 0)
[ ] storage/jsonStorage.ts가 pageStorage adapter 기반으로 동작
[ ] impl/localRepo.ts generic factory 동작
[ ] domain repo 최소 1개(masterRepo) getAll/upsert 동작 확인
[ ] UI에서 domain repo만 사용(impl 직접 호출 0)

================================================================================
G3: kernel/draft P0 게이트(3단계)
목표: useDraft<T> P0 기능(dirty/save/discard/load) 동작.

[체크]
[ ] draftKeys.ts에 도메인 기반 키 정의
[ ] useDraft<T> — dirty 상태 정상 추적
[ ] useDraft<T> — save/discard/load 동작
[ ] draftRepo가 jsonStorage adapter 통해 저장
[ ] 페이지 재진입 시 이전 draft 복원 확인

================================================================================
G4: 파일럿 페이지 이관 게이트(4단계)
목표: 첫 번째 페이지가 src2에서 완전 동작.

[체크]
[x] 페이지가 src2/app/pages/...에 존재
[x] navConfig loader가 src2 페이지 loader를 가리킴 (path 유지)
[x] 해당 페이지에서 @legacy import 0
[x] @kernel만 사용 (repo는 domain repo, draft는 useDraft)
[x] npm run build 성공
[x] npm run dev에서 해당 경로 정상 렌더
[x] Create/Edit 분기 정상
	Create: draft 저장/복원/초기화(resetDraft) 정상
	Edit: draft 비활성 + 기존 데이터 로드/저장 정상
[x] URL 직접 입력/새로고침 OK

================================================================================
추가 규칙(항상)
- @legacy import는 src2/app/**에서만 허용, src2/kernel/** 금지
- UI/페이지는 domain repo만 사용, impl 직접 사용 금지
- Storage key 하드코딩 금지(키는 kernel/repo/keys.ts SSOT)
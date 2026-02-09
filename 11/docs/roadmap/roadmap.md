src → src2 전환 마스터 로드맵 (길 안 잃는 용)
작성일: 2026-02-09
범위: 전환 전체(배포/서버/보안 포함) + 지금 실행할 Phase 1(0~1단계)만 세분화

================================================================================
A) 전체 단계 맵 (큰 항목)
Phase 0. 기준 문서/SSOT 고정
- SSOT(txt/md) 확정, 하드룰/게이트/alias/폴더 구조 고정, src2가 주인 원칙 고정

Phase 1. 엔트리 전환 + Shadow Router 완성 (지금 실행)
- src2가 메인 엔트리로 뜸
- src2 navConfig/routes/shell이 SSOT
- 레거시 페이지 100% lazy 연결 → “화면 그대로, 주인만 src2”

Phase 2. kernel/repo 인프라 정본화 (P0)
- 진입 조건: Phase 1 G1 통과
- Storage adapter 단일화(jsonStorage), keys.ts(키 SSOT)
- repo/types SSOT (RepoContract + DocRepoContract)
- localRepo/serverRepo 골격 + domain repo 정착(UI는 domain repo만)

Phase 3. kernel/draft 범용화 (P0/P1)
- 진입 조건: Phase 2 repo 계약 확정 + localRepo 괨격 완료
- draftKeys 도메인 규칙
- useDraft 범용(P0: dirty/save/discard/load, P1: autosave)
- draftRepo(repo 기반)

Phase 4. 파일럿 페이지 이관 (src → src2)
- 진입 조건: Phase 3 useDraft P0 동작 확인
- 단순 마스터 등록 페이지부터(또는 Partner V2)
- 해당 페이지: @legacy import 0 / @kernel만 사용
- navConfig component를 src2 페이지로 교체

Phase 5. 기능군 순차 이관 + 프론트 구조 완성(신규 페이지 추가 포함)
- 진입 조건: Phase 4 파일럿 페이지 DoD 통과
- 마스터(등록/관리/조회) → 일일기록(등록/관리/조회) → 계량/단가 조회 → 이슈/조치 → 대시보드
- 각 기능군별 kernel 의존:
  - 마스터: RepoContract + masterRepo (P0 범위)
  - 일일기록: RepoContract + dailyRepo + draft(autosave)
  - 계량/단가: query 확장(P1) 필요 시점
  - 이슈/조치: DocRepoContract + issueRepo/actionRepo
  - 대시보드: 전체 repo 조회 + 집계 유틸
- “리뉴얼(기존 페이지 교체)”과 동시에 “신규 페이지 추가” 진행
  - 예: 일일기록 조회/관리 페이지 확장, 통합 검색/보고서 페이지 추가
- 각 기능군마다: kernel 도구 채우기 → 페이지 이관/신규 생성 → 레거시 의존 제거

Phase 6. 서버 도입(백엔드) + 데이터 모델 확정
- API 설계(REST/GraphQL 중 택1), 인증/인가(권한 모델)
- DB 선택/마이그레이션, 파일 업로드/엑셀 처리 위치 결정(클라 vs 서버)

Phase 7. 보안/운영/배포(CI/CD)
- 환경변수/비밀키 분리, CORS/CSRF, 토큰 보관 정책
- 로그/감사, 백업/복구, 취약점 점검(의존성/CSP/헤더)
- CI/CD + 롤백 + 배포 파이프라인

Phase 8. 전환 종료
- src 의존 0 확인 → src 아카이브/삭제
- 운영 문서/개발 문서 최종 정리

================================================================================
B) 지금 실행할 Phase 1(0~1단계) 세분화
목표(확실)
- src2가 메인 엔트리
- src2/navConfig가 SSOT
- 레거시 페이지 100% 표시(React.lazy)
- G0/G1 게이트 통과

----------------------------------------
Phase 1-0) 0단계: 빌드 엔트리 전환
0-1) vite.config.ts alias 추가
- @kernel → src2/kernel
- @app2   → src2/app
- @legacy → src (전환 기간 한정)

0-2) tsconfig.app.json include 확장
- include: ["src", "src2"]

0-3) src2/app/main.tsx 작성
- 레거시 src/main.tsx가 import하던 전역 CSS/리셋/폰트 import 동일 반영
- 레거시 main.tsx의 전역 Provider(토스트/모달/테마 등)가 있다면 동일하게 복사
- BrowserRouter + App 렌더링

0-4) src2/app/App.tsx 작성
- Suspense fallback(Loading) 필수
- ErrorBoundary fallback(ErrorFallback) 필수
- AppRoutes/Shell 연결 준비

0-5) index.html 엔트리 변경
- /src/main.tsx → /src2/app/main.tsx

0-G) G0 게이트
- npm run build 성공
- npm run dev 정상
- 전역 CSS/테마/리셋 동일 적용
- 폰트/아이콘 정상
- 전역 Provider/컨텍스트(토스트/모달/테마 등) 동일 체감

----------------------------------------
Phase 1-1) 1단계: Shadow Router(레거시 100% 표시)
1-1) src2/app/nav/navConfig.ts 복제(SSOT)
- path/label 유지, component 필드 제거
- navConfig: 26개 라우트는 `loader`로 연결 (component 없음)
- loader: () => import('@legacy/app/pages/...') 형태
- routes.tsx에서 `React.lazy(item.loader)`로 라우트 컴포넌트 생성
- ⚠️ 사전 확인: 레거시 페이지 중 내부에서 <BrowserRouter>/<Routes>를 자체 생성하는 것이 있는지 확인 (R7 위반 방지)

1-2) src2/app/nav/navModel.ts 복제
- breadcrumb/quickTabs/flatten 등 보조 로직

1-3) src2/app/routes/routes.tsx 작성
- navConfig → flattenRoutes → <Routes> 생성
- URL 직접 입력/새로고침 정상 동작 확인

1-4) Shell 연결(메뉴/레이아웃)
- 레거시 레이아웃을 우선 복사해 src2/app 안에서 사용
- 라우터 중복 생성 금지(<BrowserRouter>는 main.tsx에서 1회)

1-G) G1 게이트
- 메뉴/경로 기존과 동일
- 모든 레거시 페이지 정상 표시
- lazy 로딩 fallback 정상 표시
- import 실패 시 ErrorBoundary 안내 표시
- URL 직접 입력/새로고침 정상

================================================================================
C) 다음 단계 운영 원칙(짧게)
- 새 페이지/신규 기능은 무조건 src2 기준으로 작성
- kernel은 정본(SSOT): kernel 내부 @legacy 금지
- UI는 domain repo만 사용(impl 직접 금지)
- Storage key는 keys.ts에서만 정의(하드코딩 금지)
- docs SSOT: company-docs/src2/docs/ (기존 /workspaces/app/src2/docs/는 백업/참조용만)
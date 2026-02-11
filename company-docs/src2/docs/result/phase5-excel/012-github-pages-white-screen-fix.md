# GitHub Pages 흰 화면(APP만 표시) 수정

> 작성일: 2026-02-12
> 주제: Pages 배포 시 Vite base/Router basename/배포 워크플로 정렬

---

## 변경 요약
- GitHub Pages 하위 경로 배포에서 정적 리소스 경로가 깨져 흰 화면이 뜨는 문제를 수정했다.
- Vite `base`를 GitHub Actions 환경에서 자동 계산하도록 고정했다.
- Router `basename`을 `import.meta.env.BASE_URL`로 맞춰 경로 불일치를 제거했다.
- Pages 배포 워크플로를 추가해 `build -> artifact -> deploy`를 자동화했다.

## 코드 변경
- `company-docs/vite.config.ts`
  - `GITHUB_REPOSITORY`/`GITHUB_ACTIONS` 기준으로 `base` 자동 설정 추가
- `company-docs/src2/app/main.tsx`
  - `BrowserRouter basename={import.meta.env.BASE_URL}` 적용
- `company-docs/.github/workflows/deploy-pages.yml` (신규)
  - main push 시 빌드/Pages 배포
  - SPA fallback용 `dist/404.html` 생성 포함

## 게이트
- `npm.cmd run build` 성공

다음 질문: GitHub 저장소 설정에서 Pages 배포 소스를 `GitHub Actions`로 확정했는지 확인할까?

## 핵심 로직 3줄
- 1) GitHub Actions에서만 Vite `base`를 `/{repo}/`로 설정해 리소스 경로를 맞췄다.
- 2) Router `basename`을 BASE_URL과 동기화해 페이지 라우팅 기준 경로를 통일했다.
- 3) 배포 워크플로에 SPA `404.html` fallback을 추가해 새로고침/직접 접근을 보완했다.

## 입문자 설명 3줄
- 1) GitHub Pages는 보통 루트(`/`)가 아니라 `/{저장소이름}/` 아래에서 앱이 돌아가서 경로 설정이 꼭 필요하다.
- 2) 화면 라우터도 같은 경로 기준을 써야 메뉴 이동/새로고침이 정상 동작한다.
- 3) 배포 자동화를 붙이면 로컬 빌드 성공 상태를 같은 방식으로 서버에도 반복 적용할 수 있다.

## 주의 사항
- AI가 로컬 실행 기준(`/`)만 보고 배포 경로를 놓치면, 빌드는 성공해도 Pages에서는 흰 화면이 재발할 수 있다.
- 저장소가 사용자 페이지(루트 도메인)인지 프로젝트 페이지(하위 경로)인지에 따라 `base` 정책이 달라질 수 있다.

## 향후 과정
- Pages 배포 후 실제 URL에서 F5/직접 URL 접근을 경로별(`/`, `/register`, `/manage`)로 점검해야 한다.
- 추후 커스텀 도메인 적용 시 `base`/`basename` 정책을 다시 검토해 하위 경로 전제를 제거할지 결정해야 한다.

---

## 추가 수정 (액션 미노출 원인 해결)
- 원인: 워크플로 파일이 저장소 루트가 아닌 `company-docs/.github/workflows` 아래에 있어 GitHub Actions가 인식하지 못했다.
- 조치:
  - `company-docs/.github/workflows/deploy-pages.yml` 삭제
  - 저장소 루트 `/.github/workflows/deploy-pages.yml`로 이동
  - workflow의 `working-directory`를 `company-docs`로 고정해 빌드 경로를 맞춤

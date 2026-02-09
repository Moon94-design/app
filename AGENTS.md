# AGENTS Instructions (app)

> Start -> DOCS_GUIDE -> main_rule -> check STATUS -> do the work -> verify GATES -> update STATUS -> record result

## 0) 우선 순위
- 매 작업 시작 시 이 파일을 먼저 따른다.
- 이 파일과 충돌 시 우선순위는 다음과 같다:
  1) 시스템 지시
  2) 개발자 지시
  3) 사용자 지시
  4) AGENTS.md
- 새 대화 시작/컨텍스트 손실/20턴+ 진행 시 이 파일 재확인.

## 0.5) 전체 액세스 안전장치 (우선 적용)
- 중요 작업/긴 작업이 아니면 전체 액세스 모드 사용을 피한다.
- 전체 액세스 모드 사용 시 아래 5개를 기본 강제한다:
  1) 범위 제한
  - 수정 대상은 `company-docs/` 하위로 제한.
  - `.env`, 키 파일, 개인 문서 폴더 접근 금지.
  2) 명령어 제한
  - 허용 기본: `npm run build`, `npm run dev`, `npm install`, `git status`, `git diff`.
  - 금지 기본: `rm -rf`, 시스템/레지스트리 설정 변경, 목적 불명 `curl`/외부 다운로드.
  3) 커밋/푸시 제한
  - 기본은 커밋/푸시 금지.
  - 커밋은 변경 diff 확인 후 사용자 명시 요청이 있을 때만 진행.
  4) 게이트 강제
  - 코드 변경 후 `npm run build`를 기본 검증으로 수행.
  - 빌드 실패 시 다음 단계 진행 금지(수정/중단/롤백 우선).
  5) 산출물 강제
  - 다음 단계 진행 전에 변경 파일 목록 + diff 요약을 먼저 공유.

## 1) 언어
- 사용자가 영어로 요청하지 않는 한 한국어(반말 톤)로 답변.
- 파일명/경로/코드 표기만 원문 유지.

## 2) 문서 로딩 무결성 규칙 (필수)
- 대상: `company-docs/src2/docs/DOCS_GUIDE.md`
- DOCS_GUIDE 재읽기 생략은 아래 2개를 모두 검증한 경우에만 허용:
  - 컨텍스트에 DOCS_GUIDE 전체 본문이 누락 없이 있음
  - 컨텍스트 기준 라인 수가 현재 파일 라인 수와 정확히 일치
- 둘 중 하나라도 불명확하면 DOCS_GUIDE 전체 재읽기.
- "이미 읽음" 판단은 라인 수 대조 없이 주장하지 않는다.

## 3) 디버깅 규칙 (항상)
- 런타임 문제(화이트스크린/크래시/무한루프)와 에디터 진단(TS 빨간줄)을 분리.
- 런타임 문제를 우선 해결: 브라우저 콘솔 + `npm run dev` + `npm run build` 근거 사용.
- 빌드 실패 근거가 없으면 import 관례(.tsx 확장자 강제 등) 변경 금지.
- `React.lazy(loader)`는 렌더/map 내부에서 생성 금지, 모듈 스코프 1회 생성 원칙.

## 4) 프로젝트/아키텍처 규칙
- 프로젝트: Vite + React 19 (`company-docs/`)
- 전환 원칙: `src2`가 SSOT, `src`는 legacy.
- 엔트리: `company-docs/src2/app/main.tsx`
- 전역 Suspense/ErrorBoundary: `company-docs/src2/app/App.tsx`에만 존재.
- 라우팅 SSOT: `company-docs/src2/app/nav/navConfig.ts`
  - NavItem은 loader만 사용(component 금지)
  - loader 시그니처: `() => Promise<{ default: React.ComponentType<any> }>`
- `React.lazy(loader)` 적용 위치: `company-docs/src2/app/routes/routes.tsx`만 허용.
- `@legacy` import 허용 범위: `src2/app/**`만. `src2/kernel/**` 금지.
- 경로(path) 변경 금지, 이관 시 loader 타겟만 교체.

## 5) alias
- `@app2` -> `src2/app`
- `@kernel` -> `src2/kernel`
- `@legacy` -> `src`

## 6) kernel/data 규칙
- localStorage 직접 접근 금지, repo + storage adapter 사용.
- storage key는 `src2/kernel/repo/keys.ts`에서만 정의.
- UI는 domain repo(`src2/kernel/repo/domain/*`)만 사용, `impl/*` 직접 사용 금지.

## 7) CSS 규칙
- 전역 reset: `main.tsx`에서 `@legacy/index.css` import.
- shell 스타일: `company-docs/src2/app/shell/shell.css`.

## 8) 개발 워크플로우
- dev: `npm run dev` (workdir: `company-docs`)
- build gate: `npm run build`
- lint: `npm run lint`

## 9) docs 워크플로우 (SSOT)
- 시작 문서: `company-docs/src2/docs/DOCS_GUIDE.md`
- 규칙: `company-docs/src2/docs/rule/main_rule.md`
- 상태: `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
- 게이트: `company-docs/src2/docs/rule/GATES_CHECKLIST.md`
- 코드/문서 변경이 발생한 턴은 반드시 result 작성:
  - `company-docs/src2/docs/result/{topic}/NNN-title.md`
  - 간단한 의견 + 다음 진행 질문 포함.
- result 파일 번호 운영:
  - 짧거나 중요도가 낮은 작업은 현재 진행 중인 result 파일에 덧붙여 기록한다(새 번호 생성 금지).
  - 번호를 올리는 시점은 "다음 작업이 명확히 시작될 때"로 한정한다.
  - 긴 작업/중요 작업(범위 큼, 의사결정 큼, 검증 항목 많음)만 새 번호 파일을 생성한다.

## 10) 항상 빠른 점검
- 런타임 우선 해결, TS 빨간줄은 빌드 실패 근거 없으면 후순위.
- 키 유니온 타입에서 `string` 남용 금지(`DraftKey` 등 강타입 사용).
- 계약 sync/async 일관성 유지 + 가벼운 가드레일(예: 키 prefix 검증).
- draft 연결 화면은 작성 페이지 우상단에 "초기화" 버튼 배치.




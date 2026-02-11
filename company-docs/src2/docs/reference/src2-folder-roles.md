# src2 폴더 구조/파일 역할 맵 (최신)

작성일: 2026-02-10
목적: src2 전체 구조에서 “어디에 무엇을 둬야 하는지”를 빠르게 판단하기 위한 참조 문서

---

## 1) 상위 구조
- `src2/app`
  - 화면/라우팅/페이지 조립 계층
- `src2/kernel`
  - 도메인 정본 타입/저장소/공통 컴포넌트 계층
- `src2/docs`
  - 규칙/로드맵/결과 문서 계층

---

## 2) app 계층 역할

### `src2/app/main.tsx`
- 앱 엔트리(전역 CSS + Router 연결)

### `src2/app/App.tsx`
- 전역 ErrorBoundary/Suspense 및 라우트 진입점

### `src2/app/nav`
- `navConfig.ts`: 경로/메뉴/loader SSOT
- `navModel.ts`: breadcrumb/탭 등 파생 모델

### `src2/app/routes`
- `routes.tsx`: loader -> lazy route 변환 및 라우트 렌더

### `src2/app/shell`
- 상단 네비/브랜드/레이아웃 공통 셸

### `src2/app/components`
- 페이지 공통 조립 컴포넌트(MenuPage 등)

### `src2/app/pages`
- 기능 페이지 구현(등록/관리/조회/홈)
- 권장 패턴:
  - `Page.tsx`(얇은 조립)
  - `hooks/useXxxPage.ts`(상태/동작)
  - `sections/*`(UI 분리)

---

## 3) kernel 계층 역할

### `src2/kernel/repo`
- `keys.ts`: storage key SSOT
- `types.ts`: Repo/DocRepo 계약
- `impl/*`: 저장소 구현(local/server)
- `domain/*Repo.ts`: UI가 직접 쓰는 도메인 repo

### `src2/kernel/draft`
- draft key/저장/복원 공통 로직
- 페이지 draft는 여기만 경유

### `src2/kernel/schema`
- 도메인 타입/정규화/상태 판정 helper
- 예: `partner`, `vehicle`, `daily` 하위

### `src2/kernel/components`
- 공통 UI SSOT
- 현재 주요 공통:
  - `master/MasterFormHeader`
  - `status/StatusBadge`
  - `recent/BaseRecentList`
  - `profiles/ProfilesEditor`
  - `contacts/ContactsEditor`
  - `manage/ManageInfoNotice`

### `src2/kernel/utils`
- 순수 유틸(전화번호, id 생성 등)

---

## 4) docs 계층 역할

### `src2/docs/rule`
- 하드룰/상태판/게이트/결정로그/보안체크

### `src2/docs/roadmap`
- phase별 실행 계획/체크리스트/work-order

### `src2/docs/reference`
- 구조/기능파일/역할 참조 문서(이 문서 포함)

### `src2/docs/result`
- 작업 결과 기록(번호 파일)

---

## 5) 파일 배치 기준(실무 룰)
- 새 페이지를 만들면:
  - 라우트 연결: `app/nav/navConfig.ts`
  - 저장: `kernel/repo/domain/*Repo.ts`
  - 타입/판정: `kernel/schema/*`
  - 임시입력: `kernel/draft/*`
- 중복 UI가 2개 이상 페이지에서 보이면:
  - `app/pages/*/sections`에서 꺼내 `kernel/components/*`로 승격

---

## 6) 현재 운영 메모
- `src`는 legacy, `src2`가 SSOT.
- browse는 현재 참조용 유지(요청 기준).
- register daily는 일부 legacy, manage daily는 src2 전환 중이므로 저장 경로 정합을 우선 점검한다.

# 엑셀등록 허브(/excel) 이관 플랜 문서화

> 작성일: 2026-02-10
> 주제: 레거시 엑셀 허브를 src2로 안전 이관하면서 다중 포맷 통합 확장까지 대비하는 구조 확정

---

## 변경 요약
- `/excel` 이관 전용 작업순서표를 신규 작성했다.
- 1차 목표를 "동작 보존형 MIGRATED"로 고정하고, 2차 목표를 "다중 포맷 통합"으로 분리했다.
- KORA 1열 + 기타 포맷 2열 확장 구조를 반영할 수 있도록 `app/pages/excel` + `kernel/adapters/excel` + `kernel/schema/excel` 골격을 문서에 명시했다.

## 추가/수정 문서
- 신규: `company-docs/src2/docs/roadmap/phase5/work-order-excel-import-hub-migration.md`
  - 범위 원칙(1차 동작 보존, 2차 통합 확장)
  - 권장 폴더/파일 구조
  - 통합 설계 포인트(`sourceId`, `sourceRowId`, `canonicalId`, `mergePolicy`)
  - 게이트(build/smoke/URL 새로고침)와 1차 DoD
- 수정: `company-docs/src2/docs/roadmap/phase5/roadmap.md`
  - Factory 연동 문서 목록에 엑셀 허브 작업순서표 링크 추가

## 적용 의도
- 지금은 기존 src 엑셀등록을 "그대로 가져오는" 목적에 집중한다.
- 동시에 나중에 A/B/AB+C 형태의 상호 보완 엑셀을 병합할 수 있도록 구조적 확장 지점을 먼저 고정한다.

## 추가 실행 결과 (1.5단계)
- `src2`에 `/excel` 브리지 셸을 생성하고 loader를 src2로 교체했다.
  - `src2/app/pages/excel/ExcelImportHubPage.tsx`
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
  - `src2/app/pages/excel/sections/ExcelHubBridgeSection.tsx`
- 내부 동작은 legacy 컴포넌트를 래핑해 보존했다.
  - `ExcelHubBridgeSection` -> `@legacy/app/pages/home/ExcelImportHub` 렌더
- `src2/app/nav/navConfig.ts`의 `/excel` loader를 `@app2/pages/excel/ExcelImportHubPage`로 전환했다.
- 게이트:
  - `npm.cmd run build` 성공
  - `npm run test:smoke`는 현재 환경에서 timeout 발생(후속 재검증 필요)
  - 대체 검증으로 `http://localhost:5173/excel` 200 확인

다음 질문: 다음 단계로 2차 준비(`kernel/adapters/excel/common` 최소 타입 + 소스별 래퍼 파일)까지 이어서 만들까?

## 핵심 로직 3줄
- 1) `/excel` 라우트 loader를 `@legacy`에서 `@app2/pages/excel/ExcelImportHubPage`로 교체했다.
- 2) src2 엑셀 허브는 `ExcelHubBridgeSection`에서 legacy 허브를 래핑해 동작 동일성을 유지했다.
- 3) 빌드 성공 + `/excel` 200 응답으로 1차 브리지 이관의 런타임 진입 경로를 검증했다.

## 입문자 설명 3줄
- 1) 먼저 페이지 입구(`/excel`)만 src2로 바꾸고, 내부는 기존 코드를 잠깐 재사용하면 안전하게 이동할 수 있다.
- 2) 이렇게 하면 사용자는 기존처럼 쓰면서도, 코드 구조는 src2 기준으로 정리가 시작된다.
- 3) 이후에 파서/병합 로직은 별도 단계로 천천히 옮겨도 된다.

## 주의 사항
- 패턴 반복 이관 구간이라, 파서/타입 이동 중 import 경로 누락이나 타입 불일치가 숨어 있을 수 있다.
- 1차에서 병합 엔진까지 욕심내면 범위가 폭증해 일정과 안정성이 동시에 무너질 가능성이 있다.

## 향후 과정
- 다음 작업은 `kernel/adapters/excel/common`부터 최소 타입을 만들고, partner/weighing/vehicle 파서를 "이동"이 아니라 "래핑"으로 연결해야 한다.
- smoke 타임아웃 원인은 별도로 정리해야 하며, 해결 전까지는 build + 핵심 경로 수동 200 확인을 병행 게이트로 유지한다.

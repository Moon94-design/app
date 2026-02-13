# src2 현재 상태 분석 패킷 (외부 분석 AI 전달용 + Codex 자체 분석)

> 작성일: 2026-02-13
> 주제: docs SSOT 참조 기반 src2 로딩 구조/현재 상태 정밀 요약
> 이슈 상태: Resolved

---

## 1) 범위와 근거
- 분석 기준 문서:
- `company-docs/src2/docs/DOCS_GUIDE.md`
- `company-docs/src2/docs/rule/main_rule.md`
- `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
- `company-docs/src2/docs/rule/GATES_CHECKLIST.md`
- `company-docs/src2/docs/rule/SECURITY_CHECKLIST.md`
- `company-docs/src2/docs/reference/src2-folder-roles.md`
- `company-docs/src2/docs/reference/feature-files-map-unified.md`
- `company-docs/src2/docs/reference/register-daily-files.md`
- 코드 스캔 범위:
- `company-docs/src2/app/**`
- `company-docs/src2/kernel/**`
- `company-docs/vite.config.ts`, `company-docs/tsconfig.app.json`, `company-docs/index.html`, `company-docs/scripts/security-check.mjs`
- 실행 검증(2026-02-13):
- `npm run build` PASS
- `npm run check:security` PASS
- `npm run check:qa` PASS

## 2) 외부 AI용 TL;DR
- 엔트리 SSOT는 `company-docs/index.html` -> `company-docs/src2/app/main.tsx` 단일 경로다.
- 라우팅 SSOT는 `company-docs/src2/app/nav/navConfig.ts` 하나다.
- 동적 로딩은 `company-docs/src2/app/routes/routes.tsx`에서만 `React.lazy(loader)`로 수행한다.
- 전체 라우트 37개 중 `@app2` 로더 32개, `@legacy` 로더 5개다.
- `@legacy` 5개는 전부 browse 상세(` /browse/* `)다.
- `src2/app/pages/**`에서 `@legacy` import는 0건이다.
- `src2/app/pages/**`에서 `repo/impl` 직접 import는 0건이다.
- 보안 자동점검(`scripts/security-check.mjs`) 현재 PASS다.

## 3) 로딩 메인 체인 (파일을 느리게 훑는 AI용 핵심)
1. HTML 엔트리
- `company-docs/index.html:11`
- `<script type="module" src="/src2/app/main.tsx"></script>`

2. React 엔트리
- `company-docs/src2/app/main.tsx:7`
- `BrowserRouter(basename=import.meta.env.BASE_URL)` + `<App />`
- 전역 CSS reset은 `@legacy/index.css`를 여기서 1회 import

3. 전역 경계
- `company-docs/src2/app/App.tsx:8`
- `ErrorBoundary` -> `Suspense(fallback=Loading)` -> `AppRoutes`

4. 라우트 생성기
- `company-docs/src2/app/routes/routes.tsx:25`
- `flattenRoutes(NAV_CONFIG)` -> `loader` 있는 항목만 필터 -> `lazy(loader)` -> `<Route>` 매핑
- `Suspense`는 여기 없음 (전역 App.tsx 고정)

5. 라우트/메뉴 SSOT
- `company-docs/src2/app/nav/navConfig.ts`
- path/label/loader 정의
- URL path는 유지, 이관은 loader target만 교체하는 정책

6. 셸/네비 파생
- `company-docs/src2/app/nav/navModel.ts`
- breadcrumb/quickTabs 파생
- `company-docs/src2/app/shell/Shell.tsx`
- 상단 레이아웃, breadcrumb, quickTabs, theme 저장(스토리지 어댑터 경유)

## 4) 라우트 로더 전수표 (37개)
| path | loader target | 로더 출처 |
|---|---|---|
| `/` | `@app2/pages/home/HomeMainPage` | src2 |
| `/excel` | `@app2/pages/excel/ExcelImportHubPage` | src2 |
| `/register` | `@app2/pages/register/RegisterHomePage` | src2 |
| `/register/master` | `@app2/pages/register/RegisterMasterPage` | src2 |
| `/register/master/partner` | `@app2/pages/partner/PartnerRegisterPage` | src2 |
| `/register/master/vehicle` | `@app2/pages/vehicle/VehicleRegisterPage` | src2 |
| `/register/master/vendor` | `@app2/pages/vendor/VendorRegisterPage` | src2 |
| `/register/master/agency` | `@app2/pages/agency/AgencyRegisterPage` | src2 |
| `/register/master/employee` | `@app2/pages/employee/EmployeeRegisterPage` | src2 |
| `/register/master/equipment` | `@app2/pages/equipment/EquipmentRegisterPage` | src2 |
| `/register/master/consumable` | `@app2/pages/consumable/ConsumableRegisterPage` | src2 |
| `/register/daily` | `@app2/pages/register/RegisterDailyPage` | src2 |
| `/register/daily/logistics` | `@app2/pages/register/RegisterLogisticsDailyPage` | src2 |
| `/register/daily/office` | `@app2/pages/register/RegisterOfficeDailyPage` | src2 |
| `/register/daily/production` | `@app2/pages/register/RegisterProductionDailyPage` | src2 |
| `/register/daily/issue` | `@app2/pages/register/RegisterIssuePage` | src2 |
| `/register/daily/action` | `@app2/pages/register/RegisterActionPage` | src2 |
| `/manage` | `@app2/pages/manage/ManageHomePage` | src2 |
| `/manage/master` | `@app2/pages/manage/ManageMasterPage` | src2 |
| `/manage/master/partner` | `@app2/pages/partner/PartnerManagePage` | src2 |
| `/manage/master/vehicle` | `@app2/pages/manage/ManageVehiclePage` | src2 |
| `/manage/master/vendor` | `@app2/pages/manage/ManageVendorPage` | src2 |
| `/manage/master/agency` | `@app2/pages/manage/ManageAgencyPage` | src2 |
| `/manage/master/employee` | `@app2/pages/manage/ManageEmployeePage` | src2 |
| `/manage/master/equipment` | `@app2/pages/manage/ManageEquipmentPage` | src2 |
| `/manage/master/consumable` | `@app2/pages/manage/ManageConsumablePage` | src2 |
| `/manage/daily` | `@app2/pages/manage/ManageDailyPage` | src2 |
| `/manage/daily/logistics` | `@app2/pages/manage/ManageLogisticsPage` | src2 |
| `/manage/daily/production` | `@app2/pages/manage/ManageProductionPage` | src2 |
| `/manage/daily/issue` | `@app2/pages/manage/ManageIssuePage` | src2 |
| `/manage/daily/action` | `@app2/pages/manage/ManageActionPage` | src2 |
| `/browse` | `@app2/pages/browse/BrowseHomePage` | src2 |
| `/browse/master` | `@legacy/app/pages/browse/BrowseMaster` | legacy |
| `/browse/daily` | `@legacy/app/pages/browse/BrowseDaily` | legacy |
| `/browse/price` | `@legacy/app/pages/browse/BrowsePrice` | legacy |
| `/browse/weighing-trend` | `@legacy/app/pages/browse/BrowseWeighingMonthlyTrend` | legacy |
| `/browse/weighing-price` | `@legacy/app/pages/browse/BrowseWeighingUnitPrice` | legacy |

## 5) 폴더/의존 스냅샷 (2026-02-13)
- 파일 수:
- `src2` 전체 457 파일
- `src2/app` 154 파일
- `src2/kernel` 96 파일
- `src2/docs` 206 파일
- `src2/app/pages` 143 파일
- `src2/app/pages` 내 TS/TSX: 142개
- 규칙 위반 탐지 요약:
- `src2/app/pages/**`의 `@legacy` import: 0
- `src2/app/pages/**`의 `repo/impl` 직접 import: 0
- `React.lazy` 사용 위치: `src2/app/routes/routes.tsx`만 실제 호출
- 구조 리스크(파일 크기):
- 350 LOC 초과 파일 1개
- `company-docs/src2/app/pages/partner/PartnerRegisterPage.tsx` (395 LOC)
- 500 LOC 초과 파일 0개

## 6) 데이터 계층 요약 (kernel 중심)
- 저장소 계약 SSOT:
- `company-docs/src2/kernel/repo/types.ts`
- `RepoContract<T>`, `DocRepoContract<D,I>`, `StorageAdapter`
- 저장소 키 SSOT:
- `company-docs/src2/kernel/repo/keys.ts`
- domain repo(페이지가 직접 쓰는 레이어):
- `company-docs/src2/kernel/repo/domain/partnerRepo.ts`
- `company-docs/src2/kernel/repo/domain/vehicleRepo.ts`
- `company-docs/src2/kernel/repo/domain/vendorRepo.ts`
- `company-docs/src2/kernel/repo/domain/agencyRepo.ts`
- `company-docs/src2/kernel/repo/domain/employeeRepo.ts`
- `company-docs/src2/kernel/repo/domain/equipmentRepo.ts`
- `company-docs/src2/kernel/repo/domain/consumableRepo.ts`
- `company-docs/src2/kernel/repo/domain/dailyRepo.ts`
- `company-docs/src2/kernel/repo/domain/issueRepo.ts`
- `company-docs/src2/kernel/repo/domain/actionRepo.ts`
- `company-docs/src2/kernel/repo/domain/weighingRepo.ts`
- `company-docs/src2/kernel/repo/domain/partnerBulkSnapshotRepo.ts`
- 구현체(페이지 직접 import 금지):
- `company-docs/src2/kernel/repo/impl/localRepo.ts`
- `company-docs/src2/kernel/repo/impl/serverRepo.ts`(스텁)
- draft 공통:
- `company-docs/src2/kernel/draft/draftKeys.ts`
- `company-docs/src2/kernel/draft/draftRepo.ts`
- `company-docs/src2/kernel/draft/useDraft.ts`

## 7) 도메인별 구현 밀도(외부 AI가 우선 볼 구간)
- `register` 폴더 49파일:
- 일일 등록 훅이 세분화되어 있음(`hooks/logistics`, `hooks/action`, `hooks/production`, `hooks/office`)
- 핵심 오케스트레이션 훅:
- `company-docs/src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- `company-docs/src2/app/pages/register/hooks/useRegisterProductionPage.ts`
- `company-docs/src2/app/pages/register/hooks/useRegisterOfficePage.ts`
- `company-docs/src2/app/pages/register/hooks/useRegisterIssuePage.ts`
- `company-docs/src2/app/pages/register/hooks/useRegisterActionPage.ts`
- `manage` 폴더 40파일:
- 상세 관리 페이지 + hooks + sections 분해 구조
- `excel` 폴더 13파일:
- 업로드 허브 페이지 + 파서 브리지 + 결과 뷰
- 선택 사이트 상태도 현재는 storage adapter 경유로 저장

## 8) 현재 이관 상태 해석 포인트
- 문서상 분포(`MIGRATION_STATUS`): MIGRATED 19 / SHADOW 7
- 코드상 로더 분포: src2 32 / legacy 5
- 해석 차이 이유:
- `manage`, `manage/master`는 로더는 src2지만 문서 상태는 SHADOW로 관리 중
- 즉, 로더 출처와 운영 상태 코드는 완전히 같은 축이 아님
- 남은 legacy 로더는 browse 상세 5개다.

## 9) Codex 자체 분석 (진단)
- 강점:
- 엔트리/라우트/로더 정책이 한곳에 모여 있어 추적이 빠름
- 금지 규칙(`@legacy`, `repo/impl`, direct localStorage`)이 자동 점검으로 강제됨
- register daily 쪽은 hook/command 분리로 유지보수성이 이전보다 좋아짐
- 리스크:
- browse 상세 5개는 여전히 legacy 로더이므로 회귀 지점이 집중됨
- `PartnerRegisterPage.tsx`가 395 LOC로 maintainability 룰의 경고 구간에 있음
- `MIGRATION_STATUS`의 상태 코드와 nav loader 출처가 일부 다르게 보일 수 있어 외부 분석 AI가 오판할 수 있음
- 권장 다음 분석 순서:
1. browse 상세 5개의 데이터 계약(`repo/schema`) 먼저 역매핑
2. `manage`/`manage/master`를 SHADOW로 두는 기준(운영 정의)을 문서에 1줄로 명문화
3. `PartnerRegisterPage.tsx`를 section/hook 추가 분해 후보로 검토

## 10) 외부 분석 AI에 바로 넘길 최소 읽기 세트 (우선순위)
1. `company-docs/src2/docs/rule/main_rule.md`
2. `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
3. `company-docs/src2/app/main.tsx`
4. `company-docs/src2/app/App.tsx`
5. `company-docs/src2/app/routes/routes.tsx`
6. `company-docs/src2/app/nav/navConfig.ts`
7. `company-docs/src2/kernel/repo/types.ts`
8. `company-docs/src2/kernel/repo/keys.ts`
9. `company-docs/src2/kernel/repo/impl/localRepo.ts`
10. `company-docs/src2/kernel/draft/useDraft.ts`
11. `company-docs/src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
12. `company-docs/src2/app/pages/excel/hooks/useExcelImportHubPage.ts`

## 11) 간단한 의견 + 다음 진행 질문
- 의견: 지금 상태는 “코어 규칙은 안정, 남은 리스크는 browse SHADOW 집중”으로 정리된다.
- 다음 진행 질문: 다음 턴에서 browse 5개 중 어떤 페이지(`/browse/master`, `/browse/daily`, `/browse/price`, `/browse/weighing-trend`, `/browse/weighing-price`)를 1순위로 이관할지 지정해줘.

## 핵심 로직 3줄
- 1) 엔트리 로딩은 `index.html -> src2/app/main.tsx -> App.tsx -> routes.tsx` 단일 체인으로 고정되어 있다.
- 2) 실제 페이지 로딩 소스는 `navConfig.loader` 37개가 전부이며, 동적 import 전환 지점은 `routes.tsx` 하나다.
- 3) 저장/드래프트는 `kernel/repo + kernel/draft + jsonStorage adapter` 경유로 통일되고 보안 점검 스크립트로 강제된다.

## 입문자 설명 3줄
- 1) 이 앱은 어디서 시작해서 어떤 파일을 거쳐 화면이 뜨는지 길이 딱 정해져 있어.
- 2) 메뉴/경로 목록(`navConfig`)만 보면 어떤 페이지가 새 코드인지 레거시인지 바로 알 수 있어.
- 3) 데이터 저장은 공용 창구(repo/draft)로만 하게 막아둬서, 아무 파일에서 제멋대로 저장하지 못하게 해놨다.

## 주의 사항
- 라우트 출처(src2/legacy)와 문서 상태 코드(MIGRATED/SHADOW)가 일부 다르기 때문에, 둘을 같은 의미로 단순 매칭하면 분석이 틀릴 수 있다.

## 향후 과정
- 다음 작업에서 `browse` 5개 이관을 시작하면 `navConfig` loader 변경, `MIGRATION_STATUS` 갱신, `GATES_CHECKLIST` G5 재검증, 관련 result 파일 업데이트가 연쇄로 필요하다.

## 이슈 상태
- `Resolved`: 외부 분석 AI가 느린 파일 스캔 없이 바로 분석할 수 있는 수준의 현재 상태 문서화와 Codex 진단을 완료했다.

MIGRATION_STATUS.md
작성일: 2026-02-13
목적: src → src2 전환 현황판. "지금 어디까지 했는지" 한 눈에 관리.

상태 코드
- LEGACY: src 기반(레거시). 아직 src2에서 연결 안 됨.
- SHADOW: src2가 메인(Shadow Router). component는 @legacy lazy.
- MIGRATED: src2/app/pages로 이관 완료. @legacy import 0. @kernel만 사용.
- NEW: 신규 페이지(src2에서 새로 추가). 레거시 대응 없음.
- PLANNED: 신규 페이지 예정. 아직 코드 없음.
- BLOCKED: 진행 막힘(원인/해결 필요).

게이트
- G0: 엔트리 전환(빌드/런/CSS/폰트/Provider)
- G1: Shadow Router(메뉴/경로 동일, lazy fallback, ErrorBoundary, 새로고침)
- G2+: 이후 단계에서 추가될 게이트(Repo/Draft/Page DoD 등)

================================================================================
A) 기반 단계 현황 (Phase 1: 0~1단계)
[x] G0 완료 (index.html / tsconfig / vite alias / src2/app/main.tsx / App.tsx)
[x] G1 완료 (src2 navConfig/navModel/routes/Shell + legacy lazy 100%)

메모:
- 실패 로그/이슈는 DECISIONS_LOG 또는 별도 ISSUE_LOG에 남김.

================================================================================
B) 페이지/기능 이관 현황
형식:
- 기능군 | 항목(페이지) | 현재 상태 | 대상 경로 | 현재 component | 의존 도구(@kernel) | 게이트 | 메모/TODO
표시:
- [x] 완료(MIGRATED)
- [ ] 미완료(LEGACY/SHADOW/NEW/PLANNED/BLOCKED)

--- 홈/공통 ---
- [x] HOME   | / 홈                         | MIGRATED | @app2/pages/home/HomeMainPage               | src2 메뉴 페이지로 이관 |
- [x] HOME   | /excel 엑셀등록              | MIGRATED | @app2/pages/excel/ExcelImportHubPage           | src2 native 파서/패널 전환 완료(@legacy 0), 기타 포맷(kora/hometax/extra 확장)은 phase5-excel 후속 |

--- 등록 > 기준정보(마스터) ---
- [x] REG    | /register 등록 홈            | MIGRATED | @app2/pages/register/RegisterHomePage         | src2 메뉴 페이지로 이관 |
- [x] REG    | /register/master 기준정보 홈 | MIGRATED | @app2/pages/register/RegisterMasterPage       | src2 메뉴 페이지로 이관 |
- [x] MASTER | /register/master/partner 거래처  | MIGRATED | @app2/pages/partner/PartnerRegisterPage  | @kernel(schema/repo/draft) | G4 | 파일럿 적용, G4 통과
- [x] MASTER | /register/master/vehicle 차량    | MIGRATED | @app2/pages/vehicle/VehicleRegisterPage  | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/vendor 서비스 업체 | MIGRATED | @app2/pages/vendor/VendorRegisterPage   | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/agency 관계 기관 | MIGRATED | @app2/pages/agency/AgencyRegisterPage   | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/employee 직원   | MIGRATED | @app2/pages/employee/EmployeeRegisterPage | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/equipment 설비  | MIGRATED | @app2/pages/equipment/EquipmentRegisterPage | @kernel(schema/repo/draft) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/consumable 소모품| MIGRATED | @app2/pages/consumable/ConsumableRegisterPage | @kernel(schema/repo/draft) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |

--- 등록 > 일일기록 ---
- [x] REG    | /register/daily 일일기록 홈      | MIGRATED | @app2/pages/register/RegisterDailyPage          | src2 메뉴 페이지로 이관 |
- [x] DAILY  | /register/daily/logistics 물류   | MIGRATED | @app2/pages/register/RegisterLogisticsDailyPage | @kernel(repo/schema/draft) | BUILD OK, smoke route 200, check:qa PASS(2026-02-13) |
- [x] DAILY  | /register/daily/office 사무      | MIGRATED | @app2/pages/register/RegisterOfficeDailyPage | @kernel(repo/draft) | BUILD OK, recent 삭제 복원 + agency fallback id 안정화 |
- [x] DAILY  | /register/daily/production 생산  | MIGRATED | @app2/pages/register/RegisterProductionDailyPage | @kernel(repo/draft/schema) | BUILD OK |
- [x] ISSUE  | /register/daily/issue 이슈       | MIGRATED | @app2/pages/register/RegisterIssuePage          | @kernel(repo/draft) | build OK
- [x] ACTION | /register/daily/action 조치      | MIGRATED | @app2/pages/register/RegisterActionPage          | @kernel(repo/draft) | BUILD OK, check:qa PASS(2026-02-13)

--- 관리 ---
- [ ] MANAGE | /manage 관리 홈                  | SHADOW | @app2/pages/manage/ManageHomePage      | 셸 이관 완료, 상세 도메인 리뉴얼 필요 |
- [ ] MANAGE | /manage/master 기준정보 관리     | SHADOW | @app2/pages/manage/ManageMasterPage    | partner/vehicle/vendor/agency/employee/equipment/consumable src2 이관 완료, 운영 정합 리뉴얼 필요 |
- [x] MANAGE | /manage/daily 일일기록 관리      | MIGRATED | @app2/pages/manage/ManageDailyPage   | logistics/production/issue/action 상세 src2 이관 완료 |

--- 조회 ---
- [x] BROWSE | /browse 조회 홈                  | MIGRATED | @app2/pages/browse/BrowseHomePage                | src2 메뉴 페이지로 이관 |
- [ ] BROWSE | /browse/master 기준정보 조회     | SHADOW | @legacy/app/pages/browse/BrowseMaster              | 기능참조용(운영 제외), 추후 신규 browse 재작성 대상 |
- [ ] BROWSE | /browse/daily 일일기록 조회      | SHADOW | @legacy/app/pages/browse/BrowseDaily               | 기능참조용(운영 제외), 추후 신규 browse 재작성 대상 |
- [ ] BROWSE | /browse/price 단가               | SHADOW | @legacy/app/pages/browse/BrowsePrice               | 기능참조용(운영 제외), 추후 신규 browse 재작성 대상 |
- [ ] BROWSE | /browse/weighing-trend 물량추세  | SHADOW | @legacy/app/pages/browse/BrowseWeighingMonthlyTrend| 기능참조용(운영 제외), 추후 신규 browse 재작성 대상 |
- [ ] BROWSE | /browse/weighing-price 계량단가  | SHADOW | @legacy/app/pages/browse/BrowseWeighingUnitPrice   | 기능참조용(운영 제외), 추후 신규 browse 재작성 대상 |

================================================================================
C) kernel 정본화 현황 (초기)
- [x] REPO  | types.ts(RepoContract/DocRepoContract) | DONE
- [x] REPO  | keys.ts(Storage key SSOT) | DONE
- [x] REPO  | storage/jsonStorage.ts(pageStorage adapter) | DONE
- [x] REPO  | impl/localRepo.ts | DONE
- [x] REPO  | impl/serverRepo.ts(스텁) | DONE
- [x] REPO  | domain/*Repo.ts | DONE (dailyRepo/partnerRepo)

- [x] DRAFT | draftKeys.ts(도메인 키 규칙) | DONE
- [x] DRAFT | useDraft.ts(P0/P1) | DONE (P0)
- [x] DRAFT | draftRepo.ts(repo 기반) | DONE

================================================================================
D) 이번 주(또는 현재 스프린트) 목표
- 현재 분포: MIGRATED 19 / SHADOW 7
- 목표 1: 일일기록 우선 리뉴얼 — 유통 마감 + 유통 제외 4페이지(office/production/issue/action) 1차 리뉴얼
- 목표 2: 기준페이지 리뉴얼 배치 착수(/manage, /manage/master + 구조개선)
- 목표 3: 엑셀등록 리뉴얼 착수(신규 종류 스펙/매핑부터)
- 목표 4: G5는 배치 검증 모드로 운영(build 필수 + security/qa 조건부 1회)

================================================================================
E) 실행 큐 (2026-02-13 기준, browse 참조용 제외)
- [x] 0. D0 일일 정합성 리뉴얼 설계 SSOT 확정(legacy sync/ID/merge/reset/security 범위)
- [ ] 1. D1 유통 리뉴얼 마감(회귀/문서/게이트 마감)
- [ ] 2. D2 유통 제외 일일기록 4페이지 리뉴얼 1차
- [ ] 3. D3 일일기록 신규페이지 스펙/작업순서 고정
- [ ] 4. M1 기준페이지 리뉴얼 배치 1(/manage, /manage/master)
- [ ] 5. X1 엑셀등록 리뉴얼 배치 1(신규 종류 스펙/매핑)
- [ ] 6. X2 엑셀등록 신규 종류 구현 1차

================================================================================
F) 2026-02-12 보강 메모
- 분포 카운트 갱신: MIGRATED 19 / SHADOW 7
- /register/daily/production 품질 보강 완료
  - writerName 필수 검증 추가(문서 ID 충돌 방지)
  - 자동 제목 입력 공용화(AutoTitleField)
  - 태그 기능 공용화(TagBlock/TagInputText + tagIndex)
- /register/daily/logistics 운영 규칙 보강 완료
  - 종류(PP/PE)와 품목(압축품/분쇄품/펠렛/스크랩/폐기물/폐수) 선택 구조 재정의
  - 매입+스크랩 세부 품목(기본 + 직접입력) 도입 및 재사용
  - 거래처 최근 1회 라인 기반 1차 자동 선택 + 저장 시 거래처 프로필 자동 동기화
- register daily 공통 상단 4항목 통합 완료
  - 공통 컴포넌트: `DailyMetaFields` (기록일/지부/작성자/직책)
  - 공통 지부 SSOT: `siteOptions.ts` (`DAILY_BRANCH_OPTIONS`)
  - production/office/issue/action/logistics 모두 `지부` 명칭 통일 적용
- register daily 추가 보정 완료
  - 지부 옵션을 `대구/성주`로 정정(`경주` 제거, legacy `경주 -> 성주` 정규화)
  - 유통 단가 자동추천 로직을 수동 수정 가능 방식으로 변경(거래처/품목 변경 시에만 자동 갱신)
  - 유통 타입 UI에서 처리 방향은 `종류(폐기물/폐수)`만 노출, `품목` 라벨 숨김
  - 유통/이슈/조치 제목 템플릿을 태그 접두사 규칙(`[일일][유통]`, `[이슈][일일][유통]`, `[조치][일일][유통]`)으로 정리
- 당시 기준 다음 순차 이관 큐: /browse/master (현 시점에서는 기능참조용으로 전환)

================================================================================
G) 2026-02-13 QA/보안 재검증 메모
- 실행 커맨드: npm run build, npm run check:security, npm run check:qa
- 결과: 모두 PASS
- navConfig loader 집계: 총 37개 중 @app2 32개 / @legacy 5개(모두 browse 상세)
- 보안 금지 패턴 점검 결과:
  - src2/kernel/**의 @legacy import: 0
  - src2/app/pages/**의 repo/impl 직접 import: 0
  - src2 direct localStorage 접근: 0 (kernel/repo/storage/* 예외)

================================================================================
H) 2026-02-13 이후 실행 기준 로드맵
- 문서:
  - `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
  - `company-docs/src2/docs/roadmap/phase5/roadmap.md`
  - `company-docs/src2/docs/roadmap/phase5/daily-renewal-data-consistency-design.md`
- 핵심 우선순위:
  - 1) 일일기록 페이지 우선 리뉴얼
  - 2) 기준페이지 리뉴얼
  - 3) 엑셀등록 리뉴얼
- 참고: browse 기존 페이지는 기능참조용으로 유지하고 신규 재작성은 후순위 별도 트랙으로 분리

================================================================================
I) 2026-02-13 P0 정합성 패치 1차
- 반영 코드:
  - `src2/kernel/repo/domain/issueRepo.ts`
  - `src2/kernel/repo/domain/actionRepo.ts`
  - `src2/app/pages/register/hooks/logistics/merge.ts`
- 반영 내용:
  - issue/action legacy sync를 메타 기반 "1회 이관"으로 고정
  - issue/action legacy id 누락 시 결정론 fallback id 적용
  - action legacy normalize에 확장 필드(writerRole/site/vendorId/vendorCost/tags) 보존 반영
  - logistics line fingerprint에 `site` 추가
  - logistics 제목 생성 시 writer 토큰의 `(작성자)/(직책)/(이름)` 꼬리표 자동 제거
  - logistics 내 이슈/조치 모달의 메타 4항목(기록일/지부/작성자/직책) 잠금 + submit 강제 적용
- 검증(배치 1회):
  - `npm run build` PASS
  - `npm run check:security` PASS
  - `npm run check:qa` PASS
- P0-D 회귀 자동화:
  - 스크립트: `scripts/p0-consistency-regression.ts`, `scripts/alias-loader.mjs`, `scripts/register-aliases.mjs`
  - 명령: `npm run test:p0:consistency` (check:qa에 통합)
  - 검증: issue/action 1회 이관 + 확장 필드 보존 + logistics site dedupe 시나리오 PASS

================================================================================
J) 2026-02-13 유통 등록 하단 항목 UX 보강
- 반영 코드:
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsFormSection.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsFormActions.tsx`
- 반영 내용:
  - 하단 항목 제목을 `거래처-차량번호` 형태로 통합 표시
  - 항목 카드 우측에 수정/삭제 버튼 세로 배치
  - 수정 버튼 클릭 시 상단 유통 폼으로 항목 역주입(수정 모드)
  - 수정 저장 시 기존 항목 자동 정리 삭제로 항목 단위 수정 의미 유지
- 검증:
  - `npm run build` PASS

================================================================================
K) 2026-02-13 내 정보/감사로그/유통 훅 분리 보강
- 반영 코드:
  - `src2/kernel/user/myInfo.ts`
  - `src2/kernel/repo/impl/repoAudit.ts`
  - `src2/kernel/repo/impl/localRepo.ts`
  - `src2/app/shell/Shell.tsx`
  - `src2/app/shell/MyInfoModal.tsx`
  - `src2/app/pages/register/hooks/common/useActorProfileDraftSync.ts`
  - `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - `src2/app/pages/register/hooks/logistics/lineEdit.ts`
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- 반영 내용:
  - 상단바에 `내 정보` 버튼 추가, 이름/직책/지부를 로컬 프로필로 저장
  - 일일 등록 훅(유통/생산/사무/이슈/조치)이 내 정보를 자동 주입 + 메타 잠금
  - repo 공통 계층에서 create/update/delete 감사 이벤트를 자동 기록(페이지별 누락 방지)
  - 유통 훅에서 draft patch / 라인 수정·삭제 로직을 기능 파일로 분리해 파일 비대화 완화
  - 유통 하단 항목 카드에서 제목 아래 세부정보 배치로 간격/폭 체감 개선
  - quick-add 직후 선택 미인식(거래처/차량) 문제를 fallback 선택값 반영으로 수정
  - 선택 id -> 표시값 해석 로직을 `hooks/common/selection.ts`로 공통화하고 action 선택에도 적용
  - 거래처 변경 시 최근 1회 유통 라인의 단가를 자동 반영하고, 거래처 기준 단가는 최근 단가가 없을 때 fallback으로만 적용
  - 처리(방향)도 단가 입력/수정/저장을 허용하도록 단가 선택 규칙 및 draft 자동계산 조건을 보정
  - 거래처 단가 자동반영을 `거래처+방향+종류+품목` 조합 기준 최근 1회 우선 규칙으로 보강
  - 관리 유통 화면은 매입/출고 라인만 표시·수정하고, 처리 라인은 저장 시 보존되도록 분리
- 검증:
  - `npm run check:qa` PASS

================================================================================
L) 2026-02-13 유통 반품 v1(원본 연결/과반품 차단/관리 순중량 기반)
- 반영 코드:
  - `src2/app/pages/register/hooks/logistics/types.ts`
  - `src2/app/pages/register/hooks/logistics/constants.ts`
  - `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - `src2/app/pages/register/hooks/logistics/selectors.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - `src2/app/pages/register/hooks/logistics/lineEdit.ts`
  - `src2/app/pages/register/hooks/logistics/merge.ts`
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `src2/app/pages/register/sections/logistics/ReturnSourcePanel.tsx`
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
- 반영 내용:
  - 반품 라인에 `isReturn + returnSourceRecordId/LineId + sourceDirection/sourceKg/returnedKg` 메타 저장
  - 반품 등록 시 거래처 기준 최근 5건(또는 날짜 필터) 원본 항목 선택 UI 추가
  - 원본 선택 시 방향/종류/품목을 원본 기준으로 고정하고, 차량/단가/중량 기본값 자동 세팅
  - 실제 저장 방향은 내부에서만 반전(매입↔출고) 처리해 품목 호환 불일치 없이 반품 입력 가능
  - 저장 시 원본 존재/방향 정합 검증 + 잔여 중량 초과(과반품) 차단
  - 관리 유통 리스트에 반품 태그(주황) 표시 + 순중량/순금액을 `원본-반품` 기준으로 계산
  - 최근 단가/스크랩 세부품목 자동추천에서 반품 라인 제외
- 검증:
  - `npm run check:qa` PASS

================================================================================
M) 2026-02-13 반품 상태/표시 규칙 문서화 + 기본 체크리스트 신설
- 반영 문서:
  - `src2/docs/roadmap/phase5/logistics-return-status-roadmap.md`
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
  - `src2/docs/roadmap/phase5/roadmap.md`
  - `src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
  - `src2/docs/roadmap/roadmap.md`
- 반영 내용:
  - 반품 상태 표기 기준을 2색(초록/빨강) + 2텍스트(전량/부분)로 고정
  - 반품 중량 표기 형식을 반품기록/반품대상으로 분리해 통일
  - 작업 시작 시 참조할 통합 기본 체크리스트를 신설하고 기존 리뉴얼 체크리스트에서 선참조하도록 연결
- 검증:
  - 문서 변경 배치(코드 변경 없음)

================================================================================
N) 2026-02-13 반품 상태 배지 공용화 + 관리/등록 표시 정렬
- 반영 코드:
  - `src2/kernel/schema/daily/logisticsReturnStatus.ts`
  - `src2/kernel/components/status/ReturnStatusBadge.tsx`
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
- 반영 내용:
  - 반품 상태를 라인 전체 색칠이 아니라 상태 배지(UI 버튼형)로만 표시하도록 통일
  - 배지 규칙을 공용 컴포넌트(`ReturnStatusBadge`)로 분리해 다른 페이지 재사용 가능 상태로 고정
  - 반품 중량 표기를 공용 포맷(`formatReturnWeightText`)으로 통일
    - 반품기록: `반품중량(원중량)`
    - 반품대상: `원중량(반품중량)`
- 문서 반영:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`에
    - "작업 중 반복 리스크 발견 시 체크리스트 즉시 추가 + 채팅 응답에 추가 항목 명시" 항목 추가
  - `src2/docs/reference/feature-files-map-unified.md`에 반품 상태 공용 파일 매핑 추가
- 검증:
  - `npm run build` PASS
  - `npm run check:qa` PASS

================================================================================
O) 2026-02-13 manage 유통 금액 tone 규칙 고정 + 공용 계산 분리
- 반영 코드:
  - `src2/kernel/schema/daily/logisticsAmountView.ts`
  - `src2/kernel/schema/daily/index.ts`
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
- 반영 내용:
  - 유통 라인 금액 계산을 공용 함수(`getLogisticsLineAmountView`)로 분리
  - 관리 펼치기 금액 표시 규칙 고정
    - 일반 라인: 방향 기준 tone(매입=빨강, 출고=초록)
    - 반품대상 라인: 순중량 기준 금액, 전량 반품 시 `0` 흰색
    - 반품기록 라인: 반품중량 기준 참고금액, 흰색 표시(합계 제외)
  - 방향 텍스트도 tone 배지 형태로 표시(라인 전체 배경색 미사용)
- 문서 반영:
  - `src2/docs/reference/feature-files-map-unified.md`에 `logisticsAmountView.ts` 추가
  - `src2/docs/rule/DECISIONS_LOG.md`에 금액 tone/집계 분리 결정 추가
- 검증:
  - `npm run build` PASS
  - `npm run check:qa` PASS

================================================================================
P) 2026-02-13 register 유통 하단 목록 금액 tone 동기화
- 반영 코드:
  - `src2/kernel/components/status/LogisticsAmountTone.ts`
  - `src2/kernel/components/status/index.ts`
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
- 반영 내용:
  - 유통 금액 tone 색상 상수를 공용 파일(`LOGISTICS_AMOUNT_TONE_COLOR`)로 분리
  - register 하단 목록(`SelectedDateLogisticsList`)에 단가/금액 표시 추가
  - 금액 tone 규칙을 manage와 동일하게 적용
    - 일반 라인: 매입=빨강, 출고=초록
    - 반품대상 라인: 순중량 기준 금액(전량 반품 시 `0` 흰색)
    - 반품기록 라인: 참고금액 흰색(합계 제외)
- 문서 반영:
  - `src2/docs/reference/feature-files-map-unified.md`에 `LogisticsAmountTone.ts` 추가
- 검증:
  - `cmd /c npm run build` PASS
  - `cmd /c npm run check:qa` PASS

================================================================================
Q) 2026-02-13 유통 거래처/차량 포함검색 + 체크리스트 체계 개편
- 반영 코드:
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
- 반영 내용:
  - 유통 등록의 거래처/차량 선택을 단일 자동완성 필드로 변경(입력 + 하단 목록)
  - 포함검색(contains) 필터 적용, 입력값이 비어 있을 때 목록 열기 시 전체 옵션 노출
  - 실제 저장은 목록 선택으로만 처리(자유입력 저장 금지)
  - 선택 검색 로직을 공용 컴포넌트로 분리해 다른 페이지 재사용 가능 상태로 고정
- 체크리스트 체계 반영:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md` 상단에 추가 체크리스트 목차/경로 고정
  - 공용화 고정 문구 추가: "공용화 가능한 수정사항은 원본 체크리스트에 즉시 반영 + 참조 경로 기록"
  - `src2/docs/rule/checklist/` (작업별 원본 체크리스트) 신설
  - `src2/docs/rule/checklist-result/` (작업별 작성본) 신설
  - 유통 전용 체크리스트를 일일 공용 체크리스트로 승격
    - 신규: `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
    - 기존: `src2/docs/rule/checklist/logistics-daily-renewal-commonization-checklist.md` (deprecated 안내)
- 문서 반영:
  - `src2/docs/reference/feature-files-map-unified.md`
  - `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
  - `src2/docs/result/phase5-next/031-logistics-filterable-select-and-checklist-system.md`
- 검증:
  - `cmd /c npm run build` PASS

================================================================================
R) 2026-02-13 src2 성과 아카이브 + AI 협업 레벨 진단 문서화
- 반영 문서:
  - `src2/docs/reference/src2-achievement-portfolio-and-level-assessment-2026-02-13.md`
- 반영 내용:
  - src2 기준 구현 구조/기능/문서/검증 체계를 정량(파일/라인/이관률/결과물 누적)으로 집계
  - VSCode + AI 에이전트 협업 기준 세분화 등급표를 추가하고, 현재 역량 위치를 근거 기반으로 진단
  - 다음 성장 과제를 테스트 확장/고LOC 분해/Phase6 설계 구체화로 고정
- 검증:
  - `npm run build` PASS

================================================================================
S) 2026-02-13 생산 선택 UX 공용화 1차 + BASIC 미래대비 체크 강화
- 반영 코드:
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx`
- 반영 내용:
  - 생산 등록의 `생산품/품목` 선택을 단일 자동완성 필드로 전환(포함검색 + 빈 입력 전체 목록)
  - 생산 도메인은 필수 선택 성격을 유지하기 위해 `allowEmpty=false` 적용
  - 선택 입력 공용 컴포넌트에 `allowEmpty` 옵션 추가(도메인별 정책 분기)
- 체크리스트/문서 반영:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`에 조회/서버이관/보안/권한 미래 대비 항목 추가
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`에 미래 대비 섹션(F) 추가
  - `src2/docs/rule/checklist/README.md`에 일일 공용 체크리스트 포함 범위(미래 대비) 명시
  - `src2/docs/reference/feature-files-map-unified.md`에 생산 적용 이력 추가
- 검증:
  - `cmd /c npm run build` PASS

================================================================================
T) 2026-02-13 보안 체크리스트 문구 정렬(전 데이터 민감 취급)
- 반영 문서:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
- 반영 내용:
  - 보안 항목에서 "민감정보 개별 분류" 관점 대신
    "회사 데이터 전량 민감 취급(최소 노출/최소 반출)" 관점으로 문구를 통일
  - 기능/데이터 구분 없이 전체 데이터 보호 전제를 체크리스트 기본값으로 고정
- 검증:
  - 문서 변경 배치(코드 변경 없음)

MIGRATION_STATUS.md
작성일: 2026-02-11
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
- [x] DAILY  | /register/daily/logistics 물류   | MIGRATED | @app2/pages/register/RegisterLogisticsDailyPage | @kernel(repo/schema/draft) | BUILD OK, smoke route 200, check:qa는 기존 security debt 1건으로 FAIL(`useExcelImportHubPage.ts` localStorage) |
- [x] DAILY  | /register/daily/office 사무      | MIGRATED | @app2/pages/register/RegisterOfficeDailyPage | @kernel(repo/draft) | BUILD OK, recent 삭제 복원 + agency fallback id 안정화 |
- [x] DAILY  | /register/daily/production 생산  | MIGRATED | @app2/pages/register/RegisterProductionDailyPage | @kernel(repo/draft/schema) | BUILD OK |
- [x] ISSUE  | /register/daily/issue 이슈       | MIGRATED | @app2/pages/register/RegisterIssuePage          | @kernel(repo/draft) | build OK
- [x] ACTION | /register/daily/action 조치      | MIGRATED | @app2/pages/register/RegisterActionPage          | @kernel(repo/draft) | BUILD OK, check:qa fail(known security debt: `useExcelImportHubPage.ts` localStorage)

--- 관리 ---
- [ ] MANAGE | /manage 관리 홈                  | SHADOW | @app2/pages/manage/ManageHomePage      | 셸 이관 완료, 상세 도메인 이관 필요 |
- [ ] MANAGE | /manage/master 기준정보 관리     | SHADOW | @app2/pages/manage/ManageMasterPage    | partner/vehicle/vendor/agency/employee/equipment/consumable src2 이관 완료 |
- [x] MANAGE | /manage/daily 일일기록 관리      | MIGRATED | @app2/pages/manage/ManageDailyPage   | logistics/production/issue/action 상세 src2 이관 완료 |

--- 조회 ---
- [x] BROWSE | /browse 조회 홈                  | MIGRATED | @app2/pages/browse/BrowseHomePage                | src2 메뉴 페이지로 이관 |
- [ ] BROWSE | /browse/master 기준정보 조회     | SHADOW | @legacy/app/pages/browse/BrowseMaster              | (TBD) |
- [ ] BROWSE | /browse/daily 일일기록 조회      | SHADOW | @legacy/app/pages/browse/BrowseDaily               | (TBD) |
- [ ] BROWSE | /browse/price 단가               | SHADOW | @legacy/app/pages/browse/BrowsePrice               | (TBD) | query(P1) 필요 가능성
- [ ] BROWSE | /browse/weighing-trend 물량추세  | SHADOW | @legacy/app/pages/browse/BrowseWeighingMonthlyTrend| (TBD) | query(P1) 필요 가능성
- [ ] BROWSE | /browse/weighing-price 계량단가  | SHADOW | @legacy/app/pages/browse/BrowseWeighingUnitPrice   | (TBD) | query(P1) 필요 가능성

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
- 목표 1: SHADOW 페이지 이관 완료 우선(리뉴얼은 MIGRATED 이후)
- 목표 2: register/daily SHADOW 4개 이관(logistics/office/production/action)
- 목표 3: browse SHADOW 5개 이관(master/daily/price/weighing-trend/weighing-price)
- 목표 4: G5(check:qa) 운영 루틴을 result 증빙과 함께 고정

================================================================================
E) SHADOW 11 실행 큐 (2026-02-11 기준)
- [x] 1. /register/daily/logistics
- [x] 2. /register/daily/office
- [x] 3. /register/daily/production
- [x] 4. /register/daily/action
- [ ] 5. /browse/master
- [ ] 6. /browse/daily
- [ ] 7. /browse/price
- [ ] 8. /browse/weighing-trend
- [ ] 9. /browse/weighing-price
- [ ] 10. /manage
- [ ] 11. /manage/master

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
- 다음 순차 이관 큐: /browse/master

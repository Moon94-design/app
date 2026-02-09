MIGRATION_STATUS.md
작성일: 2026-02-09
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
- [ ] HOME   | / 홈                         | SHADOW | @legacy/app/pages/home/HomeMain               | (TBD) | 마지막 이관 추천
- [ ] HOME   | /excel 엑셀등록              | SHADOW | @legacy/app/pages/home/ExcelImportHub          | (TBD) |

--- 등록 > 기준정보(마스터) ---
- [ ] REG    | /register 등록 홈            | SHADOW | @legacy/app/pages/register/RegisterHome         | (TBD) |
- [ ] REG    | /register/master 기준정보 홈 | SHADOW | @legacy/app/pages/register/RegisterMaster       | (TBD) |
- [x] MASTER | /register/master/partner 거래처  | MIGRATED | @app2/pages/partner/PartnerRegisterPage  | @kernel(schema/repo/draft) | G4 | 파일럿 적용, G4 통과
- [x] MASTER | /register/master/vehicle 차량    | MIGRATED | @app2/pages/vehicle/VehicleRegisterPage  | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/vendor 매입처   | MIGRATED | @app2/pages/vendor/VendorRegisterPage   | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/agency 중개업체 | MIGRATED | @app2/pages/agency/AgencyRegisterPage   | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/employee 직원   | MIGRATED | @app2/pages/employee/EmployeeRegisterPage | @kernel(schema/repo/draft/utils) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [x] MASTER | /register/master/equipment 설비  | MIGRATED | @app2/pages/equipment/EquipmentRegisterPage | @kernel(schema/repo/draft) | BUILD OK, URL/새로고침(HTTP 재요청) OK, Router 경고 수동확인 필요 |
- [ ] MASTER | /register/master/consumable 소모품| SHADOW | @legacy/app/pages/register/RegisterConsumable| (TBD) |

--- 등록 > 일일기록 ---
- [ ] REG    | /register/daily 일일기록 홈      | SHADOW | @legacy/app/pages/register/RegisterDaily          | (TBD) |
- [ ] DAILY  | /register/daily/logistics 물류   | SHADOW | @legacy/app/pages/register/RegisterLogisticsDaily | (TBD) |
- [ ] DAILY  | /register/daily/office 사무      | SHADOW | @legacy/app/pages/register/RegisterOfficeDaily    | (TBD) |
- [ ] DAILY  | /register/daily/production 생산  | SHADOW | @legacy/app/pages/register/RegisterProductionDaily| (TBD) |
- [ ] ISSUE  | /register/daily/issue 이슈       | SHADOW | @legacy/app/pages/register/RegisterIssue          | (TBD) | DocRepoContract 필요
- [ ] ACTION | /register/daily/action 조치      | SHADOW | @legacy/app/pages/register/RegisterAction         | (TBD) | DocRepoContract 필요

--- 관리 ---
- [ ] MANAGE | /manage 관리 홈                  | SHADOW | @legacy/app/pages/manage/ManageHome    | (TBD) |
- [ ] MANAGE | /manage/master 기준정보 관리     | SHADOW | @legacy/app/pages/manage/ManageMaster  | (TBD) |
- [ ] MANAGE | /manage/daily 일일기록 관리      | SHADOW | @legacy/app/pages/manage/ManageDaily   | (TBD) |

--- 조회 ---
- [ ] BROWSE | /browse 조회 홈                  | SHADOW | @legacy/app/pages/browse/BrowseHome                | (TBD) |
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
- 목표 1: Phase 1(0~1단계) 완료(G0/G1 통과)
- 목표 2: 파일럿 페이지 선정(Partner V2 vs 단순 마스터)
- 목표 3: kernel/repo/types.ts + keys.ts 정본화 착수

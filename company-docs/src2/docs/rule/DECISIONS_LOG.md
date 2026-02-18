DECISIONS_LOG.md
작성일: 2026-02-09
목적: 전환 중 결정/예외/변경사항을 기록해서 길 잃는 것 방지.

기록 규칙(짧게)
- 날짜 | 결정 | 이유 | 대안 | 영향 범위 | 되돌림 비용
- "예외 허용"은 반드시 이유와 종료 조건을 적기.

================================================================================
[결정 기록]

2026-02-09 | src2를 메인 엔트리로 전환(Shadow Router) | 화면 동일 유지 + 점진 이관 | src 유지 후 nav만 스위치 | 엔트리/라우팅/메뉴 | 중

2026-02-09 | navConfig SSOT는 src2/app/nav/navConfig.ts | URL 유지하면서 component만 교체 | feature flag | 전 페이지 라우팅 | 중

2026-02-09 | @legacy import는 src2/app/**만 허용 | kernel 정본 오염 방지 | kernel에서 re-export | kernel 전체 | 큼

2026-02-09 | RepoContract P0에서 query(filter) 제외(P1로) | P0는 업로드/저장 우선 | query를 repo에 즉시 포함 | repo/types | 중

2026-02-09 | Storage key SSOT: kernel/repo/keys.ts로 단일화 | 하드코딩 키 재발 방지 | 레거시 KEYS 유지 | 모든 repo/draft | 중

2026-02-09 | UI는 domain repo만 사용, impl 직접 금지 | God-class 재발 방지 | impl 직접 호출 | app 전체 | 큼

2026-02-09 | Draft는 전 페이지 공통(useDraft), 도메인 키 사용 | 페이지 리팩터에도 키 유지 | path 기반 키 | draft 전반 | 중

2026-02-09 | RepoContract에 updatedAt?: number 메타 추가 | 서버 동기화/충돌 해소 시 필수 | id만 필수 | repo/types + 전 엔티티 | 중

2026-02-09 | Storage adapter는 pageStorage.ts 패턴 채택 | adapter 패턴으로 서버 전환 대비 + 레거시 3가지 경로 통일 | data/storage.ts 유지 | repo/storage + 전 repo | 큼

2026-02-09 | NavItem component → loader 패턴으로 전환 | 점진 교체 시 타입/사용처 단순화, import 경로만 교체 | component에 LazyExoticComponent 저장 | navConfig/routes 전체 | 중

2026-02-09 | Suspense는 App.tsx 전역 1회만 | 중복 Suspense로 디버깅/흐름 추적 어려움 방지 | routes.tsx에도 Suspense | App/Routes | 하

2026-02-09 | result 파일명 규칙: NNN-title.md (하이픈 고정) | 기존 9개 파일이 이미 하이픈, 언더스코어와 혼용 방지 | NNN_title.md | docs/result 전체 | 작음

2026-02-09 | docs SSOT를 company-docs/src2/docs로 이동 | 빌드 루트와 동일 경로로 작업/참조/기록 안정화 | 루트 밖 유지 | 문서 운영 전체 | 중

2026-02-09 | CSS import 위치: 전역 리셋은 main.tsx, Shell CSS는 Shell.tsx | 역할 분리 명확 | App.tsx에서 전부 import | main.tsx + Shell.tsx | 작음

2026-02-09 | result 작성 조건: 코드/문서 변경이 있었던 턴에만 | 과잉 기록 방지 | 매 턴 무조건 | docs/result | 작음

2026-02-09 | vendor 저장 key는 단기적으로 local_vendors_v1 유지 | 기존 레거시 데이터 호환 우선 | 즉시 repo:* 규칙으로 변경 | vendor 등록/참조 페이지 전반 | 중

2026-02-09 | local_* 저장 key는 Phase 5 동안 호환 유지 후 repo:* 규칙으로 일괄 이관 | 페이지 이관 중 데이터 단절 방지 + 키 혼선 최소화 | 페이지별 즉시 키 변경 | master 계열 저장소(keys.ts) | 중
2026-02-10 | kernel/components 승격 기본 기준은 2도메인 재사용으로 고정 | 페이지 전용 코드의 kernel 오염 방지 | 담당자 판단으로 자유 승격 | SSOT 공통섹션 공정 전체 | 중
2026-02-10 | 1도메인 승격 예외를 허용하되 DECISIONS_LOG 기록 의무화 | 인프라/완전범용 컴포넌트의 초기 확산 속도 확보 | 예외 전면 금지 | SSOT 공정 + 품질관리 | 하
2026-02-10 | 계량 원천 데이터 key는 `weighing_transactions_v1`를 임시 호환 사용 | manage/daily logistics 이관 시 기존 업로드 데이터 단절 방지 | 즉시 repo:* 새 key로 전환 | manage daily + 향후 register daily | 중
2026-02-10 | manage/daily logistics 자동 시드는 1회만 허용(시드 메타 레코드 기록) | 새로고침/재진입 시 중복 시드 및 덮어쓰기 방지 | 진입 때마다 재변환 시드 | manage daily logistics | 중
2026-02-10 | vehicle legacy key 이관은 primary 우선 병합 + 누락 ID 보강으로 1회 수행 | 부분 이관 상태에서 데이터 유실/중복 방지 | primary 비어있을 때만 전체 복사 | manage master vehicle + vehicle repo | 중
2026-02-10 | Phase 5 manage 이관에서 엑셀 일괄등록 기능은 신규 구현하지 않음 | 이관 속도/안정화 우선, 엑셀 플로우는 추후 정리 예정 | manage별 엑셀 기능 병행 구현 | manage 공정 전반 | 중
2026-02-10 | 작업 시작 시 선조치 4항목(API 매핑/입력검증/key호환/권한확장) 체크를 필수화 | Phase 6(서버/보안) 재작업 방지 | 구현 후 사후 점검 | Phase 5 전 작업 | 하
2026-02-10 | QA 자동화 기준은 smoke+security(check:qa)를 기본 게이트로 고정 | 현재 lint 누적 부채와 이관 진행을 분리해 운영 리스크를 먼저 차단 | lint 포함 전체 게이트를 기본으로 강제 | scripts/package.json + G5 게이트 | 중
2026-02-10 | lint 포함 전체 검증은 check:qa:full로 분리 운영 | lint 개선은 장기 과제, 기능 이관/보안 회귀는 즉시 차단 필요 | lint 실패 상태에서도 무검증 진행 | QA 워크플로우 전반 | 중
2026-02-10 | legacy 엑셀 파서는 BinaryString 대신 ArrayBuffer(Array 타입)로 읽기 방식을 전환 | 읽기전용 `.xls` 파일에서 파싱 실패 사례를 줄이기 위한 호환성 보강 | 기존 binary 읽기 유지 | excel 파서(partner/weighing/vehicle) | 중
2026-02-10 | register/daily가 legacy로 남아있는 동안 manage/daily는 legacy 최신값을 repo로 지속 동기화한다 | 1회 마이그레이션만으로는 register 저장 직후 manage 미반영이 발생 | register/daily 전면 src2 이관 전까지 임시 단절 허용 | issueRepo/actionRepo/useManageProductionPage 동작 | 중
2026-02-11 | SHADOW 페이지는 리뉴얼보다 이관 완료를 우선한다(이관 -> @legacy 제거 -> 리뉴얼) | 이관+리뉴얼 동시 진행 시 회귀 원인 분리가 어려워 일정/품질 리스크가 커짐 | 화면 리뉴얼을 먼저 수행 | register/browse 잔여 SHADOW 전체 | 중

================================================================================
[예외 기록]
(없음)

================================================================================
[미해결 의사결정]
- 파일럿 페이지: Partner V2 vs 단순 마스터 (Phase 2 착수 직전 결정)
- ServerRepo 실구현 시점(스텁 유지 기간)
- kernel export 100개 초과 시 서브패스 허용 기준
- Phase 5 마무리 UX: manage 저장/삭제/보류 실패 시 사용자 에러 메시지/재시도 패턴 표준화
2026-02-12 | register/daily 계열의 제목 자동입력/태그 기능은 kernel 공용 컴포넌트로 분리해 재사용한다 | 페이지별 중복 구현 누적을 막고 이관 속도/일관성 확보 | 페이지마다 개별 구현 유지 | src2 register/action 이후 daily 계열 전반 | 중
2026-02-12 | production 저장 시 writerName 필수 검증을 기본 가드레일로 강제한다 | 빈 작성자 상태에서 stable id 충돌로 upsert 덮어쓰기 위험이 존재 | writerName 미검증 허용 | /register/daily/production 저장 안정성 | 낮음
2026-02-12 | register/daily/logistics에서 종류(PP/PE)와 품목(압축품/분쇄품/펠렛/스크랩) 선택 구조를 고정하고, 매입+스크랩 세부 품목(직접입력 포함)을 도입 | 유통 입력 규칙을 현장 정의와 맞추고 재입력/중복 입력을 줄이기 위함 | 처리 방향도 PP/PE를 강제 | register/daily/logistics + partner tradeProfiles 자동 동기화 | 중
2026-02-12 | 거래처 기준정보는 (거래처명, 거래처명 세부) 조합을 유니크 기준으로 관리한다 | 동일 거래처명 다중 케이스를 신규 등록이 아닌 기존 수정(세부 보강) 흐름으로 유도하기 위함 | 거래처명만으로 단순 중복 차단 | partner/register + register/daily quick-add + partner label/search | 중
2026-02-13 | 로컬 사용자 컨텍스트(내 정보: 이름/직책/지부)를 kernel/user SSOT로 관리한다 | 일일 기록 메타를 페이지별 수동 입력에서 공통/고정 흐름으로 전환하고 작성자 추적 일관성 확보 | 페이지별 draft 기본값 수동 유지 | shell + register/daily 훅 전반 | 중
2026-02-13 | 저장/수정/삭제 주체 추적은 페이지별 구현 대신 localRepo 공통 감사로그로 강제한다 | 페이지 누락 없이 모든 repo 변이를 일관 기록하기 위해서 | 페이지/커맨드별 개별 로그 호출 | kernel/repo/impl/localRepo + audit log | 중
2026-02-13 | 선택형 입력(id->표시값)은 공통 해석 유틸(hooks/common/selection.ts)로 처리한다 | quick-add 직후 목록 갱신 타이밍 차이로 label 누락/검증 실패를 방지 | 페이지별 find + 빈값 덮어쓰기 유지 | register/daily selection 흐름 전반 | 중
2026-02-13 | 유통 등록 단가 자동입력은 거래처 기준 단가보다 "동일 거래처 최근 1회 라인 단가"를 우선한다(기준 단가는 fallback) | 현장 입력 흐름에서 직전 거래 단가 재사용 비중이 높고, profile 단가 고정으로 인한 오입력/재수정 비용을 줄이기 위함 | 거래처 기준 단가를 항상 우선 적용 | register/daily/logistics draft 단가 계산 로직 | 중
2026-02-13 | 관리 유통의 업무 범위는 매입/출고로 고정하고 처리(폐기물/폐수)는 제외한다(단, 원본 데이터는 보존) | 유통 관리 목적(원자재 입고/생산품 출고)과 처리 비용성 업무를 분리해 조회·수정 오판을 줄이기 위함 | 관리 유통에서 처리 라인까지 동일하게 노출/편집 | manage/daily/logistics + logistics save merge | 중
2026-02-13 | 유통 단가 자동반영은 거래처 단일 최근값이 아니라 "거래처+방향+종류+품목" 조합 최근값을 우선 사용한다 | 품목/종류 전환 시 다른 거래 단가가 섞이는 오입력을 줄이고, 동일 조합 재입력 생산성을 높이기 위함 | 거래처 기준 최근값 1개를 모든 조합에 공통 적용 | register/daily/logistics draft 단가 자동반영 | 중

2026-02-13 | 유통 반품은 원본 연결 메타(returnSourceRecordId/returnSourceLineId/sourceDirection/sourceKg/returnedKg)를 저장하고 관리 집계는 순중량(원본-반품) 기준으로 계산한다 | 반품을 단순 반대방향 라인으로만 저장하면 원본 상쇄 추적/부분반품 계산이 깨지기 때문 | 반품을 일반 매입/출고 라인으로만 저장(원본 참조 없음) | register/daily logistics + manage/daily logistics 조회/집계 | 중
2026-02-13 | 반품 저장 시 요청 중량이 원본 잔여 중량을 초과하면 저장을 차단한다 | 과반품이 허용되면 데이터 정합성(순중량/정산)이 즉시 깨지기 때문 | UI 안내만 하고 저장은 허용 | logistics submit 검증/오류 처리 | 소
2026-02-13 | 반품 입력 UX는 원본 선택 후 방향/종류/품목을 고정하고 저장 시 내부에서만 반대 방향으로 변환한다(표시는 반품) | 출고/매입별 품목 세트 차이로 UI에서 즉시 반전하면 선택 불가/자동보정 부작용이 발생하기 때문 | 반품 선택 즉시 draft 방향을 반대로 바꿔 UI도 반전 | register/daily logistics 반품 입력/수정 UX + manage/register 표시 | 소
2026-02-13 | 유통 반품 상태 표기는 색상 2종(초록=반품기록, 빨강=반품대상)과 텍스트 2종(전량 반품/부분 반품)만 사용한다 | 상태 문구/색상이 늘어나면 등록/관리/조회 해석이 갈려 운영 오판이 생기기 때문 | 반품 완료/반품 처리/부분 반품 등 다중 라벨 병용 | register/manage logistics 표시 규칙 + 향후 browse 통계 | 소
2026-02-13 | 작업 시작 기본 문서는 BASIC_EXECUTION_CHECKLIST.md를 우선 사용하고, 세부는 전용 체크리스트로 확장한다 | 룰 문서가 분산되어 반복 탐색 비용이 커지고 LOC/공통화 누락이 재발했기 때문 | TASK/PAGE 체크리스트만 개별 참조 | docs/rule 워크플로우 전반 | 소
2026-02-13 | manage 유통 펼치기 금액은 반품대상은 순금액(원중량-반품중량), 반품기록은 참고금액(반품중량 기준)으로 분리하고 tone(입고 빨강/출고 초록/전량반품·반품기록 흰색)을 고정한다 | 반품 금액이 대상 라인과 처리 라인에 중복 반영되면 조회/정산 해석이 꼬이기 때문 | 반품기록 금액을 숨기거나 대상/기록 모두 같은 색으로 표시 | manage/daily/logistics 펼치기 금액 표시 규칙 | 소

2026-02-13 | 유통 등록 선택 입력은 '포함검색 + 드롭다운 선택 강제' 패턴으로 고정 | 자유입력 저장으로 인한 오입력/중복 리스크를 줄이고 선택 속도를 높이기 위함 | 검색어 입력값도 그대로 저장 | register/daily/logistics 선택 UX + 향후 일일 페이지 선택 UX | 중
2026-02-13 | 체크리스트 운영 구조를 rule/checklist(원본) + rule/checklist-result(작성본)으로 분리 | 규칙 문서와 작업 기록 문서의 책임을 분리해 재사용성과 추적성을 함께 확보 | 기존 result/checklist에 계속 누적 | docs/rule 체크리스트 운영 전반 | 중
2026-02-13 | 유통 선택 자동완성은 단일 입력 필드 + 하단 목록 선택으로 확정하고, 검색어 텍스트는 저장하지 않는다 | 입력 편의성과 데이터 정합성을 동시에 유지하기 위함 | 검색어 입력값 자체를 draft/저장 데이터로 보관 | register/daily/logistics 선택 UI + 향후 공용 선택 UX | 중
2026-02-13 | 유통 전용 체크리스트를 일일 페이지 공용 체크리스트로 승격 | 유통에서 검증된 패턴을 생산/사무/이슈/조치 리뉴얼에 공통 적용해 재수정 비용을 줄이기 위함 | 유통 전용 체크리스트를 계속 기준으로 사용 | docs/rule/checklist + BASIC 목차 참조 경로 | 중
2026-02-13 | 생산 페이지 선택 UX도 유통과 동일한 단일 자동완성 패턴으로 통일(1차: 생산품/품목) | 일일 페이지 리뉴얼 간 UX 편차를 줄이고 재수정 비용을 낮추기 위함 | 생산은 기존 select 유지, 유통만 자동완성 유지 | register/daily/production 선택 UX + 공용 FilterableSelect 확장 | 중
2026-02-13 | BASIC 체크리스트에 미래 대비(조회/서버이관/보안/권한) 항목을 고정 추가 | 기능 구현 중심으로 흐르며 후속 단계 대비 누락이 발생하는 리스크를 사전 차단하기 위함 | 구현 완료 후 별도 회고에서만 대비사항 점검 | docs/rule/BASIC_EXECUTION_CHECKLIST.md + 일일 공용 체크리스트 | 중
2026-02-13 | 보안 체크리스트는 "민감정보 항목 분류"가 아니라 "회사 데이터 전량 민감 취급"을 기본값으로 둔다 | 도메인 데이터 전체가 민감하므로 분류 누락보다 전량 보호 전제가 운영상 안전하고 단순하다 | 필드별 민감도 분류 체크를 매 작업마다 강제 | BASIC + daily-renewal 공용 체크리스트 | 중
2026-02-16 | 입고+스크랩 세부품목은 기본 선택지와 `기타`를 분리하고, `기타` 등록값은 기타 전용 드롭다운에서만 선택한다 | 세부품목에서 기본 항목과 기타 항목이 섞이면 오입력/중복선택 해석이 어려워져 운영 정합성이 떨어지기 때문 | 기타 등록값을 세부품목 기본 버튼 목록에 계속 병합 | register/daily/logistics 세부품목 선택 UX + 일일 공용 체크리스트 | 중
2026-02-16 | 사용자 노출 문구는 반말 금지, 존댓말 고정으로 통일한다 | 화면 문구의 톤이 섞이면 사용자 신뢰와 운영 일관성이 떨어지기 때문 | 페이지별 문구 톤을 개발자 재량으로 유지 | src2/app 전반(안내/오류/토스트/placeholder/confirm) + 리뉴얼 체크리스트 | 중
2026-02-16 | QA 재검증은 동일 배치 build 재사용 경로(`check:qa:reuse-build`, `test:smoke:routes`)를 기본으로 사용한다 | `build -> check:qa` 연속 실행 시 build 중복으로 배치 시간이 불필요하게 증가하기 때문 | 모든 L2 검증에서 `check:qa`만 고정 사용 | scripts/package.json + BASIC/TASK/GATES/daily 체크리스트 | 중
2026-02-16 | 생산 일일기록은 제목 입력 UI를 제거하고 템플릿([일일][생산]) 자동생성 저장으로 고정한다 | 매일 반복 작성 페이지에서 수동 제목 입력은 중복 입력과 편차를 유발하기 때문 | 페이지별 제목 입력 필드를 유지 | register/daily/production 저장/목록/삭제 문구 정책 + 향후 일일 페이지 제목 정책 확장 | 중
2026-02-16 | 생산 항목의 종류/품목 선택은 유통 출고 기준 공용 상수(materialOptions)로 통일한다 | 도메인 간 선택 기준 불일치를 줄이고 공통 리뉴얼 재사용성을 높이기 위함 | 생산 전용 상수(분쇄품/원료)를 독립 유지 | kernel/schema/daily + register/daily logistics/production 선택 UX | 중
2026-02-16 | 이슈 등록 모달 레이어는 sections/common/LayerModal로 승격하고 생산 페이지에서도 useRegisterIssuePage/IssueRegisterForm을 재사용한다 | 물류 전용 경로에 묶여 있던 모달을 공통화해 일일 페이지 확장 비용을 낮추기 위함 | 페이지별 모달 레이아웃 중복 구현 | register/daily logistics/production 모달 구조 + 이슈 제목 템플릿 확장(issue-daily-production) | 중
2026-02-16 | 생산 항목 선택 축을 `종류=PP/PE`, `품목=분쇄품/펠렛`으로 고정하고 생산 입력은 `생산수량(자루)`만 사용한다 | 생산 페이지의 선택 기준을 유통 출고 기준과 정렬하고 측정 불가값(kg) 입력 혼선을 제거하기 위함 | 생산에서 kg/포대 입력을 병행 유지 | register/daily/production 입력 검증/저장/표시 규칙 | 중
2026-02-16 | 생산 이슈에서 상태가 `완료`이면 같은 모달에서 조치 입력까지 연계한다(`IssueActionModal` 재사용) | 이슈 완료 후 조치 등록으로 이동하는 공정을 한 흐름으로 고정해 누락을 줄이기 위함 | 생산은 이슈만 저장, 조치는 별도 페이지에서 수동 등록 | register/daily/production + action 템플릿(action-daily-production) | 중
2026-02-16 | 일일 등록의 지부는 내 정보 자동주입은 유지하되 수동 변경을 허용한다(자동 덮어쓰기 금지) | 운영 중 대체 근무/타 지부 작성 상황에서 지부 수정이 막히면 기록 정합성이 깨지기 때문 | 내 정보와 항상 강제 동기화 | useActorProfileDraftSync + DailyMetaFields(lockSite) 적용 페이지 | 중
2026-02-16 | 유통 입력의 방향/종류/품목은 드롭다운으로 통일하고, 거래처 최근 1회 자동선택/최근 단가 자동반영 규칙은 유지한다 | 버튼형 선택의 확장성과 유지보수 비용을 줄이면서 기존 자동완성 생산성을 유지하기 위함 | 버튼 UI 유지 + 일부 규칙 축소 | register/daily/logistics 타입 선택 UX + draftUpdater 단가/최근선택 로직 | 중
2026-02-16 | 유통 라인에 비고(`memo`)를 공통 필드로 추가한다 | 등록 화면과 목록 화면에서 현장 메모를 동일 구조로 추적하기 위함 | 비고를 details/tags에 분산 기록 | logistics draft/types/submit/lineEdit/merge/list 표시 | 소
2026-02-18 | 온라인 전환 최소선 체크리스트(식별자/충돌/권한) 원본을 신설하고 BASIC/카탈로그에 연결한다 | 페이지 완성 후 일괄 수정 시 대규모 재작업 위험이 커서, 최소선 기준을 먼저 고정하기 위함 | 기존 BASIC + 일일 공용 체크리스트만 사용 | docs/rule/checklist + checklist-result 운영 체계 | 중
2026-02-18 | 생산 문서키를 actorId(writerId) 우선으로 전환하고 legacy writerName 키 fallback 이관(신키 저장 + 구키 제거)을 적용한다 | 온라인 동시사용 전환 전에 동명이인/이름변경에 취약한 writerName 키 의존을 줄이고, 기존 데이터와의 단절 없이 점진 이관하기 위함 | writerName 기반 고정키를 계속 유지 | register/daily/production 저장 경계(constants/commands/hook) | 중
2026-02-18 | 유통 문서키를 actorId(writerId) 우선으로 전환하고, 병합 키를 recordDate 단일축에서 recordDate+site+actor 축으로 보정한다 | 유통은 저장량/변경량이 가장 커서 온라인 전환 시 date-only 병합이면 타 사용자/타 지부 데이터가 섞일 위험이 높기 때문 | recordDate 기준 단일 문서 병합 유지 | register/daily/logistics submit/merge 경계 + writerId/site 저장 | 중
2026-02-18 | logistics save command now checks `updatedAt` conflict and permission points (`canRead/canWrite/canDelete`) at boundary | online use with 4~5 users needs minimum conflict safety and role split hooks before server auth rollout | keep status quo until full auth server arrives | register/daily/logistics command boundary + future reuse in office/issue/action | low
2026-02-18 | office/issue/action 저장 경계에 권한 포인트를 도입하고 issue/action에는 `updatedAt` 충돌가드를 적용한다 | 온라인 동시사용 최소선에서 유통만 보호하면 도메인별 저장 경계가 달라 운영 리스크가 남기 때문 | 유통 경계만 우선 보호하고 나머지는 리뉴얼 완료 시점까지 보류 | register/daily office/issue/action 저장/삭제 경계 + 후속 서버 권한 연결 지점 | 중
2026-02-18 | issue 저장/삭제 로직을 hook 내부 구현에서 commands/types 분리 구조로 동일화한다 | 유통/생산/조치와 경계 패턴이 달라지면 충돌가드/권한 정책 확장 시 유지보수 비용이 커지기 때문 | issue는 hook 내부 저장 구조 유지 | register/daily/issue hook + commands/types 경계 표준화 | 중
2026-02-18 | draft 저장 신뢰성은 페이지별 saveDraft 호출 준수만 의존하지 않고 useDraft 공통 레이어에서 dirty autosave 가드로 보강한다 | 리팩터링/기능 확장 중 일부 경로에서 saveDraft 호출 누락이 생기면 페이지 이탈 시 드래프트 유실 체감이 즉시 발생하기 때문 | 호출 누락은 코드리뷰로만 관리 | kernel/draft/useDraft 공통 저장 신뢰성 + 일일 등록 전 페이지 | 중
2026-02-18 | useDraft는 mount 직후 비동기 로드(setTimeout) 대신 초기 state에서 동기 로드를 기본으로 사용한다 | actor/profile 동기화가 먼저 저장을 실행하면 기존 draft를 기본값으로 덮어쓸 수 있는 타이밍 레이스가 발생하기 때문 | 기존 비동기 loadDraft 타이머 유지 | kernel/draft/useDraft 초기화 신뢰성 + 일일 입력 전 페이지 | 중
2026-02-18 | 생산 항목 추가 입력폼(lineDraft)은 로컬 state가 아닌 ProductionDraft 일부로 저장한다 | 생산 페이지만 항목 추가 입력폼이 별도 state라 이탈 시 해당 구역만 유실되는 체감 문제가 발생했기 때문 | lineDraft 로컬 state 유지 + 저장 후 초기화만 처리 | register/daily/production 입력폼 복원 신뢰성 + draft 마이그레이션 | 중
2026-02-18 | URL은 변경되는데 화면이 유지되는 라우트 정체(stale view) 증상 방지를 위해 Routes를 pathname key 기반 리마운트로 보호한다 | 런타임에서 간헐적으로 주소-화면 불일치가 발생하면 사용자 신뢰와 데이터 입력 흐름이 크게 깨지기 때문 | 기본 Routes 업데이트 동작만 신뢰 | app/routes/routes.tsx 라우트 전환 안정성 | 중
2026-02-18 | 사무일지는 관공기관/기타 분기 입력을 제거하고 라인형(세부제목/내용) + 기준정보 연계 2단 선택으로 전환한다 | 추후 조회/집계/권한 확장을 고려하면 태그 자유입력보다 기준정보 ID 연계가 안정적이고, 유통/생산과 구조를 맞춰야 유지보수 비용이 낮기 때문 | 기존 extraAgencies/extraEtc 구조 유지 | register/daily/office 데이터 구조/입력 UX/저장 포맷 + 후속 manage/browse 정렬 기준 | 중
2026-02-18 | 사무 연계 입력은 2차 검색선택 시 즉시 항목 추가로 처리하고 태그 입력은 제거한다 | 사용자 입력 단계를 줄여 반복 기록 속도를 높이고, 태그 자유입력 대신 내용 기반 기준정보 추천으로 연계 일관성을 확보하기 위함 | 2차 선택 후 별도 추가 버튼 클릭 + 태그 입력 유지 | register/daily/office 연계 UX + common linkedReferences 재사용 기반(issue 예정) | 중
2026-02-18 | office hook realignment batch keeps rule-first structure (useRegisterOfficePage slim + extracted mappers/context) and requires check:qa:reuse-build rerun after stabilization | repeated user feedback showed file-bloat and unchecked regressions must be closed in same batch | postpone split/qa rerun to later batch | register/daily office + shared QA policy | low
2026-02-18 | office detail registration switches from staged draft-lines to immediate repo upsert, and issue page reuses the same linked-reference selection/suggestion pattern | user flow requires logistics-like immediate persistence and disallows office-only linkage UX | keep staged add + office-only linkage until later redesign | register/daily office+issue save/display boundary and common UI style alignment | low
2026-02-18 | feature-file map (`feature-files-map-unified`) and domain map (`register-daily-files`) must be referenced at work start and traced in result/checklist-result | repeated structure drift and duplicate file creation happened when map references were skipped | keep map reference optional for quick batches | docs/rule BASIC/PAGE_RENEWAL + all future result/checklist-result records | low

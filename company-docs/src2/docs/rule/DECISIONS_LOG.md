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

================================================================================
[예외 기록]
(없음)

================================================================================
[미해결 의사결정]
- 파일럿 페이지: Partner V2 vs 단순 마스터 (Phase 2 착수 직전 결정)
- ServerRepo 실구현 시점(스텁 유지 기간)
- kernel export 100개 초과 시 서브패스 허용 기준
- Phase 5 마무리 UX: manage 저장/삭제/보류 실패 시 사용자 에러 메시지/재시도 패턴 표준화
2026-02-10 | register/daily가 legacy로 남아있는 동안 manage/daily는 legacy 최신값을 repo로 지속 동기화한다 | 1회 마이그레이션만으로는 register 저장 직후 manage 미반영이 발생 | register/daily 전면 src2 이관 전까지 임시 단절 허용 | issueRepo/actionRepo/useManageProductionPage 동작 | 중

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

================================================================================
[예외 기록]
(없음)

================================================================================
[미해결 의사결정]
- 파일럿 페이지: Partner V2 vs 단순 마스터 (Phase 2 착수 직전 결정)
- ServerRepo 실구현 시점(스텁 유지 기간)
- kernel export 100개 초과 시 서브패스 허용 기준

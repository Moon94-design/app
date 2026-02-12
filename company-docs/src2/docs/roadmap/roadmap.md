src → src2 전환 마스터 로드맵 (길 안 잃는 용)
작성일: 2026-02-11
범위: 전환 전체(배포/서버/보안 포함) + 현재 실행 단계(Phase 5) 기준 운영

================================================================================
A) 전체 단계 맵 (큰 항목)
Phase 0. 기준 문서/SSOT 고정
- SSOT(txt/md) 확정, 하드룰/게이트/alias/폴더 구조 고정, src2가 주인 원칙 고정

Phase 1. 엔트리 전환 + Shadow Router 완성 (완료)
- src2가 메인 엔트리로 뜸
- src2 navConfig/routes/shell이 SSOT
- 레거시 페이지 100% lazy 연결 → “화면 그대로, 주인만 src2”

Phase 2. kernel/repo 인프라 정본화 (P0)
- 진입 조건: Phase 1 G1 통과
- Storage adapter 단일화(jsonStorage), keys.ts(키 SSOT)
- repo/types SSOT (RepoContract + DocRepoContract)
- localRepo/serverRepo 골격 + domain repo 정착(UI는 domain repo만)

Phase 3. kernel/draft 범용화 (P0/P1)
- 진입 조건: Phase 2 repo 계약 확정 + localRepo 괨격 완료
- draftKeys 도메인 규칙
- useDraft 범용(P0: dirty/save/discard/load, P1: autosave)
- draftRepo(repo 기반)

Phase 4. 파일럿 페이지 이관 (src → src2)
- 진입 조건: Phase 3 useDraft P0 동작 확인
- 단순 마스터 등록 페이지부터(또는 Partner V2)
- 해당 페이지: @legacy import 0 / @kernel만 사용
- navConfig component를 src2 페이지로 교체

Phase 5. 기능군 순차 이관 + 프론트 구조 완성(신규 페이지 추가 포함)
- 진입 조건: Phase 4 파일럿 페이지 DoD 통과
- 마스터(등록/관리/조회) → 일일기록(등록/관리/조회) → 계량/단가 조회 → 이슈/조치 → 대시보드
- 각 기능군별 kernel 의존:
  - 마스터: RepoContract + masterRepo (P0 범위)
  - 일일기록: RepoContract + dailyRepo + draft(autosave)
  - 계량/단가: query 확장(P1) 필요 시점
  - 이슈/조치: DocRepoContract + issueRepo/actionRepo
  - 대시보드: 전체 repo 조회 + 집계 유틸
- “리뉴얼(기존 페이지 교체)”과 동시에 “신규 페이지 추가” 진행
  - 예: 일일기록 조회/관리 페이지 확장, 통합 검색/보고서 페이지 추가
- 각 기능군마다: kernel 도구 채우기 → 페이지 이관/신규 생성 → 레거시 의존 제거

Phase 6. 서버 도입(백엔드) + 데이터 모델 확정
- API 설계(REST 고정), 인증/인가(권한 모델)
- DB 선택/마이그레이션, 파일 업로드/엑셀 처리 위치 결정(클라 vs 서버)

Phase 7. 보안/운영/배포(CI/CD)
- 환경변수/비밀키 분리, CORS/CSRF, 토큰 보관 정책
- 로그/감사, 백업/복구, 취약점 점검(의존성/CSP/헤더)
- CI/CD + 롤백 + 배포 파이프라인

Phase 8. 전환 종료
- src 의존 0 확인 → src 아카이브/삭제
- 운영 문서/개발 문서 최종 정리

================================================================================
B) 현재 실행 단계 (Phase 5)
현재 상태(2026-02-11)
- Phase 1~4는 완료.
- 이관 분포: MIGRATED 19 / SHADOW 7.
- 현재 우선순위: SHADOW 잔량을 src2로 이관 완료해 src 의존을 구조적으로 제거.

운영 원칙(고정)
- SHADOW 페이지는 "리뉴얼 이전에 이관 완료"를 우선한다.
- 순서: 기존 동작 parity 이관 -> @legacy 제거 -> 필요 시 UI/정보구조 리뉴얼.
- 이유: 이관과 리뉴얼을 동시에 수행하면 회귀 원인 분리가 어려워지고 일정 예측이 깨진다.

이번 스프린트 우선순위
1) browse SHADOW 5개(master/daily/price/weighing-trend/weighing-price) 이관
2) manage 중간 페이지 상태 정리(/manage, /manage/master)
3) G5(check:qa) 실패 원인 상수화 + 보안 debt 1건 정리

SHADOW 11 실행표(작업 단위 고정)
- Batch A (등록 일일기록): `/register/daily/logistics` -> `/register/daily/office` -> `/register/daily/production` -> `/register/daily/action` (완료)
- Batch B (조회 기본): `/browse/master` -> `/browse/daily`
- Batch C (조회 집계): `/browse/price` -> `/browse/weighing-trend` -> `/browse/weighing-price`
- Batch D (중간 페이지 정합): `/manage` -> `/manage/master`
- 각 페이지 공정(반복):
  1) src2 페이지 파일 생성/정리(얇은 조립 유지)
  2) @kernel 기반 repo/draft/schema 연결
  3) navConfig loader를 @app2로 교체
  4) G4-lite 검증(build + URL 직접입력/새로고침 + core flow)
  5) result 기록 + MIGRATION_STATUS 상태 업데이트

검증 고정
- 페이지 이관 단위: G4 기준 충족 + result 기록
- 주기적 운영 검증: `npm run check:qa` (smoke + security)

================================================================================
C) 다음 단계 운영 원칙(짧게)
- 새 페이지/신규 기능은 무조건 src2 기준으로 작성
- kernel은 정본(SSOT): kernel 내부 @legacy 금지
- UI는 domain repo만 사용(impl 직접 금지)
- Storage key는 keys.ts에서만 정의(하드코딩 금지)
- docs SSOT: company-docs/src2/docs/ (기존 /workspaces/app/src2/docs/는 백업/참조용만)

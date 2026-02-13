src → src2 전환 마스터 로드맵 (길 안 잃는 용)
작성일: 2026-02-13
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
- 진입 조건: Phase 2 repo 계약 확정
- draftKeys 도메인 규칙
- useDraft 범용(P0: dirty/save/discard/load, P1: autosave)
- draftRepo(repo 기반)

Phase 4. 파일럿 페이지 이관 (완료)
- 단순 마스터 등록 페이지 기준 G4 검증 완료

Phase 5. 기능군 리뉴얼/신규 확장 (현재)
- 기존페이지 리뉴얼 + 일일기록 신규페이지 + 엑셀등록 종류 신설

Phase 6. 서버 도입(백엔드) + 데이터 모델 확정
- API 설계(REST 고정), 인증/인가(권한 모델)
- DB 선택/마이그레이션, 업로드 처리 위치 결정

Phase 7. 보안/운영/배포(CI/CD)
- 비밀키/권한/감사로그/배포 파이프라인 고정

Phase 8. 전환 종료
- src 의존 0 확인 → src 아카이브/삭제

================================================================================
B) 현재 실행 단계 (Phase 5)
현재 상태(2026-02-13)
- Phase 1~4 완료.
- 전환 프레임워크(엔트리/라우팅/저장 규칙)는 안정화 구간.
- 현재 실작업은 "일일기록 -> 기준페이지 -> 엑셀등록" 순차 리뉴얼이다.

핵심 운영 원칙
- 1순위: 일일기록 페이지 리뉴얼(유통 제외 나머지 + 신규 일일페이지 준비)
- 2순위: 기준페이지 리뉴얼(등록/관리 기준정보 구간)
- 3순위: 엑셀등록 리뉴얼(종류 확장 포함)
- browse 기존 페이지는 기능 참조용으로 유지하며 운영 우선순위에서 제외.
- browse는 추후 신규 재작성 트랙으로 별도 수행.

이번 스프린트 우선순위
1) D1 유통 제외 일일기록(office/production/issue/action) 리뉴얼 1차
2) D2 일일기록 신규페이지 스펙/작업순서 고정
3) M1 기준페이지 리뉴얼 배치 1 착수
4) X1 엑셀등록 리뉴얼 착수(신규 종류 스펙/매핑표 고정)

근거리/원거리 상세 실행안(2026-02-13 갱신)
- `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
- `company-docs/src2/docs/roadmap/phase5/roadmap.md`
- `company-docs/src2/docs/roadmap/phase5/logistics-return-status-roadmap.md`
- `company-docs/src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`

검증 고정
- 작업 단위: build 필수, 가능 시 check:qa
- 결과 반영: MIGRATION_STATUS + result 동기화

================================================================================
C) 다음 단계 운영 원칙(짧게)
- 새 페이지/신규 기능은 무조건 src2 기준으로 작성
- kernel은 정본(SSOT): kernel 내부 @legacy 금지
- UI는 domain repo만 사용(impl 직접 금지)
- Storage key는 keys.ts에서만 정의(하드코딩 금지)
- docs SSOT: company-docs/src2/docs/

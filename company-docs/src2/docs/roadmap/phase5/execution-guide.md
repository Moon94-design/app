# Phase 5 실행 가이드(참고용)

작성일: 2026-02-09
목적: Phase 5 실행 시 반복 가능한 이관 패턴을 고정

================================================================================
Phase 5 가드레일(필수)
1) Step 1은 G4-lite 통과 전까지 종료하지 않는다.
  - npm run build/dev OK, 새로고침/URL 직접입력 OK, Router 중복 경고 0개
2) 일괄 수정은 배치 1회 저장(upsertMany 1회)만 허용한다.
3) 되돌리기 스냅샷은 최신 1개만 유지하고 다음 일괄 수정 시 덮어쓴다.
  - 스냅샷 키는 kernel/repo/keys.ts에서만 정의(하드코딩 금지)
4) 완료/보류 판정은 kernel/schema/partner helper로만 처리한다(UI 조건문 금지)
5) 레거시(src) 수정 금지. 예외는 DECISIONS_LOG에 사유/종료 조건/되돌림 비용 기록 후 1회만.
6) 공통화는 Step 3에서만 수행한다(Step 1~2는 로컬 구현 유지)

================================================================================
핵심 보완(로드맵 보강 포인트)
- DoD에 추가:
  - src2/kernel/**에서 @legacy import 0 유지
  - storage key 하드코딩 0 (kernel/repo/keys.ts만 사용)
- Phase 5-1(첫 스프린트) 타겟:
  - Partner(거래처) 관리 페이지를 src2로 이관해 도메인 완결
- 레거시 수정 금지(원칙):
  - Phase 5부터 UI 변경은 src2에서만 한다. src는 버그픽스 예외만 허용(결정 로그 필수).
  - src를 수정해야 하면 DECISIONS_LOG에 예외 사유/종료 조건/되돌림 비용 기록 후 1회만.

================================================================================
페이지 이관 스타일(고정 규칙)
- 페이지 파일은 얇게 유지: 라우트/모드, draft on/off, domain repo 호출, 섹션 조립만 담당.
- 페이지 파일에 금지:
  - 포맷/정규화 로직
  - 저장 키 문자열
  - 완료 판정 규칙
  - 긴 폼 UI 덩어리
- navConfig는 loader만 사용. component 필드 금지. 교체는 loader target 경로만.

================================================================================
권장 폴더 구조(페이지 1개당 기본 세트)
- src2/app/pages/<domain>/<Page>.tsx          (얇은 조립 파일)
- src2/app/pages/<domain>/sections/*          (화면 조각)
- src2/app/pages/<domain>/hooks/*             (페이지 전용 훅, 필요 시)
- src2/kernel/schema/<domain>/*               (도메인 타입/규칙)
- src2/kernel/repo/domain/<domain>Repo.ts     (데이터 접근)
- src2/kernel/draft/*                         (draft 공통)
- src2/kernel/components/*                    (공용 UI)

================================================================================
한 페이지 이관 작업 순서(매번 동일)
1) 페이지 껍데기 생성(Partner 템플릿 복사)
2) 섹션 컴포넌트 분리(큰 덩어리는 sections로)
3) 도메인 타입/스키마 정리(kernel/schema)
4) repo 연결(domain repo만)
5) draft 연결(필요 시) + resetDraft 버튼
6) navConfig loader 교체
7) G4 체크 + 문서 기록

================================================================================
도메인 규칙 위치
- 완료 판정/정규화/포맷: kernel/schema/<domain>/ 로 이동
- 공용 입력 UI(전화/날짜/초기화 버튼): kernel/components/ 에 정본화

================================================================================
템플릿 기준
- PartnerRegisterPage를 이관 템플릿 기준으로 삼되,
  페이지 내부 로직(포맷/판정/키 문자열)은 kernel로 이동해
  조립 파일을 더 얇게 만드는 것을 목표로 한다.

================================================================================
영문 지시문(짧게, 고정 규칙)
## Page migration style (must follow)
- Migrate one page at a time using Partner page as the template.
- Page files must stay thin: routing/mode + domain repo calls + draft enable/disable + compose section components.
- Move UI chunks into pages/<domain>/sections/*.
- Put domain rules/types in kernel/schema/<domain>/*.
- Data access only via kernel/repo/domain/*Repo (never impl).
- Reuse kernel utilities/components (phone/date/resetDraft/etc). Do not re-implement inside pages.

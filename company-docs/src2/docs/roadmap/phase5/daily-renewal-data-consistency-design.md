# 일일기록 리뉴얼 설계 SSOT (데이터 정합성 우선)

작성일: 2026-02-13
범위: `src2` 일일기록 도메인(`issue/action/logistics/office/production`) + 정적 보안 강제 스크립트
비범위: browse 신규 구축, Phase 6 서버 이관
우선순위 연계: `일일기록 -> 기준페이지 -> 엑셀등록` 순서를 유지하되, 데이터 손실/중복 리스크를 먼저 제거

================================================================================
0) 설계 목표
- 목표 1: 데이터 손실/중복 생성 가능성이 있는 경로를 P0에서 차단한다.
- 목표 2: 일일기록 문서 ID/병합/동기화 규칙을 도메인별로 일관화한다.
- 목표 3: 이후 `manage`/신규 browse 재작성에서 조회 기준(날짜/지부/작성자) 혼선을 제거한다.

================================================================================
1) 현재 기준선(현행 코드 관찰 요약)
- `issueRepo`/`actionRepo`는 호출 시마다 legacy sync를 수행하는 구조다.
  - 근거: `src2/kernel/repo/domain/issueRepo.ts`, `src2/kernel/repo/domain/actionRepo.ts`
- legacy 문서에 `id`가 없으면 normalize 중 새 로컬 ID를 발급한다.
  - 근거: `src2/kernel/repo/domain/issueRepo.ts`, `src2/kernel/repo/domain/actionRepo.ts`
- `action` legacy normalize 필드는 현재 UI 확장 필드 집합보다 좁다.
  - 근거: `src2/kernel/repo/domain/actionRepo.ts`, `src2/app/pages/register/hooks/action/types.ts`
- logistics dedupe fingerprint는 `line.site`를 키로 사용하지 않는다.
  - 근거: `src2/app/pages/register/hooks/logistics/merge.ts`
- logistics submit은 동일 날짜 문서를 찾아 작성자/직책 메타를 매번 갱신한다.
  - 근거: `src2/app/pages/register/hooks/logistics/submitCommand.ts`
- 일일기록 문서 ID 정책이 도메인별로 다르다(결정론/비결정론 혼재).
  - 근거: `src2/app/pages/register/hooks/production/constants.ts`,
    `src2/app/pages/register/hooks/useRegisterIssuePage.ts`,
    `src2/app/pages/register/hooks/action/constants.ts`,
    `src2/app/pages/register/hooks/office/commands.ts`
- 보안 체크는 정적 import 패턴 중심이라 동적 import 변형 커버리지가 낮다.
  - 근거: `scripts/security-check.mjs`
- `useDraft`의 discard는 마운트 시점 initial로 복원된다.
  - 근거: `src2/kernel/draft/useDraft.ts`

================================================================================
2) 설계 결정(SSOT)

2-1) [P0] legacy sync를 "1회 이관"으로 고정
- 대상: `issueRepo`, `actionRepo`
- 원칙:
  - `meta migrated` 키를 실제 읽어서 이관 완료 여부를 판정한다.
  - repo 인스턴스 내부에도 `legacySynced` 플래그를 둬 동일 세션 중 중복 sync를 막는다.
  - 공개 API(`getAll/getById/upsert/remove`)에서 매번 전체 legacy 재스캔하지 않는다.
- 이관 시점:
  - 첫 `getAll` 또는 최초 repo 초기화 시 1회
- 실패 처리:
  - parse/normalize 실패 row는 drop하지 않고 `migrateError` 카운트/로그에 남긴다(문서화 필수).

권장 의사코드
```ts
if (legacySynced) return;
if (storage.getItem(metaKey) === true) { legacySynced = true; return; }
const migrated = migrateLegacyDocsOnce();
await repo.upsertMany(migrated);
storage.setItem(metaKey, true);
legacySynced = true;
```

2-2) [P0] legacy ID 없음 케이스를 결정론 ID로 고정
- 대상: `issue/action` legacy normalize
- 원칙:
  - `id`가 비어 있으면 랜덤 ID 대신 결정론 키를 생성한다.
  - 기본 키 구성: `prefix + recordDate + normalizedSite + normalizedWriter`
  - 작성자/지부도 비어 있으면 내용 요약 해시를 suffix로 추가한다.
- 효과:
  - 동일 legacy 데이터 재이관 시 중복 증식 방지
  - upsert 비교가 안정적으로 동작

2-3) [P0] action legacy normalize 필드 보존 범위를 확장
- 대상: `actionRepo.normalizeActionItem/normalizeActionDoc`
- 원칙:
  - 보존 필드 최소 집합:
    - doc: `writerRole`, `site`
    - item: `vendorId`, `vendorCost`, `site`, `writerRole`, `tags`
  - legacy에 필드가 없으면 현재 기본값 사용, 있으면 보존
- 효과:
  - sync 과정에서 `ActionDocExt` 확장 필드 유실 방지

2-4) [P0] logistics dedupe fingerprint에 `line.site`를 포함
- 대상: `src2/app/pages/register/hooks/logistics/merge.ts`
- 원칙:
  - fingerprint 키에 `line.site`를 필수 포함한다.
  - dedupe는 "동일 날짜 + 동일 fingerprint"에만 적용한다.
- 효과:
  - 같은 내용이어도 지부가 다르면 별도 라인으로 유지

2-5) [P1] logistics 문서 단위를 `recordDate + site + writer`로 재정의
- 대상: logistics 저장/조회 모델
- 현재 문제:
  - 날짜 단일 문서 모델에서 작성자/직책 메타가 마지막 저장값으로 덮일 수 있음
- 목표 모델:
  - 문서 1개의 대표 키 = `recordDate + site + writerName(normalized)`
  - 문서 내부 라인은 동일 `site`만 허용
  - 조회/통계는 문서키 기반 집계 후 필요 시 날짜 단위 재그룹
- 호환 전략:
  - 읽기 경로는 기존 날짜 단일 문서도 읽되, 내부에서 목표 모델로 정규화
  - 쓰기 경로는 목표 모델로만 기록
  - 모델 전환 meta 키를 별도 운영(`meta:daily:logistics:model-v2:migrated`)

2-6) [P1] 일일기록 ID 정책 통일
- 분류 기준:
  - `집계형 문서`(동일 키에 item/line 누적): deterministic ID
  - `이벤트형 문서`(독립 건별 기록): random ID + dedupeKey
- 정책:
  - production: 기존 deterministic 유지(작성자 sanitize 유지)
  - issue/action: deterministic 유지 + 작성자 sanitize 추가
  - logistics: deterministic 전환(`recordDate/site/writer`)
  - office: random 유지 + 중복 방지용 `dedupeKey` 도입(기록일/지부/작성자/제목)

2-7) [P1] useDraft reset 정책을 "초기값 스냅샷"과 "현재 기본값 재생성"으로 분리
- 대상: `src2/kernel/draft/useDraft.ts`
- 추가 옵션:
  - `resolveInitial?: () => T` (없으면 기존 `initial` 사용)
  - `discardDraft({ mode: "mount-initial" | "resolved-initial" })`
- 적용:
  - 일일기록 페이지는 `resolved-initial`을 기본으로 사용해 "항상 오늘" 초기화 요구 대응

2-8) [P1] security-check 정적 규칙 보강
- 대상: `scripts/security-check.mjs`
- 보강 항목:
  - 동적 import 패턴 탐지: `import("...")`
  - `@legacy`/`repo/impl` 탐지 시 정적/동적 패턴 모두 검사
  - 결과 메시지에 "패턴 기반 검사 한계"를 고정 출력
- 중기 목표:
  - AST 파서 기반 검사로 오탐/누락률 감소

================================================================================
3) 실행 계획(가까운 일정 상세 / 먼 일정 큰 항목)

3-1) 근거리(1~2주, 상세)
- [x] P0-A: issue/action 1회 이관 + 결정론 ID 적용 (2026-02-13 반영)
- [x] P0-B: action normalize 보존 필드 확장 (2026-02-13 반영)
- [x] P0-C: logistics fingerprint(site 포함) 반영 (2026-02-13 반영)
- [x] P0-D: 회귀 테스트(중복 생성/필드 유실/라인 유실 케이스) 추가 (2026-02-13, `test:p0:consistency`)

3-2) 중거리(2~4주, 상세)
1. P1-A: logistics 모델 v2(`date+site+writer`) read/write 분리 적용
2. P1-B: daily ID 정책 통일(issue/action sanitize, office dedupeKey)
3. P1-C: useDraft reset 모드 확장 + register daily 페이지 적용
4. P1-D: security-check 동적 import 탐지 보강

3-3) 원거리(큰 항목)
- 신규 browse 구축 시 조회 모델을 logistics v2 기준으로 설계
- Phase 6 서버 전환 전, 현재 local 모델의 필수 인덱스/키 계약 확정

================================================================================
4) 검증 기준(DoD)
- 공통:
  - `npm run build` 통과
  - `npm run check:security` 통과
- 정합성 시나리오:
  - 같은 legacy 데이터를 repo API 여러 번 호출해도 문서 수가 증가하지 않는다.
  - action legacy sync 이후 `vendorId/vendorCost/site/writerRole/tags` 유실이 없다.
  - logistics merge에서 같은 라인이라도 `site`가 다르면 삭제되지 않는다.
  - logistics 저장 후 날짜 동일/지부 상이 데이터가 상호 덮어쓰지 않는다.
  - discard/reset 시 "오늘 날짜 기본값" 요구 모드가 동작한다.

================================================================================
5) 연계 문서
- 상위 계획: `company-docs/src2/docs/roadmap/phase5/roadmap.md`
- 실행 로드맵: `company-docs/src2/docs/roadmap/phase5/post-logistics-renewal-roadmap.md`
- 상태판: `company-docs/src2/docs/rule/MIGRATION_STATUS.md`

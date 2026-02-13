# system-wide consistency risk audit (src2 전체 정합성/오류 가능성 점검)

> 작성일: 2026-02-13
> 주제: src2 전환 구조/데이터 계층/드래프트/보안강제 관점에서 전체 리스크 문서화
> 이슈 상태: Open

---

## 0) 이 문서의 목적/범위
- “조회(browse) 이관” 같은 특정 기능에 국한하지 않고, **src2 전체를 기준으로 정합성과 오류 가능성(데이터 손실/중복/회귀/운영 혼선)**을 한 번에 정리한다.
- 본 문서는 코드 리뉴얼(페이지 개선/이관) 전에 “어디가 터질 수 있는지”를 빠르게 공유하기 위한 체크포인트다.

근거(스냅샷 성격):
- SSOT 문서: `company-docs/src2/docs/DOCS_GUIDE.md`, `company-docs/src2/docs/rule/main_rule.md`
- 상태/게이트: `company-docs/src2/docs/rule/MIGRATION_STATUS.md`, `company-docs/src2/docs/rule/GATES_CHECKLIST.md`, `company-docs/src2/docs/rule/SECURITY_CHECKLIST.md`
- 현재상태 패킷: `company-docs/src2/docs/result/phase5-next/016-src2-current-state-analysis-pack-for-external-ai.md`

---

## 1) 구조(엔트리/라우팅/로딩) 정합성 평가
결론: **구조는 안정권(추적/회귀 디버깅에 유리)**.

- 단일 엔트리 체인 유지:
  - `company-docs/index.html:11` → `company-docs/src2/app/main.tsx:9` → `company-docs/src2/app/App.tsx:8` → `company-docs/src2/app/routes/routes.tsx:25`
- `navConfig.loader`만 SSOT로 두고, `React.lazy(loader)` 적용 지점이 `routes.tsx` 단일인 점은 룰에 맞고 추적성이 좋다:
  - `company-docs/src2/app/routes/routes.tsx:25`
  - `company-docs/src2/app/nav/navConfig.ts:1`

운영 관점 주의:
- 문서 상태코드(SHADOW/MIGRATED)와 “loader 출처(src2/legacy)”는 같은 축이 아니다.
  - 이 둘을 1:1로 매칭하면 외부 분석/내부 커뮤니케이션에서 오판이 생긴다.
  - (016에도 이미 명시됨) `company-docs/src2/docs/result/phase5-next/016-src2-current-state-analysis-pack-for-external-ai.md:1`

---

## 2) 데이터 계층(repo/storage/key) 정합성 평가
결론: **방향은 맞지만, key 호환/이관 로직의 “일관성 부족”이 가장 큰 리스크**다.

### 2.1 key 네이밍 혼재는 “의도된 과도기”지만, 리뉴얼 단계에서 사고 포인트가 됨
- `STORAGE_KEYS`에 `repo:*`, `local_*`, `meta:*`, `snapshot:*`, `ui:*`가 혼재한다:
  - `company-docs/src2/kernel/repo/keys.ts:1`
- 문서상 “Phase 5 동안 호환 유지 후 repo:* 일괄 이관” 의사결정이 존재한다:
  - `company-docs/src2/docs/rule/DECISIONS_LOG.md:44`

리스크 패턴:
- “어떤 저장소가 정본인지”가 페이지/도메인마다 달라 보이기 쉬움.
- browse/조회 리뉴얼에서 데이터 소스를 잘못 잡으면 “데이터 없음/이중집계/유실”이 터진다.

### 2.2 localRepo 저장 동작은 단순/견고하지만, ‘업서트/병합 정책’은 도메인에서 책임져야 함
- `createLocalRepo`는 `id` 기준으로 upsert/upsertMany를 수행하고 `updatedAt`을 자동 보정한다:
  - `company-docs/src2/kernel/repo/impl/localRepo.ts:14`
- 즉, “문서 ID 규칙(결정론/랜덤), 중복 방지, 병합”이 곧 데이터 정합성의 핵심이 된다.

---

## 3) 최상위 리스크(P0): legacy 동기화(repo/domain) 방식
결론: **현재 구현은 “1회 이관”이 아니라 “매 호출 동기화”에 가깝고, 데이터 증식/덮어쓰기 위험이 있다.**

### 3.1 issueRepo: meta 플래그를 ‘set만’ 하고, ‘read로 스킵’하지 않음
- `syncLegacy()`는 매번 legacy를 읽고 normalize 후 upsert 비교를 수행한다:
  - `company-docs/src2/kernel/repo/domain/issueRepo.ts:109`
- `STORAGE_KEYS.issueLegacyMigratedMeta`는 기록되지만, 이를 읽어 동기화를 스킵하지 않는다:
  - `company-docs/src2/kernel/repo/domain/issueRepo.ts:128`

### 3.2 id 없는 legacy doc → normalize 과정에서 매번 새 id 생성될 수 있음(증식 위험)
- legacy doc에 `id`가 없으면 `createLocalId("ISSUE_DOC")`로 대체한다:
  - `company-docs/src2/kernel/repo/domain/issueRepo.ts:87`
- 이 로직이 “매 호출 동기화”와 결합되면, 같은 legacy 원본이 반복적으로 다른 id로 들어와 **문서가 늘어날 가능성**이 생긴다.

### 3.3 actionRepo는 더 위험: normalize가 확장 필드를 보존하지 않음(덮어쓰기 위험)
- action은 UI/등록 훅이 `ActionDocExt`(writerRole/site/tags/vendorId/vendorCost 등 확장)를 사용한다:
  - `company-docs/src2/app/pages/register/hooks/action/types.ts:18`
- 그런데 repo/domain `actionRepo.ts`의 normalize는 `ActionDocRecord` 최소 필드만 만든다(확장 필드 미보존):
  - `company-docs/src2/kernel/repo/domain/actionRepo.ts:54`
- “legacy가 더 최신(updatedAt)”으로 판단되는 순간, repo의 데이터가 legacy normalize 결과로 덮여 **확장 필드 유실**이 일어날 여지가 있다.

권장(문서 수준 결론):
- legacy 동기화는 “정책”을 명확히 해야 한다:
  - A) 진짜 1회 이관(메타 플래그로 스킵) + 이후는 repo만
  - B) 지속 브리지(양방향/충돌해결) — 이건 설계/검증 비용이 큼

---

## 4) 최상위 리스크(P0): 유통(logistics) 병합/중복 제거 로직
결론: **현재 dedupe fingerprint가 site를 포함하지 않아 라인 유실 가능성이 있다.**

- 병합 키는 기본적으로 `recordDate` 단위이고, line dedupe fingerprint에 `site`가 포함되어 있지 않다:
  - `company-docs/src2/app/pages/register/hooks/logistics/merge.ts:10`
- line의 site는 실제 데이터에서 중요 축이다(대구/성주 분리):
  - `company-docs/src2/kernel/schema/daily/logisticsTypes.ts:10`

이로 인한 구체적 오류 시나리오:
- 같은 날짜 + 같은 거래처/차량/방향/종류/품목/중량/단가가 “지부만 다르게” 2건 들어오면,
  - dedupe가 둘을 같은 라인으로 간주 → 한쪽이 사라질 수 있다.

---

## 5) 문서 ID 규칙/일관성(중요도 P1)
결론: **daily 도메인 내부에서도 ID 정책이 섞여 있어, 조회/편집/중복 방지 UX가 도메인마다 달라진다.**

- production: 결정론적 + 작성자 sanitize:
  - `company-docs/src2/app/pages/register/hooks/production/constants.ts:9`
- issue/action: 결정론적이지만 sanitize 없음:
  - `company-docs/src2/app/pages/register/hooks/useRegisterIssuePage.ts:41`
  - `company-docs/src2/app/pages/register/hooks/action/constants.ts:7`
- office: 랜덤 id(저장 시마다 새 id):
  - `company-docs/src2/app/pages/register/hooks/office/commands.ts:89`

리스크:
- “같은 기록을 수정한다” vs “새 기록을 추가한다”의 의미가 페이지마다 달라져서,
  - browse/manage 리뉴얼 시 데이터 모델 설계가 복잡해진다.

---

## 6) Draft(useDraft) 정책 평가(중요도 P2)
결론: 기능은 단순/예측 가능하지만, “reset이 항상 오늘/최신 기본값” 같은 요구가 오면 걸릴 수 있다.

- `useDraft`는 initial을 ref로 고정하고 discard 시 그 값으로 복귀한다:
  - `company-docs/src2/kernel/draft/useDraft.ts:21`
  - `company-docs/src2/kernel/draft/useDraft.ts:66`

현재는 큰 문제는 아니지만, “reset = 다시 오늘” 같은 UX 요구가 생기면 설계 보강이 필요하다.

---

## 7) 보안 자동점검(security-check) 커버리지 평가(중요도 P1)
결론: **현재 룰 강제는 유용하지만, 정적 import 패턴 위주라 ‘동적 import’ 같은 우회는 잡지 못한다.**

- `@legacy` 금지 패턴은 `from "@legacy/..."` 형태만 탐지한다:
  - `company-docs/scripts/security-check.mjs:9`
- 따라서 `import("@legacy/...")` 같은 형태는 정책 위반이어도 탐지 누락될 수 있다.

문서 관점 권장:
- “PASS면 절대 안전”이 아니라 “대표적인 실수 방지” 정도로 표현하는 게 더 정확하다.

---

## 8) 우선순위 개선 제안(실행 플랜)
### P0 (데이터 손실/증식 방지)
- `issueRepo/actionRepo` legacy 동기화 정책을 “1회 이관”으로 고정하고, 메타 플래그를 실제로 읽어 스킵한다.
- `id 없는 legacy 문서`에 대해 결정론적 id를 부여(예: recordDate+site+writerName)해 증식 가능성을 차단한다.
- logistics merge fingerprint에 `site`를 포함해 지부가 다른 라인이 dedupe로 사라지는 케이스를 막는다.

### P1 (리뉴얼 대비 정합성 비용 절감)
- daily 도메인들의 “문서 ID 정책(결정론/랜덤)”을 최소한의 원칙으로 통일하거나, 도메인별로 문서화해서 browse/manage 설계 기준을 명확히 한다.
- security-check는 동적 import/우회 케이스도 최소 탐지하도록 보강한다.

### P2 (UX/품질)
- draft reset 정책(“초기값을 ref로 고정” vs “reset 시점에 defaultDraft 재생성”)을 의도에 맞게 정리한다.

---

## 핵심 로직 3줄
- 1) `issueRepo/actionRepo`의 legacy 동기화는 현재 “호출마다” 동작할 여지가 있고, id 없는 legacy 문서는 normalize 과정에서 새 id가 생길 수 있다.
- 2) `logistics`는 날짜 단위 병합 + line dedupe를 하는데, fingerprint에 `site`가 없어 지부가 다른 라인이 유실될 수 있다.
- 3) daily 도메인의 문서 ID 정책이 생산/이슈/조치/사무에서 섞여 있어 조회/편집/중복 방지 규칙을 일관되게 적용하기 어렵다.

## 입문자 설명 3줄
- 1) “레거시 데이터 가져오기”가 한 번만 실행돼야 안전한데, 지금은 여러 번 실행될 수 있는 형태가 보여.
- 2) 유통 기록을 합칠 때 지부(대구/성주)를 구분하지 않으면, 서로 다른 기록이 같은 걸로 처리돼서 사라질 수 있어.
- 3) 페이지마다 문서 ID를 만드는 방식이 달라서, 나중에 조회 화면을 만들 때 기준을 못 맞추면 데이터가 헷갈려질 수 있어.

## 주의 사항
- 지금 문서는 “코드 스냅샷 기반 진단”이라, 실제 운영 데이터(legacy에 id가 항상 있는지/updatedAt 패턴이 어떤지)에 따라 위험도가 달라질 수 있다.
- 특히 `syncLegacy()` 관련 리스크는 “실제 legacy 데이터 모양”에 크게 의존하니, 샘플 데이터를 기준으로 재현 확인이 필요하다.

## 향후 과정
- 우선순위 P0를 코드로 반영하면 영향 범위는 `company-docs/src2/kernel/repo/domain/*Repo.ts` + `company-docs/src2/app/pages/register/hooks/logistics/merge.ts` 중심으로 묶인다.
- 적용 후에는 `company-docs/src2/docs/rule/GATES_CHECKLIST.md`의 G5(`npm run check:qa`)로 회귀를 증빙하고, `MIGRATION_STATUS.md`에 “정합성 가드레일 반영” 메모를 남기는 흐름이 필요하다.

## 이슈 상태
- `Open`: P0(legacy 동기화/유통 dedupe) 리스크는 실제 코드 변경으로 차단하기 전까지 데이터 증식/유실 가능성이 남아있다.


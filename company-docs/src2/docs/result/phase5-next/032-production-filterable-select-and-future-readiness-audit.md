# 생산 선택 자동완성 적용 + 미래 대비 체크리스트 강화 + 현재 상태 진단

> 작성일: 2026-02-13
> 주제: 생산 페이지부터 공용 선택 UX를 확장하고, BASIC 체크리스트에 조회/서버/보안/권한 대비 항목을 명시
> 해결 상태: Resolved

---

## 작업 배경
- 유통에서 먼저 적용한 단일 자동완성 선택 UX를 다른 일일 페이지로 확장하기 위해, 구조가 가장 유사한 생산 페이지를 1차 대상으로 선택했다.
- 기능 구현 속도 중심으로 흐르다 보면 조회/서버이관/권한 대비가 누락되기 쉬워, BASIC 체크리스트에 미래 대비 항목을 고정할 필요가 있었다.
- 사용자 요청에 따라 현재 상태가 "규칙 준수 중심"인지 "기능 추가 중심"인지 근거 기반으로 재진단했다.

## 변경 내용
- 생산 선택 UX 확장(1차)
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `생산품/품목` 입력을 공용 `FilterableSelect`로 변경
  - 검색은 포함 매칭(contains), 빈 입력에서 목록 열기 시 전체 옵션 노출
- 공용 선택 컴포넌트 정책 보강
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx`
  - `allowEmpty` 옵션 추가
  - 생산 도메인에는 `allowEmpty={false}`를 적용해 필수 선택 성격 유지
- 체크리스트 강화
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
    - 미래 대비 섹션 추가: 조회 구조, 서버이관, 보안, 계정/권한, 문서화
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
    - 일일 공용 체크리스트에 미래 대비(F 섹션) 추가
  - `src2/docs/rule/checklist/README.md`
    - 일일 공용 체크리스트가 미래 대비 항목까지 포함함을 명시
- 문서 동기화
  - `src2/docs/reference/feature-files-map-unified.md`
  - `src2/docs/rule/MIGRATION_STATUS.md`
  - `src2/docs/rule/DECISIONS_LOG.md`

## 현재 상태 진단(요청사항)
### 1) 잘 지켜지고 있는 축
- 구조/계층 원칙은 전반적으로 잘 지켜지고 있다.
  - `@legacy`/`impl`/direct localStorage 금지 자동 점검이 작동 중 (`scripts/security-check.mjs:7`)
  - repo 공통 계층 + audit 로그가 이미 적용됨 (`src2/kernel/repo/impl/localRepo.ts:40`, `src2/kernel/repo/impl/repoAudit.ts:70`)
- 일일 페이지 공통화는 실제 코드로 반영돼 있다.
  - 메타 공통(`DailyMetaFields`), 선택 공통(`FilterableSelect`), 상태/금액 공용 함수 분리 등

### 2) 부분 준수(진행 중)
- 문서 동기화/결과 기록은 지속되고 있으나, 최근 배치들이 기능 요구를 빠르게 반영하면서
  "사전 대비 항목(서버/권한/조회)" 점검은 약했다.
- 이번 배치에서 해당 공백을 BASIC과 daily 공용 체크리스트에 명시적으로 보강했다.

### 3) 아직 미흡하거나 미구현인 축
- 서버 이관: server repo는 아직 스텁 상태
  - `src2/kernel/repo/impl/serverRepo.ts:4` (`serverRepo not implemented`)
- 권한/계정 체계: 실제 auth/rbac 엔진 부재
  - 앱/커널 코드에 auth/permission/session/jwt 관련 구현 없음(검색 기준)
- 조회 재작성: browse 상세는 아직 SHADOW/참조용이며 신규 재작성 전
- 키 체계: `repo:*`와 `local_*` 혼재가 남아 있어 완전 정규화 전 단계
  - `src2/kernel/repo/keys.ts:2`, `src2/kernel/repo/keys.ts:3`

## 결론(질문에 대한 직접 답변)
- "그냥 기능 추가만 바빴냐"에 대한 답: 완전히 그렇진 않다.
  - 구조/규칙/게이트/문서화를 병행해온 건 맞다.
- 다만 "미래 대비(서버·권한·조회)"는 기능 리듬 대비 체크 밀도가 낮았고,
  - 이번에 체크리스트를 강화해 그 공백을 줄이는 방향으로 보정했다.

## 검증
- `cmd /c npm run build` PASS

## 간단 의견 + 다음 진행 질문
- 생산 페이지 1차 확장으로 공용 선택 UX의 일일 페이지 적용 경로가 검증됐다.
- 다음은 `office -> issue -> action` 순서로 같은 패턴을 확장하면서, 각 페이지별 `allowEmpty` 정책만 도메인에 맞춰 고정하면 된다. 이 순서로 바로 진행할까?

## 핵심 로직 3줄
- 1) 생산의 `생산품/품목` 선택을 공용 `FilterableSelect`로 교체해 단일 자동완성 UX를 재사용했다.
- 2) `FilterableSelect`에 `allowEmpty`를 추가해 도메인별 필수 선택 여부를 분리했다.
- 3) BASIC/일일 공용 체크리스트에 조회/서버/보안/권한 대비 항목을 명시해 미래 대비 점검을 강제했다.

## 입문자 설명 3줄
- 1) 이제 생산에서도 글자를 치면 아래 후보가 줄어들고, 거기서 골라서 선택할 수 있어.
- 2) 생산은 빈값이 되면 안 되니까 "선택 안함"을 막아뒀어.
- 3) 앞으로는 기능만 빨리 넣는 게 아니라, 나중 서버/권한/조회까지 버틸 구조인지 체크리스트로 같이 확인해.

## 주의 사항
- `FilterableSelect`는 공용화됐지만, 도메인마다 빈값 허용/미허용 정책이 다르므로 `allowEmpty`를 페이지별로 명시하지 않으면 회귀 위험이 있다.
- 체크리스트 항목이 늘어도 실제 작성본(checklist-result)을 생략하면 운영 효과가 사라진다.

## 향후 과정
- `office`, `issue`, `action` 선택 필드를 같은 패턴으로 확장하고, 각 도메인별 필수 선택 정책(`allowEmpty`)을 확정한다.
- 미래 대비 항목(F 섹션) 중 미구현 상태(auth/rbac/serverRepo 구현)를 phase6 설계/실행 체크리스트로 연결한다.

## 해결 상태
- `Resolved`: 생산 선택 UX 1차 확장, BASIC 미래 대비 체크 강화, 현재 상태 진단 및 문서 동기화 완료.

---

## 추가 업데이트 (같은 배치)
- 사용자 정책 결정 반영:
  - "민감정보 개별 분류" 대신 "회사 데이터 전량 민감 취급"을 체크리스트 기본값으로 고정
- 반영 문서:
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - `src2/docs/rule/MIGRATION_STATUS.md`
  - `src2/docs/rule/DECISIONS_LOG.md`
- 검증:
  - 문서 변경 배치(코드 변경 없음)

## 핵심 로직 3줄
- 1) 보안 체크 문구를 필드별 민감도 분류에서 "전량 민감 취급" 원칙으로 통일했다.
- 2) BASIC과 일일 공용 체크리스트를 동시에 수정해 정책 충돌을 제거했다.
- 3) STATUS/DECISIONS에 동일 결정을 기록해 이후 배치에서 재논쟁 없이 재사용 가능하게 고정했다.

## 입문자 설명 3줄
- 1) 이제 "어떤 데이터가 민감한지"를 따로 나누지 않고, 전부 민감하다고 보고 다룬다.
- 2) 그래서 체크리스트도 같은 기준으로 바뀌어서 헷갈릴 일이 줄어든다.
- 3) 다음 작업부터는 이 기준을 기본으로 바로 적용하면 된다.

## 주의 사항
- 전량 민감 취급 원칙을 선언만 하고 실제 권한/인증 구조(RBAC, 세션, 서버 정책)를 늦추면 문서-구현 간 괴리가 다시 생긴다.
- 향후 인증 도입 시 "프론트 로컬 저장 최소화 + 서버 권한검증 우선" 순서를 유지하지 않으면 보안 목표가 약해질 수 있다.

## 향후 과정
- phase6에서 인증/권한 설계 시 본 원칙을 SSOT 요구사항으로 먼저 고정한다.
- 페이지 리뉴얼 배치마다 checklist-result 작성 시 "전량 민감 취급" 항목의 준수 근거를 1줄로 남긴다.

## 해결 상태
- `Resolved`: 보안 체크리스트 문구를 "회사 데이터 전량 민감 취급"으로 정렬 완료.

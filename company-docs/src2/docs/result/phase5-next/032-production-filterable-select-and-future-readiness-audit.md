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

---

## 추가 업데이트 (2026-02-16)
- 생산 등록 페이지에서 제목 입력 UI를 제거하고 저장 시 제목을 자동 템플릿(`[일일][생산]`)으로만 생성하도록 고정했습니다.
- 생산 항목의 종류/품목 선택 기준을 유통 출고 기준과 맞추기 위해 `materialOptions.ts` 공용 상수를 신설하고 생산/유통이 함께 사용하도록 정리했습니다.
- 생산 페이지에 이슈 등록 모달을 추가했고, 기존 `useRegisterIssuePage` + `IssueRegisterForm`를 재사용했습니다.
- 모달 레이어는 물류 전용 경로에서 `sections/common/LayerModal.tsx`로 승격해 유통/생산 공용 구조로 통합했습니다.
- 이슈 제목 템플릿은 생산용 포맷(`[이슈][일일][생산]`)을 추가해 기록 규칙을 유통과 같은 방식으로 유지했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 생산 페이지 초안은 "제목 비노출 + 공용 선택 기준 + 이슈 연동" 축까지 반영돼 다음 페이지 확장 기준점으로 사용할 수 있는 상태입니다.
- 다음 배치에서 사무 페이지도 같은 정책(제목 자동생성, 공용 선택/모달 재사용)으로 이어서 정렬할까요?

## 핵심 로직 3줄
- 1) 생산 저장 제목은 수동 입력을 제거하고 `formatDailyProductionTitle` 템플릿으로 자동 생성합니다.
- 2) 생산/유통의 품목·종류 선택값은 `materialOptions.ts` 공용 상수로 단일화했습니다.
- 3) 생산 이슈 등록은 `useRegisterIssuePage`와 `IssueRegisterForm`를 공용 모달(`LayerModal`)로 조합해 재사용했습니다.

## 입문자 설명 3줄
- 1) 생산 페이지에서는 제목을 직접 입력하지 않아도 저장할 때 자동으로 만들어집니다.
- 2) 생산에서 고르는 종류와 품목 기준을 유통 기준과 맞춰서 다른 페이지와 규칙이 같아졌습니다.
- 3) 생산 화면에서도 이슈 등록 버튼을 눌러 같은 이슈 입력 폼을 바로 사용할 수 있습니다.

## 주의 사항
- 생산 품목/종류 상수를 공용화한 만큼, 이후 다른 페이지에서 임의 하드코딩을 추가하면 기준이 다시 분기될 수 있어 `materialOptions.ts` 단일 수정 원칙을 지켜야 합니다.
- 제목 입력 UI를 제거한 페이지가 늘어날수록 조회/관리 화면에서 제목 노출 정책을 함께 맞추지 않으면 표시 일관성이 깨질 수 있습니다.

## 향후 과정
- 사무 페이지에 동일한 제목 정책(입력 제거 + 자동생성)을 적용하고, 필요 시 템플릿 함수를 `titleTemplates.ts`에 추가합니다.
- 이슈/조치 연계 정책(이슈 제목 전달, 조치 자동 템플릿)을 생산/사무 컨텍스트까지 확장할지 결정해 훅 옵션을 정리합니다.
- manage 화면의 일일 기록 카드에서도 제목 비노출 정책을 공통 규칙으로 정리해 페이지 간 표시 편차를 제거합니다.

## 이슈 상태
- `Resolved`: 생산 페이지 초안(제목 제거, 공용 선택 기준 정렬, 이슈 등록 추가, 공용 모달 승격) 반영과 검증이 완료되었습니다.

---

## 추가 업데이트 (2026-02-16, 생산/유통 공용화 2차)
- 생산 페이지
  - `종류=PP/PE`, `품목=분쇄품/펠렛`으로 선택 축을 정렬했습니다.
  - `생산량(kg)` 입력을 제거하고 `생산수량(자루)`만 입력하도록 고정했습니다.
  - `내용/태그` 입력 블록을 제거하고 저장 데이터는 빈 details/tags로 통일했습니다.
  - 이슈에서 상태를 `완료`로 저장하면 같은 모달에서 조치 입력이 이어지도록 `IssueActionModal`을 공용 재사용했습니다.
- 유통 페이지
  - 방향/종류/품목 입력을 드롭다운으로 전환했습니다.
  - 유통 라인에 `비고(memo)`를 추가하여 입력/수정/저장/목록 표시까지 반영했습니다.
  - 기존 거래처 최근 1회 기반 자동선택(방향/품목/종류) 및 조합 기준 최근 단가 자동반영 로직은 유지했습니다.
- 공통 메타 정책
  - 지부는 내 정보 초기값으로만 자동 보강되고, 사용자가 수동으로 변경한 값은 유지되도록 `useActorProfileDraftSync`를 보정했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run check:qa:reuse-build` PASS

## 간단 의견 + 다음 진행 질문
- 생산/유통 공용화의 핵심 축(선택 구조, 메타 정책, 이슈-조치 연계)은 다음 일일 페이지(사무/회계)로 바로 확장 가능한 상태입니다.
- 다음 배치에서 사무 페이지도 `지부 수동 변경 허용 + 제목 비노출 자동생성 + 이슈 완료 시 조치 연계` 기준으로 같은 패턴을 적용할까요?

## 핵심 로직 3줄
- 1) 생산 입력은 `생산수량(자루)`만 검증하도록 변경하고, 저장 시 kg는 0으로 고정했습니다.
- 2) 생산 이슈 `완료` 시 `IssueActionModal`을 통해 조치 저장까지 같은 흐름으로 연결했습니다.
- 3) 유통 draft/line/schema에 `memo`를 추가하고, 타입 선택 UI를 드롭다운으로 통일했습니다.

## 입문자 설명 3줄
- 1) 생산에서는 무게를 직접 재지 않으므로 자루 수량만 입력하시면 됩니다.
- 2) 생산 이슈를 완료 처리하면 바로 조치 내용을 이어서 입력하실 수 있습니다.
- 3) 유통에서는 방향/종류/품목을 목록에서 선택하고, 필요한 메모를 비고에 함께 남길 수 있습니다.

## 주의 사항
- 유통 타입 UI가 드롭다운으로 바뀌었으므로, 자동선택 규칙 회귀 여부(거래처 변경 시 방향/품목/종류 + 단가)를 계속 점검해야 합니다.
- 생산은 내용/태그 입력이 제거되었기 때문에, 향후 조회 화면에서 해당 필드 의존 표시가 남아 있는지 추가 확인이 필요합니다.

## 향후 과정
- 사무/회계 페이지에 동일한 메타 정책(지부 초기 보강 + 수동 변경 허용)과 제목 자동생성 규칙을 확장 적용합니다.
- 이슈/조치 템플릿을 페이지 컨텍스트별로 추가 정리해 조치 제목 포맷을 완전히 통일합니다.
- 유통/생산 관리 화면에서 `memo` 노출 정책을 정리해 등록/관리 간 표시 편차를 제거합니다.

---

## 추가 업데이트 (2026-02-18, 온라인 전환 최소선 체크리스트 킥오프)
- 반영 문서:
  - `src2/docs/rule/checklist/online-minimum-line-checklist.md`
  - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - `src2/docs/rule/checklist/README.md`
  - `src2/docs/rule/checklist-result/basic/2026-02-18-online-minimum-line-kickoff.md`
  - `src2/docs/rule/checklist-result/online-minimum-line/2026-02-18-online-minimum-line-kickoff.md`
- 반영 내용:
  - 온라인 동시사용(4~5명) 전환 리스크를 줄이기 위해 최소선 3축(식별자, 충돌, 권한)을 별도 체크리스트 원본으로 신설했습니다.
  - BASIC 목차와 checklist 카탈로그에 신규 경로를 연결해 매 배치에서 선택 가능하도록 고정했습니다.
  - "전페이지 일괄 수정 금지, 일일 저장 경계 우선"을 체크 항목으로 명시해 대작업 확산을 선제 차단하도록 정렬했습니다.

## 간단 의견 + 다음 진행 질문
- 이제 다음 배치부터는 코드 변경 전에 같은 기준으로 누락 없이 점검할 수 있는 상태입니다.
- 다음 배치에서 `actorId(writerId) 기반 문서키 전환` 구현을 먼저 진행할까?

## 핵심 로직 3줄
- 1) 온라인 전환 최소선(식별자/충돌/권한) 전용 체크리스트 원본을 신설했다.
- 2) BASIC + 작업별 작성본을 함께 남기는 운영 경로를 문서 구조에 연결했다.
- 3) 대작업 확산을 막기 위해 "일일 저장 경계 우선" 범위 통제 항목을 명문화했다.

## 입문자 설명 3줄
- 1) 앞으로 온라인으로 바뀔 때 꼭 필요한 항목을 따로 체크리스트로 만들었어.
- 2) 기본 체크리스트와 이번 작업 체크리스트를 둘 다 기록하도록 폴더와 파일을 같이 만들었어.
- 3) 한 번에 전부 고치지 말고, 중요한 경계부터 순서대로 고치자는 기준을 문서로 고정했어.

## 주의 사항
- 체크리스트만 만들고 실제 코드 배치에서 작성본을 생략하면 운영 효과가 즉시 사라진다.
- actorId/충돌/권한 3축 중 하나라도 다음 배치에서 밀리면 온라인 전환 시 재작업 범위가 다시 커질 수 있다.

## 향후 과정
- 다음 배치에서 `production -> office -> issue -> action -> logistics` 순으로 writerId(actorId) 저장 강제와 문서키 전환을 적용한다.
- 같은 배치에서 `updatedAt` 기반 충돌 가드를 일일 저장 커맨드 경계에 우선 도입한다.
- 권한은 우선 `canRead/canWrite/canDelete` 포인트만 도입하고 실제 정책은 phase6 서버/인증 배치에서 본구현한다.

## 이슈 상태
- `Open`: 체크리스트 체계 신설 완료, 실제 코드 최소선 적용(actorId/충돌/권한 포인트)은 다음 배치에서 수행 예정.

---

## 추가 업데이트 (2026-02-18, 온라인 최소선 1차 코드 적용: 생산 actorId 문서키)
- 반영 코드:
  - `src2/app/pages/register/hooks/production/constants.ts`
  - `src2/app/pages/register/hooks/production/commands.ts`
  - `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
  - `src2/kernel/schema/daily/productionTypes.ts`
- 반영 내용:
  - 생산 저장 문서키를 `writerName` 중심에서 `actorId(writerId)` 우선 키로 전환했습니다.
  - 기존 `writerName` 기반 문서키는 fallback으로 탐색하고, 신키 저장 시 구키 문서를 삭제해 중복(구키+신키) 2건이 남지 않도록 처리했습니다.
  - 생산 저장 레코드에 `writerId`를 함께 기록해 이후 조회/권한 분기 축으로 활용 가능하게 정렬했습니다.
  - 범위는 생산 저장 경계로 한정해 전페이지 일괄 수정을 피하고 점진 이관 시작점으로 고정했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run check:qa:reuse-build` PASS

## 간단 의견 + 다음 진행 질문
- 키 전환의 핵심 리스크(기존 문서와의 단절, 중복 생성)는 생산 경계에서 먼저 줄였습니다.
- 다음 배치에서 같은 패턴을 `office -> issue -> action -> logistics` 순으로 확장할까?

## 핵심 로직 3줄
- 1) 생산 문서 ID는 `recordDate + site + actorId` 우선으로 생성한다.
- 2) 저장 시 구키(writerName) 문서를 fallback으로 찾아 `createdAt`을 보존하고, 신키 저장 후 구키를 제거한다.
- 3) 저장 레코드에 `writerId`를 기록해 온라인 권한/조회 축의 기본 식별자를 확보한다.

## 입문자 설명 3줄
- 1) 이제 생산 일지는 이름이 아니라 사용자 고유 ID 기준으로 묶이기 시작했습니다.
- 2) 예전에 이름 기준으로 저장된 일지도 저장할 때 자동으로 새 기준으로 옮겨 중복이 남지 않게 했습니다.
- 3) 누가 썼는지(`writerId`)를 같이 저장해 나중에 조회/권한 기능을 붙이기 쉬운 구조로 바꿨습니다.

## 주의 사항
- 현재는 생산 경계만 적용된 상태라 다른 일일 페이지는 아직 writerName 키 의존이 남아 있습니다.
- 충돌 가드(`updatedAt` 비교)와 권한 분기 포인트는 아직 미적용이라 다음 배치에서 이어서 반영해야 합니다.

## 향후 과정
- 같은 키 전환 패턴을 `office -> issue -> action -> logistics` 순으로 확장 적용합니다.
- 다음 배치에서 저장 커맨드 경계에 `getById -> updatedAt` 충돌 가드를 도입합니다.
- 이후 배치에서 `canRead/canWrite/canDelete` 권한 분기 포인트를 라우트/커맨드 경계에 추가합니다.

## 이슈 상태
- `Open`: 생산 경계 키 전환은 완료, 일일 전페이지 확장 + 충돌/권한 포인트는 후속 배치에서 진행 예정.

---

## 추가 업데이트 (2026-02-18, 온라인 최소선 2차 코드 적용: 유통 actorId 문서키)
- 반영 코드:
  - `src2/app/pages/register/hooks/logistics/constants.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - `src2/app/pages/register/hooks/logistics/merge.ts`
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - `src2/kernel/schema/daily/_common.ts`
- 반영 내용:
  - 유통 저장 문서키를 `writerName` 중심에서 `actorId(writerId)` 우선 키로 전환했습니다.
  - 기존 writerName 기반 키는 fallback으로 탐색하고, 신키 저장 시 구키 문서를 삭제해 중복 잔존을 막았습니다.
  - 유통 병합 로직을 `recordDate` 단일축에서 `recordDate + site + actor` 축으로 보정해 사용자/지부 혼합 병합 위험을 줄였습니다.
  - 저장 레코드에 `writerId`와 `site`를 함께 기록해 이후 권한/조회 축과 맞췄습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 유통 경계에서는 키 전환과 병합축 정렬이 끝나서 온라인 전환 시 가장 큰 혼합 리스크를 먼저 줄였습니다.
- 다음 배치는 유통에 `getById -> updatedAt` 충돌 가드를 추가하고, 이후 오피스/이슈/조치를 리뉴얼 배치에서 같은 패턴으로 적용할까?

## 핵심 로직 3줄
- 1) 유통 문서 ID를 `recordDate + site + actorId` 우선으로 생성한다.
- 2) 저장 시 구키(writerName) 문서를 fallback으로 찾고, 신키 저장 후 구키를 제거한다.
- 3) 레코드 병합 키를 date-only에서 date+site+actor로 변경해 잘못된 병합을 방지한다.

## 입문자 설명 3줄
- 1) 유통 일지는 이제 이름이 아니라 사용자 ID 중심으로 묶입니다.
- 2) 예전 이름 기준 데이터도 저장할 때 자동으로 새 기준으로 정리돼 중복이 남지 않게 했습니다.
- 3) 같은 날짜라도 지부/작성자가 다르면 서로 섞여 합쳐지지 않도록 바꿨습니다.

## 주의 사항
- 이번 배치는 유통에만 적용됐으므로 오피스/이슈/조치는 아직 기존 키 정책이 남아 있습니다.
- 충돌 가드(`updatedAt` 비교)와 권한 포인트는 아직 미적용이라 후속 배치에서 이어서 반영해야 합니다.

## 향후 과정
- 유통 저장 커맨드에 `getById -> updatedAt` 충돌 가드를 추가합니다.
- 권한 분기 포인트(`canRead/canWrite/canDelete`)는 충돌 가드 배치와 함께 라우트/커맨드 경계에 도입합니다.
- 오피스/이슈/조치는 리뉴얼 배치에서 동일한 actorId 키 전환 패턴을 재사용 적용합니다.

## 이슈 상태
- `Open`: 유통 키 전환/병합축 정렬 완료, 충돌/권한 포인트와 타 일일 페이지 확장은 후속 배치 진행 예정.

---

## Additional Update (2026-02-18, online minimum line phase3: logistics conflict guard + permission split)
- changed code:
  - `src2/app/pages/register/hooks/logistics/permissions.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - `src2/app/pages/register/hooks/logistics/lineEdit.ts`
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- summary:
  - Added optimistic conflict guard using `getById -> updatedAt` comparison before save.
  - Added permission split points (`canRead/canWrite/canDelete`) at read/write/delete command boundaries.
  - Implemented default allow-all permission provider as isolated module to keep code reusable and avoid one-page growth.

## verification
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build` skipped by user request (speed-first)

## short opinion + next question
- Logistics online minimum line (identifier + merge axis + conflict + permission points) is now in place.
- Next batch can either extend same boundary pattern to `office/issue/action` or pause and consolidate manage/browse integration first.

## 핵심 로직 3줄
- 1) Save now aborts when latest `updatedAt` differs from expected value.
- 2) Read/write/delete commands now expose permission split points.
- 3) Permission defaults are isolated in one helper module for future server-auth wiring.

## 입문자 설명 3줄
- 1) 다른 사용자가 먼저 수정한 데이터면 저장 전에 충돌을 감지해서 덮어쓰지 않게 했어.
- 2) 조회/저장/삭제에 권한 체크 자리를 미리 만들어 뒀어.
- 3) 지금은 모두 허용이지만, 나중에 계정/직책 붙일 때 이 자리만 교체하면 돼.

## 주의 사항
- Conflict guard uses document-level `updatedAt`; fine-grained line-level conflict is still not implemented.
- Permission provider is currently allow-all; policy enforcement needs real auth source in later phase.

## 향후 과정
- Apply same conflict/permission boundary pattern to `office`, `issue`, `action` during their renewal batches.
- Replace default permission provider with role/account policy when server auth is introduced.
- Add focused conflict UX message handling in UI if user retry flow is required.

## 이슈 상태
- `Open`: logistics minimum line is complete, cross-page rollout and real auth policy remain.

---

## 추가 업데이트 (2026-02-18, 온라인 최소선 4차 코드 적용: office/issue/action 충돌/권한)
- 반영 코드:
  - `src2/app/pages/register/hooks/office/permissions.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/issue/permissions.ts`
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
  - `src2/app/pages/register/hooks/action/permissions.ts`
  - `src2/app/pages/register/hooks/action/commands.ts`
  - `src2/app/pages/register/hooks/useRegisterActionPage.ts`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
- 반영 내용:
  - office/issue/action에 `canRead/canWrite/canDelete` 권한 분기 포인트를 추가했습니다(현재는 allow-all 기본값).
  - issue/action 저장 경계에 `getById -> updatedAt` 기반 충돌가드를 추가했습니다.
  - office/issue/action 삭제 경계에서 권한/대상 검증 실패 메시지를 반환하도록 정리했습니다.
  - 삭제 버튼 핸들러를 async로 바꿔 실패 메시지를 즉시 알림(alert)으로 노출하도록 연결했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 유통에 이어 office/issue/action까지 최소선(충돌/권한 포인트)이 맞춰져서 일일 저장 경계의 온라인 리스크가 크게 줄었습니다.
- 다음 배치에서 권한 provider를 공통 파일로 모아 중복을 줄일까, 아니면 지금처럼 도메인별 분리 상태를 유지할까?

## 핵심 로직 3줄
- 1) office/issue/action에 read/write/delete 권한 포인트를 저장/삭제 경계에 주입했다.
- 2) issue/action은 저장 직전 최신 `updatedAt`을 재조회해 충돌 시 저장을 중단한다.
- 3) 삭제 경계는 성공/실패 메시지를 반환하고 UI 버튼에서 즉시 사용자에게 알린다.

## 입문자 설명 3줄
- 1) 이제 사무/이슈/조치도 누가 읽고 저장하고 삭제할지 체크할 자리(권한 포인트)가 생겼어.
- 2) 다른 사람이 먼저 수정한 문서를 내가 덮어쓰지 않게 충돌을 먼저 확인해.
- 3) 삭제가 안 되는 경우도 이유를 바로 화면 알림으로 확인할 수 있어.

## 주의 사항
- 권한은 현재 allow-all 기본값이라 실제 차단 정책은 서버 인증/역할 정보 연결 전까지 동작하지 않는다.
- 충돌가드는 문서 단위 `updatedAt` 기준이라 동일 문서 내 항목 단위 동시편집 충돌까지는 구분하지 않는다.

## 향후 과정
- 서버 인증 도입 배치에서 permissions provider를 계정/직책 기반 정책으로 교체한다.
- 필요 시 issue/action 문서 내 item 단위 충돌전략(예: item version) 도입 여부를 결정한다.
- manage/browse에서도 권한/충돌 메시지 표준을 맞춰 사용자 경험 편차를 줄인다.

## 이슈 상태
- `Open`: 최소선 포인트 확장은 완료, 실권한 정책 연결과 세분화된 충돌전략은 후속 배치.

---

## 추가 업데이트 (2026-02-18, 온라인 최소선 5차 코드 적용: 이슈 command 동일화)
- 반영 코드:
  - `src2/app/pages/register/hooks/issue/types.ts`
  - `src2/app/pages/register/hooks/issue/commands.ts`
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
- 반영 내용:
  - 이슈 저장/삭제 로직을 `useRegisterIssuePage` 내부 구현에서 `issue/commands.ts`로 분리했습니다.
  - `IssueRegisterDraft`, `IssueSubmitOptions`, `IssueSubmitResult`를 `issue/types.ts`로 분리해 hook/command 간 계약을 명확히 했습니다.
  - 기존 충돌가드(`updatedAt`)와 권한 포인트(`canWrite/canDelete`)는 command 경계에서 동일하게 유지했습니다.
  - 결과적으로 유통/생산/조치/이슈의 저장 경계 구조가 같은 패턴으로 정렬됐습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 이슈까지 command 경계로 정렬돼서 이후 권한 정책/충돌 정책 확장 시 수정 포인트가 줄었습니다.
- 다음 배치에서 office도 submit/remove 결과 타입을 공통 `SubmitResult`로 맞춰 command 계약을 더 통일할까?

## 핵심 로직 3줄
- 1) 이슈 submit/remove 로직을 hook에서 command 파일로 이동했다.
- 2) 이슈 draft/submit 계약 타입을 별도 types 파일로 분리했다.
- 3) 충돌가드와 권한 포인트는 command 경계에 그대로 유지해 정책 확장 기반을 고정했다.

## 입문자 설명 3줄
- 1) 이제 이슈 페이지도 저장하는 핵심 코드는 별도 명령 파일에서 처리해.
- 2) 화면 훅은 입력 상태를 관리하고 명령을 호출만 해서 구조가 단순해졌어.
- 3) 나중에 권한/충돌 정책을 바꿀 때도 명령 파일만 보면 돼서 수정이 쉬워졌어.

## 주의 사항
- 현재 권한 provider는 allow-all 기본값이라 실제 차단 정책은 서버 인증 연결 후에만 동작한다.
- 이슈 문서 키는 아직 writerName 기반이므로 actorId 전환 배치는 별도로 남아 있다.

## 향후 과정
- issue 문서키도 actorId(writerId) 우선으로 전환해 식별자 축까지 통일한다.
- office/action/issue command 반환 타입을 공통형으로 정리해 UI 핸들러 분기 중복을 줄인다.
- 서버 인증 도입 시 command 경계의 canRead/canWrite/canDelete를 실제 정책 provider로 교체한다.

## 이슈 상태
- `Open`: command 동일화 완료, actorId 키 전환과 실권한 정책 연결은 후속 배치.

---

## 추가 업데이트 (2026-02-18, 드래프트 이탈 유실 가드레일 보강)
- 반영 코드:
  - `src2/kernel/draft/useDraft.ts`
- 반영 내용:
  - 공통 draft 훅에 dirty 상태 autosave(120ms debounce) 가드를 추가했습니다.
  - 페이지 훅에서 `saveDraft` 호출이 일부 누락되더라도, 입력 변경(`setDraft`) 후 페이지 이탈 시 유실 위험을 줄이도록 보강했습니다.
  - 기존 명시적 `saveDraft` 호출 구조는 유지하고, 누락 대비 안전망만 추가한 형태입니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 드래프트는 실제 사용성 가치가 커서 제거보다 신뢰성 보강이 맞고, 이번 가드레일은 그 방향에 맞는 최소 보강입니다.
- 다음 배치에서 페이지별로 `saveDraft` 중복 호출을 정리해도 될까? (공통 autosave가 있으니 단순화 가능)

## 핵심 로직 3줄
- 1) `useDraft`는 dirty=true 상태를 감지하면 120ms 후 자동 저장한다.
- 2) autosave 후 dirty=false로 전환해 반복 저장을 억제한다.
- 3) 호출 누락이 있어도 공통 훅 레벨에서 저장 신뢰성을 확보한다.

## 입문자 설명 3줄
- 1) 이제 입력을 바꾼 뒤 저장 함수를 따로 못 타도 잠깐 후 자동으로 임시저장돼.
- 2) 그래서 페이지를 벗어나도 작성 내용이 사라질 가능성이 줄어들었어.
- 3) 기존 저장 방식은 그대로 두고, 안전장치만 하나 더 넣은 거야.

## 주의 사항
- 매우 빠른 연속 입력/이탈 직전에는 브라우저 이벤트 타이밍상 극단 케이스가 남을 수 있어, 주요 입력 경계의 명시적 saveDraft 호출도 계속 유지하는 편이 안전하다.
- autosave는 localStorage 기반이므로 저장 용량/브라우저 정책 영향은 기존과 동일하게 받는다.

## 향후 과정
- 페이지별 `saveDraft` 호출 중복 구간을 점검해 `setDraft + autosave` 기준으로 단순화 가능 범위를 분리한다.
- 초안 초기화/제출 후 clear 흐름(discardDraft)과 autosave 타이밍 충돌이 없는지 회귀 체크를 추가한다.
- 필요 시 `useDraft`에 옵션(`autosaveDelayMs`, `autosaveEnabled`)을 열어 페이지별 정책 튜닝 포인트를 제공한다.

## 이슈 상태
- `Open`: 드래프트 신뢰성 가드 반영 완료, 페이지별 중복 save 호출 정리는 후속 최적화 배치.

---

## 추가 업데이트 (2026-02-18, 드래프트 초기화 레이스 수정)
- 반영 코드:
  - `src2/kernel/draft/useDraft.ts`
- 반영 내용:
  - `useDraft`의 초기 draft 값을 mount 후 비동기 로드가 아니라, state 초기화 시점 동기 로드로 전환했습니다.
  - mount 직후 `setTimeout(0)` 로드 경로를 제거해 actor/profile 동기화가 먼저 저장을 실행하면서 기존 draft를 덮어쓰는 타이밍 레이스를 차단했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 이번 수정은 “여전히 초기화된다” 증상의 직접 원인(로드 순서 레이스)을 겨냥한 수정이라, 이전 autosave 보강보다 효과가 큽니다.
- 네가 실제로 문제가 나던 페이지(예: 이슈/생산/유통)에서 1회 재현 테스트를 같이 체크할까?

## 핵심 로직 3줄
- 1) draft 초기값을 localStorage에서 동기 로드해 첫 렌더부터 복원값을 사용한다.
- 2) mount 직후 비동기 로드 타이머를 제거해 초기 덮어쓰기 레이스를 없앤다.
- 3) 기존 dirty autosave 가드와 함께 저장 신뢰성을 이중으로 확보한다.

## 입문자 설명 3줄
- 1) 이제 페이지가 열릴 때 임시저장을 바로 읽어와서 먼저 보여줘.
- 2) 예전처럼 “잠깐 기본값이 먼저 저장돼서 기존 내용이 사라지는” 타이밍 문제가 줄었어.
- 3) 그래서 페이지 이탈 후 다시 들어와도 초안 복원이 더 안정적으로 동작해.

## 주의 사항
- 저장소에 깨진 JSON이 이미 들어가 있으면 복원 실패는 여전히 가능하므로, 필요 시 해당 키 초기화가 필요할 수 있다.
- 제출 직후 discardDraft 동작은 의도된 초기화이므로, 이 경우는 복원 대상이 아니다.

## 향후 과정
- 실제 사용자 시나리오(입력 -> 페이지 이탈 -> 재진입)를 이슈/생산/유통 페이지에서 각각 1회씩 수동 검증한다.
- 필요 시 `useDraft`에 debug flag를 넣어 로드/저장 이벤트를 콘솔로 추적 가능하게 한다.
- autosave delay(120ms)가 체감상 길거나 짧으면 옵션화(`autosaveDelayMs`)를 검토한다.

## 이슈 상태
- `Open`: 레이스 원인 수정 완료, 실사용 재현 시나리오 확인은 후속 점검.

---

## 추가 업데이트 (2026-02-18, 생산 항목 추가 입력폼 드래프트 복원 수정)
- 반영 코드:
  - `src2/kernel/schema/daily/productionTypes.ts`
  - `src2/app/pages/register/hooks/production/constants.ts`
  - `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
- 반영 내용:
  - 생산 항목 추가 입력폼(`lineDraft`)을 로컬 state에서 `ProductionDraft` 필드로 이동해 같은 draft 키로 저장되게 수정했습니다.
  - 기존 저장 데이터(구버전 draft)에 `lineDraft`가 없는 경우를 위해 migrate fallback(`lineDraft || buildDefaultLine()`)을 추가했습니다.
  - 생산 항목 추가 후 입력폼 초기화도 draft 내부 값(`lineDraft`)을 기본값으로 재설정하는 방식으로 정렬했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 네가 지적한 증상(생산 항목 추가 구역만 초기화)은 구조 원인과 일치했고, 이번 수정으로 해당 구역도 이탈 후 복원됩니다.
- 실제 사용 흐름에서 `생산 항목 추가` 입력 중 이탈/복귀 1회만 확인해볼까?

## 핵심 로직 3줄
- 1) ProductionDraft에 `lineDraft`를 추가해 생산 항목 입력폼 상태를 draft 저장 대상으로 편입했다.
- 2) `useRegisterProductionPage`는 로컬 line state 대신 draft-backed setter를 사용한다.
- 3) 구버전 draft 데이터도 migrate로 안전하게 복원되도록 기본값 보강을 넣었다.

## 입문자 설명 3줄
- 1) 이제 생산 항목 입력칸도 임시저장 대상이라 페이지를 벗어나도 내용이 남아.
- 2) 예전에 저장된 초안에는 이 값이 없어도 자동으로 기본값을 채워서 깨지지 않아.
- 3) 항목 추가 후 입력칸 초기화도 같은 임시저장 구조 안에서 동작해 일관성이 맞아졌어.

## 주의 사항
- lineDraft를 draft에 포함했으므로 저장 크기가 조금 증가한다(영향은 경미).
- 제출 후 discardDraft는 의도된 초기화이므로 제출 직후 복원되지 않는 것은 정상 동작이다.

## 향후 과정
- 생산 페이지에서 입력 중 이탈/복귀 시나리오를 실제로 1회 수동 검증한다.
- 필요 시 다른 페이지의 보조 입력폼(로컬 state 기반)이 남아있는지 동일 패턴 점검을 수행한다.
- draft migrate 로직은 스키마 변경 시 누락되지 않게 체크리스트 항목으로 고정한다.

## 이슈 상태
- `Open`: 코드 수정/검증 완료, 사용자 체감 재현 테스트 확인 대기.

---

## 추가 업데이트 (2026-02-18, 주소 변경 후 화면 미전환(stale view) 대응)
- 반영 코드:
  - `src2/app/routes/routes.tsx`
- 반영 내용:
  - `useLocation()`을 사용해 `<Routes location={location} key={location.pathname}>`로 변경했습니다.
  - 경로가 바뀌면 라우트 트리가 확실히 리마운트되도록 해 URL/화면 불일치 증상을 방지합니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS
- `check:qa:reuse-build`는 사용자 요청으로 생략(속도 우선)

## 간단 의견 + 다음 진행 질문
- 이 패치는 “원인 미확정 상태에서도 사용자 체감 장애를 즉시 차단”하는 안전조치입니다.
- 네 환경에서 같은 경로 전환(생산 -> 다른 페이지)을 한 번만 다시 확인해줄래?

## 핵심 로직 3줄
- 1) 현재 location 객체를 Routes에 명시 전달한다.
- 2) pathname을 key로 사용해 경로 변경 시 라우트 트리를 강제 재생성한다.
- 3) 주소만 바뀌고 화면이 유지되는 상태를 구조적으로 차단한다.

## 입문자 설명 3줄
- 1) 페이지 주소가 바뀌면 화면도 반드시 새로 그리도록 바꿨어.
- 2) 그래서 주소-화면이 어긋나는 현상을 줄일 수 있어.
- 3) 새로고침해야만 이동되던 증상을 우선 막는 안전장치야.

## 주의 사항
- 리마운트 방식이라 페이지 이동 시 컴포넌트 내부 일시 상태는 더 빨리 초기화될 수 있다(드래프트 저장은 별도 유지).
- 근본 원인(특정 페이지 런타임 예외/이벤트 충돌)이 남아있다면 후속 로그 기반 분석이 필요하다.

## 향후 과정
- 재현이 계속되면 브라우저 콘솔 에러/경고를 기준으로 근본 원인(특정 페이지 렌더 예외)을 추적한다.
- 필요 시 production 페이지와 대상 페이지 전환 구간에 최소 debug 로그를 임시 삽입해 이벤트 흐름을 확인한다.
- 원인 확정 후 pathname key 리마운트를 유지할지, 제거하고 근본 수정만 남길지 결정한다.

## 이슈 상태
- `Open`: 체감 장애 차단 패치 반영 완료, 재현 여부 확인 후 근본 원인 추적 여부 결정.

---

## 추가 업데이트 (2026-02-18, Maximum update depth 루프 원인 수정 + 우회패치 롤백)
- 반영 코드:
  - `src2/kernel/draft/useDraft.ts`
  - `src2/app/routes/routes.tsx` (우회 패치 롤백)
- 반영 내용:
  - 루프 원인: `migrate` 함수 참조가 렌더마다 바뀌면서 `loadDraft` effect가 반복 실행되어 상태 갱신 루프 발생.
  - 수정: `migrate`를 ref로 고정(`migrateRef`)하고 effect 의존성을 안정화해 무한 업데이트를 차단.
  - 판단: 원인과 무관한 라우트 강제 리마운트 패치(`key={pathname}`)는 유지하지 않고 롤백.

## 검증
- `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) migrate 함수는 ref에 보관해 렌더마다 참조 변경이 있어도 load effect가 재폭주하지 않는다.
- 2) draft load 경계는 key/repo 변화에만 반응하도록 안정화한다.
- 3) 원인 아닌 우회 패치는 제거해 코드 복잡도를 늘리지 않는다.

## 입문자 설명 3줄
- 1) 임시저장 로직이 자기 자신을 계속 다시 호출해서 무한 반복되던 문제를 막았어.
- 2) 함수 주소가 바뀌어도 매번 다시 실행되지 않게 고정값으로 다뤘어.
- 3) 원인 아닌 임시 우회코드는 빼서 코드가 더 꼬이지 않게 정리했어.

## 주의 사항
- 유사 패턴(함수를 옵션으로 넘기고 effect 의존성에 직접 포함)에서 같은 루프가 재발할 수 있어 동일 기준을 유지해야 한다.

## 향후 과정
- 문제 재현 경로(생산 -> 다른 페이지 전환)를 다시 확인해 주소/화면 불일치가 재발하는지 점검.

## 이슈 상태
- `Open`: 루프 원인 수정 완료, 사용자 재현 확인 대기.

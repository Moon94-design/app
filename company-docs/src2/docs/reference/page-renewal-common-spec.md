# Page Renewal Common Spec
작성일: 2026-02-12
목적: 모든 페이지 리뉴얼/신규 생성 작업에서 공통으로 따라야 할 구현 기준(참조 순서, UX, 데이터, 검증, 문서화)을 고정한다.

---

## 0) 적용 범위
- 대상: `src2/app/pages/**` 리뉴얼 및 신규 페이지 작성
- 우선순위: 안정화 > 기능 정확성 > 구조 개선
- 원칙: 무분별한 분해보다 동작 정합성(저장/조회/연계/문구) 우선

---

## 1) 작업 시작 전 필수 참조 순서
1. `src2/docs/reference/page-renewal-common-spec.md` (이 문서)
2. `src2/docs/reference/feature-files-map-unified.md` (전체 파일맵)
3. 도메인 기능맵 (해당 작업에 맞는 파일)
   - register 계열: `src2/docs/reference/register-daily-files.md`
   - partner/manage 계열: `src2/docs/reference/partner-manage-files.md`
4. `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
5. `src2/docs/rule/main_rule.md`

참조 규칙:
- 파일 생성/분리/이동 전에는 반드시 1~3을 먼저 확인한다.
- 체크리스트는 1~3 참조 후에만 체크를 시작한다.

---

## 2) 공통 아키텍처 기준
- 페이지(`*Page.tsx`): 조립/배치 책임만 가진다.
- 훅(`use*Page.ts`): orchestration(상태 조합, command 호출) 중심으로 유지한다.
- 저장/검증/파생 계산은 `hooks/{domain}/commands.ts`, `selectors.ts`, `constants.ts`로 분리 가능하되 과분해 금지.
- 공통 로직은 `@kernel` 우선 재사용하고, 중복 helper를 페이지 내부에 새로 만들지 않는다.

과분해 금지 기준:
- 안정화 단계에서는 동작 변경 없는 분해를 새로 시작하지 않는다.
- 파일 크기만으로 즉시 분해하지 않고, 실제 변경 충돌/회귀 위험이 있을 때만 분해한다.

---

## 3) UI/UX 공통 기준

### 3-1) 입력 폼
- 일일 페이지 상단 메타는 `기록일 / 지부 / 작성자 / 직책` 4항목으로 통일한다.
- `사업장` 용어는 사용하지 않고 사용자 노출 문구는 `지부`로 고정한다.
- 상단 메타 입력은 `src2/kernel/components/record/DailyMetaFields.tsx` 공용 컴포넌트를 사용한다.
- 작성자/직책은 기본적으로 한 줄 2열(`form-two-col`) 배치.
- 기록일 입력 필드는 페이지 간 폭/스타일 통일.
- 저장 버튼은 폼 하단 동일 위치에 배치.
- 자동 추천/자동완성된 값(예: 단가)은 기본적으로 수동 수정 가능해야 한다.
- 수정 불가(잠금) 정책은 별도 요구가 있을 때만 적용한다.
- 방향이 `처리`일 때는 PP/PE 선택 영역을 숨기고, `종류`에서 폐기물/폐수를 선택한다.

### 3-2) 저장 후 동작
- 저장 성공 시 토스트 또는 명확한 성공 피드백 제공.
- 기본값: 날짜(`recordDate`) 유지, 나머지 입력 초기화.
- 페이지 예외가 있으면 result 문서에 근거를 남긴다.

### 3-3) 목록 표시
- 일일 등록 페이지 기본은 `선택한 날짜 기록` 우선.
- `최근 기록`은 요구사항에 있을 때만 노출.

### 3-4) 문구/톤
- 사용자 노출 문구는 존댓말 기준 통일.
- 동일 의미의 검증 문구는 페이지마다 다르게 쓰지 않는다.

---

## 4) 기준정보(마스터) 공통 기준

### 4-1) 빠른 추가(Quick Add)
- 선택 필드 옆 `+ 추가` 버튼 패턴을 기본으로 사용.
- 모달 입력 폼은 해당 마스터 등록 폼을 재사용(중복 UI 구현 금지).
- 추가 후 페이지 이동 없이 현재 위치에서 선택/반영.

### 4-2) 중복 방지(Dedup)
- 모든 기준정보는 동일 정책 계열로 처리.
- 공통 유틸: `src2/kernel/utils/masterDedup.ts`
- 기준 키:
  - partner: 이름 + 세부
  - vehicle: 차량번호
  - agency/vendor/equipment/consumable/employee: 기본 이름(필요 시 세부 확장)
- 중복 발견 시 신규 등록 차단 + 기존 항목 수정 유도(인라인 UX 우선).

---

## 5) 제목/태그/연계 공통 기준

### 5-1) 제목
- 자동 제목은 `AutoTitleField` 또는 `titleTemplates` 사용.
- 템플릿 SSOT: `src2/kernel/schema/daily/titleTemplates.ts`
- 제목 규칙은 페이지 하드코딩 대신 템플릿 함수로 관리.
- 유통/이슈/조치(유통 연계)는 태그 접두사(`[일일][유통]`, `[이슈][일일][유통]`, `[조치][일일][유통]`)를 공통 템플릿으로 유지한다.

### 5-2) 태그
- 태그 입력은 `TagBlock` 기준 통일.
- 태그 추천/인덱스는 `src2/kernel/utils/tagIndex.ts` 사용.
- 개인/기준 태그 추천 정책 재구현 금지.

### 5-3) 이슈/조치 연계
- 연계 입력은 `IssueRegisterForm`, `ActionRegisterForm` 재사용.
- 컨텍스트별(예: 유통 일일) 제목 템플릿/기록일 고정은 옵션으로 전달.
- 연계 필드 노출 여부도 옵션으로 제어.

---

## 6) 데이터/저장 공통 기준
- `localStorage` 직접 접근 금지, repo/domain contract 사용.
- storage key 하드코딩 금지(`src2/kernel/repo/keys.ts`만 사용).
- UI에서 `repo/impl/*` 직접 import 금지.
- 정렬은 `sortByRecordDateUpdated` 공통 사용.
- 오늘 날짜 기본값은 `todayYmd` 사용.
- 지부 옵션은 `src2/kernel/schema/daily/siteOptions.ts`의 공용 상수(`DAILY_BRANCH_OPTIONS`)를 사용한다.

---

## 7) 검증 기준 (Gate)
- 코드 변경 시 기본:
  - `npm.cmd run build`
  - `npm.cmd run lint:src2` (가능한 경우)
- 수동 시나리오 최소 5개:
  - 저장
  - 수정/삭제
  - 중복 차단
  - 초기화
  - 연계(이슈/조치 등)

---

## 8) 문서 최신화 의무 (항상)
- 수정사항이 발생하면 아래 문서를 항상 최신화한다.
  - 공통 규칙 변경: `page-renewal-common-spec.md`
  - 파일 추가/이동/역할 변경: `feature-files-map-unified.md`
  - 도메인 구조/LOC/우선순위 변경: 해당 도메인 기능맵(`register-daily-files.md`, `partner-manage-files.md` 등)
- 작업마다 체크리스트 결과를 `src2/docs/result/checklist/NNN-*.md`에 남긴다.
- result 문서는 작업 단위 번호로 생성한다 (`009`, `010`, `011`...)
- 한 result 파일에 무한 누적하지 않는다.

---

## 9) 리뉴얼/신규 요청 템플릿
- 대상 페이지:
- 유지할 기존 동작:
- 제거할 동작:
- 신규 요구사항:
- 저장 후 초기화 규칙:
- 목록 표시 규칙(선택일/최근):
- 빠른추가 대상 필드:
- 중복방지 기준 키:
- 제목 템플릿 규칙:
- 태그 정책:
- 이슈/조치 연계 필요 여부:
- 작성자 고정(계정 연동) 적용 여부:

---

## 10) 현재 프로젝트 고정 결정 (2026-02-12)
- 추가 분해 작업은 일시 중단.
- 다음 리뉴얼은 기능 안정화/회귀 점검 우선.
- 구조 변경은 필요 근거가 있을 때만 최소 범위 수행.

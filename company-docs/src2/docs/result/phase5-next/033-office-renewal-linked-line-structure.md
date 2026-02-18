# 033-office-renewal-linked-line-structure

> 작성일: 2026-02-18
> 주제: 사무일지 리뉴얼(항목추가 구조 + 기준정보 연계 2단 선택)
> 이슈 상태: Open

---

- 변경 요약
  - 사무 입력 구조를 `관공기관/기타` 분기 입력에서 `항목 추가` 라인 구조로 전환했다.
  - 각 항목은 `세부제목 + 내용 + 연계정보유형 + 연계정보선택(검색)`으로 구성되며, 연계값은 기준정보 ID/라벨로 저장한다.
  - 전체 문서 제목은 유통/생산과 같은 자동 생성 템플릿(일일/사무)으로 통일했다.

- 구현 상세
  - `src2/app/pages/register/hooks/office/types.ts`
    - `OfficeLine`, `OfficeLineDraft`, `OfficeLinkType` 기반 새 구조로 전환.
  - `src2/app/pages/register/hooks/office/constants.ts`
    - 링크유형 옵션, 기본 라인 draft, 기본 사무 draft 정의.
  - `src2/app/pages/register/hooks/office/selectors.ts`
    - 거래처/차량/소모품/설비/관계기관/직원/서비스업체를 공통 옵션으로 매핑.
  - `src2/app/pages/register/hooks/office/commands.ts`
    - 라인 추가/삭제 커맨드 및 사무 저장 커맨드 재구성.
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
    - 다중 기준정보 repo 로드 + 링크옵션 캐시 + 라인 draft 업데이트 흐름으로 재구성.
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
    - UI를 2단 선택(유형/검색선택) 기반 라인 입력 구조로 교체.
  - `src2/kernel/schema/daily/titleTemplates.ts`
    - 사무 일일 제목 자동 생성 포맷 추가.

- 검증
  - `npm.cmd run build` PASS
  - `npm.cmd run test:smoke:routes` PASS

## 핵심 로직 3줄
- 1) 사무 항목은 `lineDraft`로 작성하고 `lines` 배열에 추가해 하나의 일지 문서로 저장한다.
- 2) 연계정보는 `linkType -> linkId` 2단 선택으로 강제해 기준정보 ID 중심 연계를 확보한다.
- 3) 저장 시 전체 제목은 자동 생성하고, 태그는 라인 메타데이터로만 보조 저장한다.

## 입문자 설명 3줄
- 1) 이제 사무 기록도 유통/생산처럼 항목을 하나씩 추가해서 저장해.
- 2) 항목마다 어떤 기준정보(거래처/차량/설비 등)와 연결되는지 선택해서 기록해.
- 3) 전체 제목은 자동으로 만들어져서 직접 적지 않아도 돼.

## 주의 사항
- 기준정보별 라벨 필드가 서로 달라 매핑 fallback이 포함되어 있으므로, 마스터 스키마가 바뀌면 옵션 라벨 품질이 흔들릴 수 있다.
- 현재는 사무 저장 키를 actorId 고정키로 바꾸지 않았으므로, 온라인 최소선 식별자 축 정렬은 후속 배치로 남아 있다.

## 향후 과정
- manage/browse 사무 화면도 새 `lines` 구조 기준으로 표시/필터를 맞춘다.
- 사무 저장키를 actorId(writerId) 우선으로 전환해 식별자 정책을 일일 공통으로 통일한다.
- 링크유형별 선택 옵션을 커널 공통 유틸로 승격해 다른 페이지 재사용성을 높인다.

## 이슈 상태
- `Open`: 등록 페이지 구조 전환 완료, 조회/관리 정렬과 actorId 키 전환은 후속 작업.

---

## 추가 업데이트 (2026-02-18, 사무 연계 UX 확장)
- 반영 코드:
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/office/types.ts`
  - `src2/app/pages/register/hooks/office/constants.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/hooks/common/linkedReferences.ts`
- 반영 내용:
  - 연계정보 2차 검색선택 시 항목이 하단 목록에 즉시 추가되도록 변경했습니다.
  - 태그 입력창을 제거하고, 내용 텍스트 기반 기준정보 추천 칩을 추가했습니다.
  - 추천 칩 클릭 시 해당 기준정보가 바로 선택/추가되도록 처리했습니다.
  - 추천 로직은 `hooks/common/linkedReferences.ts`로 분리해 이슈 페이지 재사용 기반을 마련했습니다.

## 검증
- `npm.cmd run build` PASS
- `npm.cmd run test:smoke:routes` PASS

## 핵심 로직 3줄
- 1) 2차 검색선택 `onChange`에서 `selectLinkAndAppend`를 호출해 즉시 라인 추가한다.
- 2) 내용 텍스트를 토큰화해 기준정보 후보 라벨과 매칭, 추천 리스트를 생성한다.
- 3) 추천 클릭도 동일 커맨드 경계를 타서 저장 흐름을 단일화한다.

## 입문자 설명 3줄
- 1) 이제 연계정보를 고르면 추가 버튼을 또 누를 필요 없이 바로 아래에 들어가.
- 2) 내용을 쓰면 관련 기준정보가 추천으로 떠서 클릭만으로 빠르게 추가할 수 있어.
- 3) 태그 입력칸은 없애고, 추천으로 연계하는 방식으로 바뀌었어.

## 주의 사항
- 자동 추가는 세부제목/내용이 비어 있으면 실패 메시지를 보여주고 현재 입력을 유지한다.
- 추천은 문자열 매칭 기반이라 매우 짧은 단어/약어는 추천 품질이 떨어질 수 있다.

## 향후 과정
- 이슈 등록 폼에 동일 공통 모듈(`linkedReferences`)을 붙여 연계 UX를 통일한다.
- 추천 토큰 사전을 기준정보 도메인별(거래처/차량/설비 등)로 확장해 추천 정확도를 높인다.

## 이슈 상태
- `Open`: 사무 적용 완료, 이슈 공통 적용은 후속 배치.

---

## 추가 업데이트 (2026-02-18, 사무 연계 다중화)
- 반영 코드:
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/office/types.ts`
  - `src2/app/pages/register/hooks/office/constants.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
- 반영 내용:
  - 사무 항목 1건 안에 기준정보 연계를 여러 개 보관할 수 있도록 `linkedReferences[]` 구조로 변경했다.
  - 2차 검색선택은 이제 라인 즉시 추가가 아니라, 현재 작성중인 항목의 연계목록에 누적된다.
  - 누적된 연계항목은 `이름 + 빨간 X` 형태로 표시하고 개별 삭제 가능하게 변경했다.
  - 기존 구형 데이터(`linkType/linkId/linkLabel`)는 훅 migrate에서 `linkedReferences[]`로 자동 변환되게 보정했다.
- 검증:
  - `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) `OfficeLine/OfficeLineDraft`를 단일 연계 필드에서 `linkedReferences[]` 배열로 전환했다.
- 2) `addLineDraftLinkedReferenceCommand/removeLineDraftLinkedReferenceCommand`로 연계 누적/삭제를 커맨드 경계에서 처리한다.
- 3) 저장 시 라인 생성은 `세부제목+내용+연계배열 1개 이상` 검증 후에만 허용한다.

## 입문자 설명 3줄
- 1) 이제 사무 항목 하나에 거래처/차량/설비 같은 연계를 여러 개 붙일 수 있어.
- 2) 연계를 고르면 바로 저장되는 게 아니라, 먼저 목록에 쌓이고 필요하면 X로 빼면 돼.
- 3) 마지막에 `사무 항목 추가`를 눌러야 그 항목이 일지 본문에 들어가.

## 주의 사항
- 기존 안내와 다르게, 2차 선택은 더 이상 라인 자동 추가를 하지 않는다(의도적으로 변경).
- migrate는 구형 필드 1개만 변환 대상으로 잡아, 과거 데이터에 커스텀 확장 필드가 있으면 추가 변환이 필요할 수 있다.

## 향후 과정
- 같은 다중 연계 UX를 이슈 등록 페이지에도 동일한 커맨드 패턴으로 맞춘다.
- 연계칩 공통 UI를 `sections/common`으로 올려 사무/이슈 중복 스타일을 줄인다.

## 이슈 상태
- `Open`: 사무 등록 다중 연계 적용 완료, 이슈 페이지 공통화는 후속.

---

## 추가 업데이트 (2026-02-18, 사무 UI 압축 + 저장기록 수정)
- 반영 코드:
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
- 반영 내용:
  - 연계칩을 `버튼 전체 클릭 삭제`로 변경하고, 칩 내부에 빨간 `X` 표시를 유지했다.
  - 작성중 세부항목/저장후 하단기록 카드의 패딩/폰트/중첩구조를 줄여 컴팩트하게 정리했다.
  - 하단 기록의 대제목은 `formatDailyOfficeTitle(기록일/작성자/직책)`로 재생성해 글자깨짐 영향을 제거했다.
  - 저장기록에 `수정` 기능을 추가했다: 하단 기록에서 수정 클릭 -> 상단 폼 로드 -> `수정 저장`으로 같은 문서 id로 upsert.
- 검증:
  - `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) `submitOfficeCommand`에 `editingRecordId/editingCreatedAt`를 추가해 신규/수정 저장 경계를 분기했다.
- 2) `useRegisterOfficePage`에서 `startEditRecord/cancelEdit` 상태를 도입해 저장기록을 draft로 역로딩한다.
- 3) 연계칩 UI는 개별 X 버튼이 아닌 칩 전체 클릭 삭제로 바꿔 조작 단계를 줄였다.

## 입문자 설명 3줄
- 1) 이제 저장된 사무일지를 눌러 불러와서 다시 고친 뒤 같은 기록으로 덮어쓸 수 있어.
- 2) 연계정보 칩은 어디를 눌러도 바로 지워지고, 빨간 X는 삭제 표시 역할이야.
- 3) 하단 목록 카드 크기를 줄여서 대제목과 세부항목이 한눈에 보이게 바뀌었어.

## 주의 사항
- 하단 대제목은 기존 저장된 `record.title` 대신 화면에서 재생성해 보여주므로, 과거 제목 문자열과 1:1로 같지 않을 수 있다.
- 수정 저장은 현재 `updatedAt` 충돌 체크를 추가하지 않았으므로, 동시 편집 시 마지막 저장이 우선된다.

## 향후 과정
- office도 logistics처럼 수정 저장 시 `updatedAt` 기반 충돌 가드를 붙여 동시편집 안전성을 맞춘다.
- 하단 기록의 세부항목 단위 수정(부분 편집) UI가 필요하면 인라인 편집 모드로 확장한다.

## 이슈 상태
- `Open`: 사용자 요청 반영 완료, 동시편집 충돌 가드는 후속.

---

## 추가 업데이트 (2026-02-18, 사무 카드 초압축 + 라인수정)
- 반영 코드:
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
- 반영 내용:
  - 작성전/작성후 카드 패딩과 버튼 크기를 추가로 줄여 밀도 높은 목록 형태로 압축했다.
  - 버튼 문구를 `세부 항목 추가`에서 `등록`으로 통일했다.
  - 대제목 표시를 화면 전용 포맷(`[일일][사무] 작성자 직책 날짜`)으로 교체해 직책-날짜 사이 깨짐을 우회했다.
  - draft 라인에 `수정` 버튼을 추가해 세부항목 단위 편집(불러오기 후 재등록) 가능하게 했다.
- 검증:
  - `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) `editLine(id)`가 선택 라인을 `lineDraft`로 올리고 기존 라인은 목록에서 제거한다.
- 2) 세부항목 편집은 `lineDraft`에서 수정 후 `등록`으로 다시 목록에 반영한다.
- 3) 하단 대제목은 저장 문자열 대신 화면 포맷 함수로 재생성해 출력한다.

## 입문자 설명 3줄
- 1) 라인 수정 버튼을 누르면 그 줄이 입력칸으로 올라오고, 고친 뒤 등록하면 갱신돼.
- 2) 전체 버튼과 카드가 작아져서 한 화면에 더 많이 보이게 바뀌었어.
- 3) 제목 깨짐은 화면에서 새로 만들어 보여줘서 지금은 정상 형태로 보일 거야.

## 주의 사항
- 현재 라인수정은 "기존 라인 제거 -> lineDraft 재등록" 방식이라 수정 중 취소하면 해당 라인을 다시 등록해야 한다.
- 대제목 표시 포맷은 화면 전용이므로 기존 저장 title 원문과 다를 수 있다.

## 향후 과정
- 라인 인라인 수정(리스트 내부 직접 수정) 모드가 필요하면 `editLine` 제거형이 아닌 patch형으로 확장한다.
- office 저장 시 충돌가드(updatedAt)도 동일하게 붙여 동시편집 리스크를 줄인다.

## 이슈 상태
- `Open`: UX 압축/라인수정 반영 완료, 인라인수정/충돌가드는 후속.

---

## 추가 업데이트 (2026-02-18, 사무 하단 통합일지 + 세부 인라인수정)
- 반영 코드:
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/sections/common/dailyRecordView.ts`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
- 반영 내용:
  - 하단 기록을 `대제목 1개([일일][사무] 통합 일지)` 아래에 세부항목이 누적 나열되는 구조로 전환했다.
  - 세부항목은 하단 목록에서 바로 `인라인 수정/삭제` 가능하도록 구현했다(대제목 편집 없음).
  - 세부항목 등록 시 연계정보 선택을 필수가 아닌 선택으로 변경했다.
  - 공통 표시 규격을 위해 `dailyRecordView` 유틸을 추가하고, 사무/이슈/조치 하단 카드의 버튼 크기/폰트/대제목 포맷을 통일했다.
- 검증:
  - `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) `mergedHistoryLines`로 여러 사무일지 문서의 라인을 하나의 통합 목록으로 평탄화했다.
- 2) `historyLineEdit` 상태와 `saveHistoryLineEdit/removeHistoryLine` 커맨드로 하단 세부항목 인라인 수정/삭제를 처리한다.
- 3) `addOfficeLineCommand`에서 연계 필수 검증을 제거해 연계 없이도 세부 등록이 가능하다.

## 입문자 설명 3줄
- 1) 이제 하단에서 일지 묶음이 여러 카드로 쪼개지지 않고, 하나의 큰 제목 아래로 내용이 쌓여 보여.
- 2) 세부항목은 목록에서 바로 수정/삭제할 수 있어서 위 입력폼으로 다시 올릴 필요가 없어.
- 3) 연계정보는 있으면 붙이고 없어도 저장할 수 있게 바뀌었어.

## 주의 사항
- 통합 하단 목록은 표시용으로 문서 경계를 평탄화했기 때문에, 동일한 세부제목이 반복되면 기록일/작성자 메타로 구분해야 한다.
- 하단 세부 인라인 수정은 현재 제목/내용 중심이며 연계정보 인라인 편집은 아직 포함하지 않았다.

## 향후 과정
- 유통/생산/이슈/조치에도 통합 하단목록 패턴(평탄화 + 인라인 수정)을 단계적으로 공통 적용한다.
- 하단 인라인 수정 시 연계정보 편집까지 확장하려면 공통 `LineEditor` 컴포넌트로 분리한다.

## 이슈 상태
- `Open`: 사무 기준 패턴 정착 완료, 나머지 페이지 동일 패턴 확장은 후속.

---

## 추가 업데이트 (2026-02-18, 상단 폼 직접수정 + 파일 비대 해소)
- 반영 코드:
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/sections/office/OfficeLineDraftPanel.tsx`
  - `src2/app/pages/register/sections/office/OfficeUnifiedHistoryPanel.tsx`
  - `src2/app/pages/register/hooks/office/types.ts`
- 반영 내용:
  - 하단 세부항목의 `수정`을 누르면 인라인 편집이 아니라 상단 폼으로 즉시 진입하도록 변경했다.
  - 상단 등록 버튼은 편집 대상이 있으면 `수정 저장`, 없으면 `등록`으로 동작한다.
  - 인라인 수정 상태/로직을 제거해 수정 플로우를 단일화했다.
  - `RegisterOfficeDailyPage.tsx`를 패널 컴포넌트로 분리해 파일 비대를 해소했다.
  - 훅 파일도 정리해 500줄 미만(494줄)으로 낮춰 규칙 위반 상태를 해소했다.
- 검증:
  - `npm.cmd run build` PASS

## 핵심 로직 3줄
- 1) `beginHistoryLineEdit(item)`가 하단 세부항목을 상단 `lineDraft`로 올리고 편집 타겟(recordId/lineId)을 저장한다.
- 2) `commitLineDraft()`는 편집 타겟이 있으면 기존 저장 문서 라인을 직접 업데이트한다.
- 3) 편집 타겟이 없으면 기존처럼 draft 라인에 `등록`한다.

## 입문자 설명 3줄
- 1) 하단에서 수정을 누르면 바로 위 입력칸에 값이 채워져서 바로 고칠 수 있어.
- 2) 이제 하단에서 또 한 번 수정 버튼을 누르는 단계는 없어졌어.
- 3) 화면 코드도 블록별 파일로 나눠서 유지보수하기 쉬워졌어.

## 주의 사항
- 상단 폼 편집 중에 `초기화`를 누르면 편집 타겟도 같이 초기화된다.
- 하단 통합 목록은 여러 문서 라인을 평탄화해 보여주므로 문서 경계 정보는 라인 상단 메타로 구분해야 한다.

## 향후 과정
- 동일한 `하단 수정 -> 상단 폼 편집` 패턴을 이슈/조치/유통에도 단계적으로 적용한다.
- 공통 패널 패턴을 `sections/common`으로 승격해 등록 페이지 간 중복을 더 줄인다.

## 이슈 상태
- `Open`: 사무 기준 패턴 적용 완료, 타 페이지 확장은 후속.

---

## 추가 업데이트 (2026-02-18, 룰 재정렬 + QA 재검증 배치)
- 반영 코드:
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/office/mappers.ts`
  - `src2/app/pages/register/hooks/office/useOfficeLinkContext.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
  - `src2/app/pages/register/sections/office/OfficeLineDraftPanel.tsx`
  - `src2/app/pages/register/sections/office/OfficeUnifiedHistoryPanel.tsx`
  - `src2/kernel/schema/daily/titleTemplates.ts`
  - `scripts/p0-consistency-regression.ts`
  - `src2/docs/reference/feature-files-map-unified.md`
- 반영 내용:
  - `useRegisterOfficePage.ts`를 343 LOC까지 축소하고, 매핑/연계컨텍스트 로직을 별도 모듈로 분리했다.
  - 하단 세부항목 편집 중에는 전체 저장을 차단해 수정 충돌 흐름을 방지했다.
  - 사무/이슈/조치 화면 문구를 존댓말 기준으로 통일했다.
  - P0 회귀 스크립트를 `site+actor` 병합 정책으로 맞췄고, 물류 제목 괄호 제거 검증을 유지했다.
  - 제목 템플릿 한글 깨짐 파일을 정리해 일일 제목 포맷을 복구했다.
  - 참조 문서(`feature-files-map-unified`)에 신규 분리 파일을 반영했다.
- 검증:
  - `npm.cmd run build` PASS
  - `npm.cmd run check:qa:reuse-build` PASS

## 핵심 로직 3줄
- 1) 오피스 훅은 상태/wiring만 남기고, 데이터 변환과 기준정보 컨텍스트 로딩을 분리해 책임을 줄였다.
- 2) `historyLineEditTarget`가 활성화된 상태에서는 전체 저장을 막아 일지 저장 경계를 명확히 했다.
- 3) `check:qa:reuse-build` 기준으로 smoke/security/p0 consistency를 한 배치에서 재검증했다.

## 입문자 설명 3줄
- 1) 한 파일에 너무 많은 코드를 몰아넣던 구조를 작은 파일로 나눠서 고치기 쉬워졌어.
- 2) 세부항목 수정 중에는 전체 저장을 잠깐 막아, 잘못 덮어쓰는 상황을 줄였어.
- 3) 빌드만 통과한 상태가 아니라 QA 묶음 검사까지 다시 돌려서 안정성을 확인했어.

## 주의 사항
- 물류 훅(`useRegisterLogisticsPage.ts`)은 아직 350 LOC를 넘기므로, 다음 배치에서 같은 방식 분리가 필요하다.
- 제목 템플릿은 한글 상수가 많아 인코딩 깨짐이 재발하기 쉬우니 수정 시 diff 검증이 필요하다.

## 향후 과정
- 이슈/조치/유통 훅도 오피스와 같은 기준으로 `commands + mappers + context` 분리 패턴을 맞춘다.
- 통합 하단 목록 UI 공통부를 `sections/common`으로 승격해 페이지 간 표시 규격을 더 고정한다.

## 이슈 상태
- `Open`: 오피스 정리는 안정화됐고, 유통 훅 비대 해소와 나머지 페이지 공통화는 후속.

---

## 추가 업데이트 (2026-02-18, 사무 즉시저장 + 이슈 연계공통 + 하단 표시형식 통일)
- 반영 코드:
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/sections/office/OfficeLineDraftPanel.tsx`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
  - `src2/app/pages/register/hooks/issue/types.ts`
  - `src2/app/pages/register/hooks/issue/commands.ts`
  - `src2/app/pages/register/components/IssueRegisterForm.tsx`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/sections/logistics/IssueActionModal.tsx`
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
  - `src2/app/pages/register/sections/logistics/SelectedDateLogisticsList.tsx`
  - `src2/app/pages/register/sections/common/dailyRecordView.ts`
  - `src2/kernel/repo/domain/issueRepo.ts`
- 반영 내용:
  - 사무는 `등록` 클릭 즉시 저장되도록 변경했고, 입력 중 임시 세부목록(하단 미저장 리스트)은 제거했다.
  - 사무 문서는 `기록일+지부+작성자` 기준으로 단일 문서에 누적 저장되도록 보정했다.
  - 기준정보 연계/내용기반 추천을 이슈 페이지에도 동일 적용했다(사무 전용 아님).
  - 이슈 저장 데이터에 `linkedReferences`를 포함해 연계정보가 실제 데이터에 남도록 반영했다.
  - 사무/이슈/조치/생산/유통 하단 카드 및 버튼 스타일을 공통 스타일(`dailyRecordView`) 기준으로 정렬했다.
  - 유통 반품 상태/순중량/금액 계산 표시는 기존 로직을 유지하고 표시형식만 정렬했다.
- 검증:
  - `npm.cmd run build` PASS
  - `npm.cmd run check:qa:reuse-build` PASS

## 핵심 로직 3줄
- 1) 사무 `commitLineDraft`가 이제 draft 배열 추가가 아니라 repo upsert를 직접 호출해 즉시 하단 반영한다.
- 2) 이슈 draft에 `linkType/linkId/linkedReferences`를 추가하고, 사무와 같은 연계선택/추천 흐름을 재사용했다.
- 3) 등록 하단 표시용 카드/버튼 스타일을 `dailyRecordView` 공통 상수로 묶어 페이지 간 모양을 맞췄다.

## 입문자 설명 3줄
- 1) 사무 세부를 등록하면 이제 바로 저장되어 아래 기록에 즉시 보인다.
- 2) 이슈도 사무처럼 기준정보를 검색해서 붙이고, 내용 기반 추천으로 빠르게 추가할 수 있다.
- 3) 페이지마다 제각각이던 하단 카드와 버튼 모양을 공통 스타일로 맞췄다.

## 주의 사항
- 현재 유통 훅(`useRegisterLogisticsPage.ts`)은 381 LOC라서 다음 배치에서 분리 작업이 필요하다.
- `sections/production/ProductionIssueModal.tsx`는 현재 메인 플로우에서 직접 쓰이지 않지만, IssueRegisterForm 확장으로 인한 타입 불일치를 막기 위해 optional props 호환을 유지했다.

## 향후 과정
- 유통 훅을 오피스와 같은 기준(`commands + mappers + context`)으로 분리해 350 LOC 이하로 정리한다.
- 이슈/조치 하단에도 세부 단위 `수정` 기능이 필요하면 공통 라인 에디터로 확장한다.

## 이슈 상태
- `Open`: 이번 배치 요구사항 반영 완료, 유통 훅 비대 해소와 나머지 페이지 기능통일은 후속.

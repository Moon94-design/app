# register/daily/logistics 리뉴얼 1차 (네비 한글 복구 + 등록 UX 개선)

> 작성일: 2026-02-12
> 주제: 유통일지 등록 화면 리뉴얼과 네비 깨짐 복구
> 이슈 상태: Resolved

---

## 작업 요약
- `navConfig`의 깨진 한글 레이블을 전체 복구해서 네비/브레드크럼 표시를 정상화했다.
- 유통일지 등록 화면에서 직접 차량번호 입력을 제거하고, 거래처/차량 기준정보를 화면 내 `+ 추가` 모달로 즉시 등록 가능하게 바꿨다.
- 거래처 선택 시 최근 5건 차량번호 추천을 붙여 재입력을 줄였다.
- 방향/종류 체계를 확장했다.
  - 방향: `매입`, `출고`, `처리`
  - 종류: `스크랩`, `폐기물`, `폐수` 포함
  - `처리` 선택 시 품목 비사용 처리
- 중량 입력을 `총중량`, `공차중량` 기반으로 바꾸고 `실중량` 자동 계산으로 변경했다.
- 저장 후 입력값 초기화는 수행하되 날짜(`recordDate`)만 유지되도록 변경했다.
- 저장 시 토스트 알림이 뜨도록 추가했다.
- 저장 데이터가 날짜별로 중복 문서로 쌓여 목록에 2개씩 보이던 원인을 훅에서 정규화(날짜 단위 병합 + 중복 id 정리)로 처리했다.
- 일일 등록 화면 하단의 "최근 유통 기록" 노출은 제거했다.

## 검증
- `npm run build`: PASS

## 변경 파일
- `company-docs/src2/app/nav/navConfig.ts`
- `company-docs/src2/kernel/schema/daily/logisticsTypes.ts`
- `company-docs/src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
- `company-docs/src2/app/pages/register/RegisterLogisticsDailyPage.tsx`

## 핵심 로직 3줄
- 1) `useRegisterLogisticsPage`에서 logistics 레코드를 날짜 단위로 병합/정규화해 중복 문서 원인을 데이터 레벨에서 해소했다.
- 2) `grossKg - tareKg`로 `kg(실중량)`를 자동 산출해 저장값 일관성을 강제했다.
- 3) 거래처 선택 시 과거 lines를 스캔해 차량번호 추천 5건을 즉시 제공하도록 연결했다.

## 입문자 설명 3줄
- 1) 이제 유통일지에서 같은 날짜 데이터가 두 번 보이면 화면 문제가 아니라 저장 구조를 먼저 정리해서 해결해.
- 2) 무게는 총중량과 공차중량만 입력하면 실중량이 자동으로 계산돼.
- 3) 거래처를 먼저 고르면 그 거래처에서 자주 쓰던 차량번호를 버튼으로 바로 찍어서 선택할 수 있어.

## 주의 사항
- 이번 턴은 유통일지 등록 화면 중심 리뉴얼이라, 관리/조회 화면의 편집 옵션(방향/종류 확장 반영)은 후속 동기화가 필요할 수 있다.
- 빠른 등록 모달은 "기준정보 등록 폼 섹션 재사용" 기반이라, 원본 기준정보 페이지의 필드/검증이 바뀌면 함께 점검해야 한다.
- 저장 정규화가 날짜 단위 병합 규칙이라, 향후 날짜 내 다문서 정책이 필요하면 병합 키를 날짜+추가축으로 조정해야 한다.

## 향후 과정
- 다음 리뉴얼 대상 페이지에도 `writerLocked` 패턴, `+ 추가` 빠른 등록, 저장 토스트를 동일 구조로 확장 적용.
- `/manage/daily/logistics` 편집 폼의 방향/종류/품목 옵션을 이번 확장 체계와 맞춰 동기화.
- 조회 계열(`browse/daily`, `browse/price`)에서 처리/폐기물/폐수 데이터 표시 정책 확인 후 라벨/필터 반영.

## 이슈 상태
- `Resolved`: 요청한 유통일지 1차 리뉴얼(네비 한글, 입력 흐름, 추천, 중복 원인 수정, 저장 토스트) 반영 완료.

---

## 추가 반영 (요청 후속)
- 하단 기록 영역을 완전 제거 방식에서 변경해, `선택된 기록일`의 유통 라인을 개별 카드로 다시 표시하도록 복원.
- 작성자 아래 안내 문구 제거.
- `처리` 선택 시 품목 안내 텍스트 제거 및 품목 UI 자체 숨김 유지.
- 기록일 입력폭을 좁혀 기존 체감 폭으로 조정.
- 거래처 빠른 등록 모달 입력 양식을 `PartnerCreateFlow`로 교체해 기준등록의 입력 플로우와 동일하게 맞춤.
- 사용자 메시지/토스트 문구를 공손한 문체로 정리.

## 추가 반영 2 (이슈 등록 연동)
- 기록일 입력 영역 폭을 다른 필드와 동일하게 복원.
- 저장 버튼 위에 `이슈 등록` 버튼 추가, 유통 입력값을 기반으로 이슈 초안 자동 프리셋.
- 이슈 입력 UI를 공용 컴포넌트 `IssueRegisterForm`으로 분리.
  - `RegisterIssuePage`와 `RegisterLogisticsDailyPage` 모달이 동일 컴포넌트를 공유하도록 변경.
  - 이후 이슈 입력 항목 수정 시 한 곳만 수정하면 양쪽에 동일 반영.

## 추가 반영 3 (이슈 완료 → 조치 입력 연계)
- 이슈 모달의 날짜를 일지 기록일로 고정(`lockRecordDate`) 처리.
- 이슈 저장 시 제목 포맷을 유통 컨텍스트에서 자동 가공:
  - `[유통] {입력제목} {이름}(이름) {직책}(직책) 이슈 기록`
- 이슈 모달 기본값 변경:
  - 제목: 빈칸
  - 상세내용: 자동 채움 제거
- 상태가 `완료`일 때 모달 안에 `조치기록 입력` 폼이 함께 나타나도록 추가.
- 조치 입력 UI를 `ActionRegisterForm` 공용 컴포넌트로 분리해,
  - `RegisterActionPage`
  - `RegisterLogisticsDailyPage` 완료 모달
  양쪽에서 동일 폼을 공유하도록 통합.

## 추가 반영 4 (제목 규칙/자동 연계 강화)
- 유통기록 저장 제목 규칙 적용:
  - `[일일][유통] {거래처}(거래처), {작성자}(작성자) {직책}(직책) 작성 {YYYY-MM-DD}`
- 이슈 저장 제목 규칙 적용(유통 모달 컨텍스트):
  - `[이슈][일일][유통] {입력제목}(작성한제목) {작성자}(작성자) {직책}(직책) 작성 {YYYY-MM-DD}`
- 조치 저장 제목 규칙 적용:
  - `[조치][일일][유통] {이슈기록제목}(이슈기록제목) {작성자}(작성자) {직책}(직책) 작성 {YYYY-MM-DD}`
- 완료 상태에서 보이는 조치 입력 폼은 이슈 연계 선택칸을 숨기고 자동 연계만 사용하도록 변경.
- 유통 모달 이슈 등록은 관계 필드 비노출 모드(`showRelationFields=false`)로 호출해, 향후 이슈 페이지에 연계 필드가 늘어나도 추가 페이지에서 기본적으로 노출되지 않도록 확장 포인트를 마련.

## 추가 반영 5 (유통 품목 체계 재정의 + 거래처 프로필 자동 동기화)
- 유통 등록에서 선택 순서를 실사용 기준으로 재배치:
  - `종류`: `PP`, `PE`
  - `품목`: 방향별 품목군
- 방향별 품목 규칙 갱신:
  - `매입`: `압축품`, `분쇄품`, `스크랩`
  - `출고`: `분쇄품`, `펠렛` (`스크랩` 제거)
  - `처리`: `폐기물`, `폐수`
- `매입 + 스크랩`에서만 세부 품목 선택을 노출:
  - `PP`: `일반`, `파렛트`, `상자`
  - `PE`: `일반`, `파렛트`, `상자`, `말통`
  - 직접 입력값도 세부 품목으로 즉시 적용 가능(저장 후 다음 입력 시 드롭다운 후보로 재사용)
- 거래처 선택 시 최근 1회 유통 라인을 참조해 1차 자동 선택(방향/종류/품목/세부 품목/차량) 적용.
- 저장 시 거래처 프로필(`tradeProfiles`)에 신규 조합을 자동 append해, 유통에서 새 품목 조합이 발생하면 기준정보와 자동 동기화.
- 거래처 기준정보 프로필 옵션도 신규 품목 체계(`압축품/분쇄품/펠렛/스크랩`)로 맞춤.

## 추가 반영 6 (작성자/직책 한 줄 배치 + 기타 입력 토글 + 기준정보 중복 방지)
- 유통 등록 상단 입력 레이아웃을 조정해 `작성자`와 `직책`이 같은 줄(반반 폭)로 보이도록 변경.
- `매입 + 스크랩` 세부 품목에서 `기타` 버튼을 누를 때만 직접 입력창이 나타나도록 UX 변경.
- 기준정보 중복 방지 로직을 공용 유틸로 추가:
  - `kernel/utils/masterDedup.ts`
  - 이름 기준 중복(`findDuplicateByName`)
  - 차량번호 기준 중복(`findDuplicateByVehicleNo`)
- 적용 범위:
  - 거래처 기준정보 등록(`PartnerRegisterPage`) 신규 저장 시 동일 거래처명 차단, 기존 항목 수정 유도.
  - 차량 기준정보 등록(`useVehicleRegisterPage`) 신규 저장 시 동일 차량번호 차단.
  - 유통 화면 내 거래처/차량 빠른 추가(`useRegisterLogisticsPage`)에서도 동일 기준으로 차단하고 기존 항목 자동 선택 연결.

## 추가 반영 7 (거래처명 세부 + 동일 이름 수정 유도 UX)
- 거래처 스키마에 `partnerDetailTag`를 추가해 `거래처명(기본)`과 `거래처명 세부`를 분리 저장.
- 거래처 등록 폼(기준등록/빠른추가) 모두에 `거래처명 세부` 입력칸 추가.
- 거래처명 입력 시 동일 기본명의 기존 거래처를 폼 하단 카드로 노출하고 `수정` 버튼 제공.
  - 기준등록 페이지: `수정` 클릭 시 해당 거래처 편집 화면으로 이동.
  - 유통 빠른추가 모달: `수정` 클릭 시 모달 닫고 거래처 편집 화면으로 이동.
- 저장 중복 규칙을 `(거래처명, 거래처명 세부)` 조합 기준으로 강화:
  - 동일 조합 존재 시 저장 차단.
  - 동일 거래처명만 있고 세부가 비어 있으면 세부 입력을 요구해 분리 등록 유도.
- 거래처 표시 라벨을 `거래처명 · 세부` 형태로 확장해 목록/검색/선택에서 구분 가능하게 통일.

## 추가 반영 8 (문자 깨짐 복구 + 인라인 수정 완성)
- 유통 등록 페이지(`RegisterLogisticsDailyPage`) 문자열/마크업 깨짐을 전면 복구해 한글 표시와 JSX 렌더를 정상화.
- 거래처 빠른 추가 모달에서 중복 거래처 `수정` 시 페이지 이동 대신, 카드 하단 인라인 입력창으로 이름/세부를 바로 수정하도록 변경.
- 인라인 수정 placeholder를 요청대로 `예: 본사, OO지점`으로 통일.
- `PartnerCreateFlow`의 새 시그니처(`onSaveDuplicate`)를 유통 페이지와 거래처 등록 페이지 모두에 연결.
- 이슈/조치 폼(`IssueRegisterForm`, `ActionRegisterForm`)의 깨진 문자열/문법을 복구해 공용 폼 재사용 경로를 안정화.
- 인코딩 이슈가 있던 파일을 UTF-8로 정규화해 빌드 오류(`File appears to be binary`)를 제거.

## 핵심 로직 3줄
- 1) `PartnerCreateFlow`에서 중복 항목별 인라인 편집 상태를 관리해, 모달 내부에서 즉시 수정 저장이 가능해졌습니다.
- 2) 유통 빠른 추가의 `onSaveDuplicate`는 `updatePartnerQuickName`으로 연결되어 저장 후 기준정보 목록을 즉시 새로고침합니다.
- 3) 깨진 컴포넌트 파일을 UTF-8 + 정상 JSX로 복구해 공용 이슈/조치 입력 흐름이 다시 빌드 가능한 상태가 되었습니다.

## 입문자 설명 3줄
- 1) 이제 같은 이름 거래처가 있으면 다른 화면으로 이동하지 않고 현재 창에서 바로 구분 이름을 붙일 수 있습니다.
- 2) 한글이 깨져 보이던 건 글자 문제가 아니라 파일 인코딩 문제라서, 파일 자체를 UTF-8로 다시 저장해 해결했습니다.
- 3) 유통/이슈/조치 화면은 공용 폼을 같이 쓰므로, 한 번 고치면 여러 화면이 같이 좋아집니다.

## 주의 사항
- 기존에 인코딩이 깨진 파일이 더 남아 있으면 동일 증상이 재발할 수 있으니, 깨짐 발생 시 UTF-8 여부를 먼저 점검해야 합니다.
- 인라인 수정 저장은 `(거래처명, 세부)` 조합 중복만 막으므로, 도메인 규칙이 늘어나면 검증 유틸 확장이 필요합니다.
- 빠른 추가 모달과 기준등록 페이지가 같은 컴포넌트를 쓰기 때문에, props 변경 시 두 경로를 항상 같이 확인해야 합니다.

## 향후 과정
- 다음 SHADOW 이관 시작 전 `browse/master` 진입 경로에서 거래처 라벨(`이름 · 세부`) 표시 일관성을 먼저 점검합니다.
- 공통 인라인 중복 수정 UX를 차량/업체/기관 기준정보에도 동일 패턴으로 확장할지 결정합니다.
- 이슈/조치 공용 폼은 이후 이슈 페이지 스키마 개편 시 필드 스위치만으로 재사용되도록 옵션 props를 정리합니다.

## 이슈 상태
- `Resolved`: 이번 턴 범위(유통 글자 깨짐, 인라인 수정, 공용 폼 복구, 빌드 통과) 처리 완료.

## 추가 반영 9 (register 기능 파일 진단 + 분리 계획 문서화)
- 요청 기준으로 `register` 기능 파일 전체를 라인수/책임/중복 관점에서 재점검했다.
- 신규 기준 문서 생성:
  - `company-docs/src2/docs/reference/register-daily-files.md`
- 핵심 결론:
  - `useRegisterLogisticsPage.ts`(873) + `RegisterLogisticsDailyPage.tsx`(655)는 유지보수 위험 구간(500+).
  - 완전 동일 파일 중복은 없지만, helper 중복(`todayYmd`, `sortByRecent`, `buildAutoTitle`, `parseTags`)은 누적되어 있음.
  - 이관 과정에서 parity/브리지 로직이 훅으로 집중되며 비대화가 발생.
- 문서에 반영한 분리 계획:
  1) 훅 내부를 `constants/mapper/selectors/merge/commands`로 분할
  2) 페이지 조립을 `sections/logistics/*`로 분리
  3) 공통 helper를 `@kernel/utils`/`@kernel/schema`로 상향

## 핵심 로직 3줄
- 1) register 기능 파일을 라인수 기준으로 재분류해 고위험(500+) 대상을 명시했습니다.
- 2) 신규 파일 맵 문서에서 경로/역할/중복 후보를 한 번에 추적할 수 있게 구조화했습니다.
- 3) logistics 분리를 3단계(무중단 훅 분리 -> UI 섹션 분리 -> helper 공용화)로 고정했습니다.

## 입문자 설명 3줄
- 1) 지금 파일이 긴 이유는 화면 로직, 저장 로직, 추천 로직이 한 파일에 다 들어가 있기 때문입니다.
- 2) 같은 기능이 여러 파일에 조금씩 복붙돼 있어, 나중에 수정할 때 놓치기 쉬운 상태입니다.
- 3) 그래서 먼저 파일 지도를 만들고, 큰 파일부터 작은 부품으로 쪼개는 순서로 진행하는 게 안전합니다.

## 주의 사항
- 이번 진단은 "중복 파일"보다 "중복 helper/패턴"을 기준으로 잡았기 때문에, 함수명만 바뀐 유사 로직이 일부 남아 있을 수 있습니다.
- 문자열 인코딩이 혼재된 파일은 diff/검색에서 누락이 발생할 수 있어, 분리 작업 직전에 UTF-8 점검이 필요합니다.
- 훅 분리 시 타입 이동과 import 경로 변경이 동시에 일어나므로, 단계별 빌드 게이트를 생략하면 회귀를 만들 가능성이 큽니다.

## 향후 과정
- 다음 턴에서 `useRegisterLogisticsPage.ts`를 먼저 1단계 분리(동작 동일)로 착수합니다.
- 이후 `RegisterLogisticsDailyPage.tsx`를 `sections/logistics/*`로 분할해 조립 파일을 250줄 내외로 축소합니다.
- 마지막으로 register 공통 helper(today/sort/title/tag parse)를 kernel로 올려 office/production/action/issue에 동시 반영합니다.

## 이슈 상태
- `Open`: 설계/문서화 완료, 실제 코드 분리 작업은 다음 턴에서 시작.

## 추가 반영 10 (리뉴얼 재발 방지 문서 세트 구축)
- 페이지 리뉴얼 전용 체크리스트를 신규 작성:
  - `company-docs/src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- 기능 파일 설명 문서를 파트너/유통 포함 통합 버전으로 신규 작성:
  - `company-docs/src2/docs/reference/feature-files-map-unified.md`
- 다음 리뉴얼에서 초안을 빠르게 뽑기 위한 공통 요구사항/템플릿 문서를 신규 작성:
  - `company-docs/src2/docs/reference/page-renewal-common-spec.md`

간단 의견:
- 이번에 가장 필요한 건 "구현 전에 문서로 범위와 공통 규칙을 고정"하는 절차였고, 그 기반이 만들어졌습니다.

다음 진행 질문:
- 다음 턴에서 바로 `useRegisterLogisticsPage.ts` 1단계 분리(constants/selectors/commands)부터 시작할까요?

## 핵심 로직 3줄
- 1) 페이지 리뉴얼 전용 체크리스트로 파일 비대화/중복 구현/회귀를 사전 차단하는 규칙을 고정했습니다.
- 2) 파트너/유통/일일등록을 포함한 통합 기능 파일 맵으로 경로와 책임을 한 번에 추적할 수 있게 했습니다.
- 3) 공통 요구사항 + 초안 템플릿 문서로 다음 리뉴얼 시 반복 수정 없이 초안 생성 경로를 표준화했습니다.

## 입문자 설명 3줄
- 1) 이제 리뉴얼할 때 먼저 체크리스트를 보고 시작하면 실수 가능성을 줄일 수 있습니다.
- 2) 기능 파일이 어디에 있고 무슨 역할인지 한 문서에서 바로 찾을 수 있게 정리했습니다.
- 3) 다음 페이지 리뉴얼은 템플릿 칸만 채우면 초기 설계를 빠르게 시작할 수 있습니다.

## 주의 사항
- 체크리스트/스펙 문서는 "지켜야 효과"가 있으므로, 다음 작업부터 실제로 사용되지 않으면 문서만 늘어날 위험이 있습니다.
- 공통 스펙 적용 시 예외 페이지가 생기면 예외 사유를 result에 남기지 않으면 다시 분산 구현으로 돌아갈 수 있습니다.
- 통합 파일 맵은 파일 이동/분할 시 즉시 갱신하지 않으면 신뢰도가 빠르게 떨어집니다.

## 향후 과정
- 다음 코드 작업 시작 전에 `PAGE_RENEWAL_CHECKLIST.md`를 실행 체크리스트로 사용합니다.
- logistics 분리 1단계 완료 후 `feature-files-map-unified.md`를 새 구조로 즉시 업데이트합니다.
- 다음 리뉴얼 대상(예: browse/master) 착수 시 `page-renewal-common-spec.md` 템플릿을 먼저 채우고 구현합니다.

## 이슈 상태
- `Resolved`: 문서 기반 재발 방지 체계(체크리스트/통합 맵/공통 스펙) 구축 완료.

## 추가 반영 11 (통합 기능 맵 범위 확장 + 체크리스트 강제 연결)
- 사용자 피드백 반영: 통합 기능 맵 범위를 파트너/유통 중심에서 `src2 전체 기능군`으로 확장.
- `feature-files-map-unified.md`를 전면 재작성:
  - app/pages 전 기능군(Home/Register/Master/Manage/Browse/Excel)
  - kernel 공통 기능(components/repo/draft/schema/utils)
  - 신규 파일 추가 전 의사결정 절차(참조 -> 재사용 우선 -> 생성 후 문서 갱신) 포함
- 체크리스트 연동 강화:
  - `PAGE_RENEWAL_CHECKLIST.md` 사전분석 단계에
    - "`feature-files-map-unified.md` 참조" 항목 추가
  - `TASK_EXECUTION_CHECKLIST.md` 시작 전 단계에
    - 동일 참조 항목 추가

간단 의견:
- 이제 기능 파일을 추가하기 전에 단일 참조 문서 확인이 체크리스트에 명시되어, 같은 책임의 파일 중복 생성 가능성을 줄일 수 있습니다.

다음 진행 질문:
- 다음 턴에서 통합 맵 기준으로 실제 코드 분리(유통 훅 1단계) 바로 진행할까요?

## 핵심 로직 3줄
- 1) 통합 기능 파일 맵을 `src2` 전체 도메인 기준으로 확장해 단일 참조점으로 고정했습니다.
- 2) 신규 파일 추가 전 문서 참조 절차를 체크리스트 필수 항목으로 연결했습니다.
- 3) 페이지 리뉴얼 체크리스트와 작업 실행 체크리스트를 함께 업데이트해 누락 가능성을 낮췄습니다.

## 입문자 설명 3줄
- 1) 이제 새 기능 파일 만들기 전에 먼저 "전체 파일 지도"를 보게 강제한 상태입니다.
- 2) 비슷한 파일이 이미 있으면 새로 만들지 않고 기존 파일을 재사용하는 흐름으로 유도합니다.
- 3) 체크리스트 두 군데에 같은 규칙을 넣어, 작업자가 바뀌어도 같은 절차를 따르기 쉬워졌습니다.

## 주의 사항
- 통합 맵 문서는 파일 이동/분할 후 즉시 갱신하지 않으면 빠르게 신뢰도가 떨어집니다.
- 체크리스트 항목이 늘어난 만큼, 실제 작업에서 형식적 체크만 하고 넘어갈 위험이 있습니다.
- browse SHADOW 영역은 legacy 연동이 남아 있어 통합 맵의 상세 책임 경계가 추후 다시 정리될 수 있습니다.

## 향후 과정
- 유통 훅 분리 착수 시 신규/이동 파일을 통합 맵에 실시간 반영합니다.
- 기능 파일 추가 PR/작업에서 체크리스트 참조 항목 미체크 시 진행 중단 규칙을 적용합니다.
- browse/manage 후속 이관 시에도 같은 문서 체계를 동일하게 적용합니다.

## 이슈 상태
- `Resolved`: 통합 기능 맵 전역화 + 체크리스트 참조 강제 반영 완료.

## 추가 반영 12 (중복방지 공용화 상태 명확화)
- 사용자 질문 반영: "dedup 공용화가 전 기준등록에 이미 적용됐는가?"를 명확히 문서화.
- `page-renewal-common-spec.md`의 중복방지 섹션에 아래를 추가:
  - 공용 유틸 분리 완료(`masterDedup.ts`)
  - 현재 적용 완료 범위(partner, vehicle, 유통 quick add 경유)
  - 미적용 범위(agency/vendor/equipment/consumable/employee)
  - 전 기준등록 동일 dedup 유틸 적용 원칙 + 도메인별 식별키 매핑 원칙

간단 의견:
- 구조(공용 유틸)는 준비됐고, rollout(전 페이지 적용)은 아직 진행 중인 상태입니다.

다음 진행 질문:
- 다음 턴에서 agency부터 dedup 공통 유틸 적용을 순차로 시작할까요?

## 핵심 로직 3줄
- 1) dedup 기능은 공용 유틸로 분리돼 있지만 적용 범위는 일부 도메인에 한정되어 있음을 명시했습니다.
- 2) 미적용 도메인을 문서에 고정해 후속 적용 누락을 방지했습니다.
- 3) 도메인별 식별키 매핑 원칙을 추가해 동일 방식 적용 기준을 통일했습니다.

## 입문자 설명 3줄
- 1) "공용 유틸이 있다"와 "모든 페이지에 적용됐다"는 다른 상태입니다.
- 2) 지금은 공용 유틸은 만들어졌고, 몇 페이지만 먼저 연결된 상태입니다.
- 3) 남은 페이지도 같은 유틸로 순서대로 연결하면 같은 방식으로 중복방지가 동작합니다.

## 주의 사항
- 적용 상태 문서가 실제 코드와 어긋나면 작업자가 완료로 오해할 수 있습니다.
- dedup 기준키를 도메인별로 명확히 정하지 않으면 오탐/누락이 생길 수 있습니다.
- 빠른추가 경로와 기준등록 본페이지의 규칙이 달라지지 않도록 동시 검증이 필요합니다.

## 향후 과정
- agency/vendor/equipment/consumable/employee 순으로 dedup 유틸 적용을 진행합니다.
- 각 도메인 적용 시 통합 파일 맵과 common spec을 즉시 갱신합니다.
- 적용 배치마다 build + 저장/중복 시나리오를 함께 검증합니다.

## 이슈 상태
- `Open`: dedup 전 도메인 롤아웃 작업은 미완료.

## 추가 반영 13 (유통 훅 분리 1단계 착수)
- `useRegisterLogisticsPage.ts` 내부 helper를 `hooks/logistics/*`로 분리했다.
  - `constants.ts`
  - `mappers.ts`
  - `selectors.ts`
  - `merge.ts`
  - `formatters.ts`
- 기존 훅의 반환 API는 유지하고, 내부 import만 교체했다.
- 결과:
  - `useRegisterLogisticsPage.ts` 라인수 873 -> 567로 감소
  - 첫 단계 분리는 완료, 아직 목표(200~280)에는 미달

검증:
- `npm.cmd run build` PASS

간단 의견:
- 1단계로 가장 큰 로직 덩어리(상수/선택자/정규화)를 분리해 이후 2단계(UI 섹션 분리) 착수 난이도를 낮췄다.

다음 진행 질문:
- 다음 턴에서 `RegisterLogisticsDailyPage.tsx`를 `sections/logistics/*`로 바로 분해할까요?

## 핵심 로직 3줄
- 1) 유통 훅의 상수/매핑/선택자/병합/포맷 로직을 별도 모듈로 분리했습니다.
- 2) 훅은 orchestration 중심으로 재정렬해 변경 지점을 모듈 단위로 추적 가능하게 만들었습니다.
- 3) 빌드 검증으로 분리 후 타입/동작 연결 이상이 없음을 확인했습니다.

## 입문자 설명 3줄
- 1) 큰 파일을 작은 파일 여러 개로 나눠서 각 파일이 한 가지 역할만 하게 했습니다.
- 2) 화면에서 쓰는 방식은 그대로라서, 바깥에서 볼 때 기능은 바뀌지 않습니다.
- 3) 다음에는 화면 자체도 섹션으로 나눠서 수정 속도를 더 올릴 수 있습니다.

## 주의 사항
- 이번 분리는 내부 모듈 분리 1단계라, 훅 파일 자체가 아직 길고 명령 로직(create/submit)이 남아 있습니다.
- 모듈 경로가 늘어났으므로 이후 파일 이동 시 통합 기능 맵 문서 동기화가 필요합니다.
- 메시지/정책 문자열은 아직 훅에 남아 있어 title/template 공용화 2차 작업이 필요합니다.

## 향후 과정
- 다음 단계에서 `RegisterLogisticsDailyPage.tsx`를 UI 섹션으로 분리합니다.
- 이후 `commands.ts`를 도입해 create/update/submit 로직까지 훅에서 분리합니다.
- 마지막으로 date/sort/title helper를 kernel 공용으로 상향합니다.

## 이슈 상태
- `Open`: 유통 훅 분리 1단계 완료, 2단계(UI 분리) 진행 필요.

## 추가 반영 14 (추가 문제점 점검 + 즉시 조치)
- 추가 점검에서 파싱/문자열 깨짐과 lint 부채를 함께 재검증하고 즉시 수정했다.
- 파싱/화면 복구:
  - `kernel/schema/daily/logisticsHelpers.ts`를 정상 UTF-8 코드로 재작성(깨진 문자열/문법 복구)
  - `RegisterLogisticsDailyPage.tsx`를 동일 기능 기준으로 재작성해 깨진 JSX/문구 복구
- 태그 입력 안정화:
  - `TagInputText.tsx`에서 파생 상태(`open`) effect 제거, 조합 입력 쿼리 로직 단순화
  - `useTagBlockSuggestions.ts` 훅 의존성 경고 정리
- 엑셀 영역 잔여 lint 부채 해소:
  - `any` catch 제거 (`unknown` + `instanceof Error`)
  - `ExcelParseResultView`를 제네릭화해 타입 안전한 미리보기 렌더링으로 변경
  - `renderStatusBadge`를 별도 파일로 분리해 fast-refresh 규칙 위반 제거
  - `useExcelImportHubPage` 초기 로딩 effect를 안전 패턴으로 교체
  - `useExcelImportHubPage`의 `localStorage` 직접 접근을 제거하고 `createJsonStorage + STORAGE_KEYS.excelSelectedSite` 경유로 변경

검증:
- `npm.cmd run lint:src2` PASS
- `npm.cmd run build` PASS

간단 의견:
- 이번 턴은 "유통 페이지 파싱 복구" + "남은 lint/build 부채 청산"까지 같이 처리해 다음 리뉴얼 전 기본 상태를 정상화했다.

## 핵심 로직 3줄
- 1) 깨진 logistics 스키마/페이지 파일을 재작성해 파싱 에러와 한글 표시 깨짐을 동시에 해소했습니다.
- 2) 태그 입력 컴포넌트의 effect 기반 파생 상태를 제거해 불필요한 렌더/경고를 줄였습니다.
- 3) 엑셀 미리보기 컴포넌트를 제네릭 타입으로 고정하고 상태 배지 분리로 lint/build를 모두 통과시켰습니다.

## 입문자 설명 3줄
- 1) 코드가 깨져서 실행이 안 되던 부분은 파일을 정상 코드로 다시 써서 바로 고쳤습니다.
- 2) 태그 입력은 복잡한 상태 동기화를 줄여서 더 단순하고 안전하게 바꿨습니다.
- 3) 엑셀 화면에서 타입이 느슨했던 부분을 엄격하게 바꿔서 경고 없이 빌드되게 했습니다.

## 주의 사항
- 유통 페이지 문자열 깨짐은 인코딩 혼합 시 다시 발생할 수 있으므로, 편집기 UTF-8 고정이 필요합니다.
- 엑셀 훅은 아직 localStorage 직접 접근을 사용 중이라(기존 구조) 보안 체크 기준에서는 후속 분리가 필요합니다.
- 리뉴얼 중 lint를 뒤로 미루면 파싱/타입 문제를 늦게 발견하므로 턴 내 `build + lint` 동시 검증을 유지해야 합니다.

## 향후 과정
- 다음 리뉴얼 전에 `useRegisterLogisticsPage.ts`를 2단계(명령 로직 분리)로 더 축소합니다.
- 엑셀 훅의 localStorage 접근을 repo/storage adapter 경유로 바꿔 security 체크 부채를 줄입니다.
- `RegisterLogisticsDailyPage.tsx`도 섹션 컴포넌트로 나눠 line 수를 추가로 줄입니다.

## 이슈 상태
- `Resolved`: 이번 턴 범위(추가 문제점 점검, 파싱 복구, lint/build 정상화) 완료.

## 추가 반영 15 (유통 훅 분리 2단계 - commands 분리)
- 008 문서의 다음 단계 계획대로 `useRegisterLogisticsPage.ts` 명령 로직을 `logistics/commands.ts`로 분리했다.
- 적용 체크리스트 기준:
  - `PAGE_RENEWAL_CHECKLIST` 사전분석/설계 가드레일/검증 게이트 확인
  - `TASK_EXECUTION_CHECKLIST`의 기능파일 맵 사전 참조 및 build gate 적용
- 코드 변경:
  - 신규: `src2/app/pages/register/hooks/logistics/commands.ts`
    - `createPartnerQuickCommand`
    - `createVehicleQuickCommand`
    - `updatePartnerQuickNameCommand`
    - `submitLogisticsCommand`
    - 내부 `syncPartnerProfileFromLine`
  - 변경: `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
    - 위 명령들을 호출하는 orchestration 훅으로 축소
- 라인수 변화:
  - `useRegisterLogisticsPage.ts`: 567 -> 297
  - `logistics/commands.ts`: 373 (주의 구간, 후속 세분화 후보)
- 문서 동기화:
  - `src2/docs/reference/feature-files-map-unified.md`에 `logistics/commands.ts` 추가
  - `src2/docs/reference/register-daily-files.md`에 LOC/책임/위험도 갱신

검증:
- `npm.cmd run build` PASS
- `npm.cmd run lint:src2` PASS

간단 의견:
- 훅 비대화를 크게 줄였고, 다음 단계(UI 섹션 분리)로 넘어가기 좋은 구조로 정리됐다.

## 핵심 로직 3줄
- 1) 거래처/차량 빠른등록, 중복수정, submit 저장을 `commands.ts`로 이동해 훅 책임을 분리했습니다.
- 2) `submitLogisticsCommand` 안에서 저장 + 프로필 동기화 + draft 초기화를 일관된 명령 흐름으로 고정했습니다.
- 3) `useRegisterLogisticsPage`는 상태 계산/초기화/옵션 조합 중심 orchestration으로 축소했습니다.

## 입문자 설명 3줄
- 1) 긴 훅에서 "실행 명령" 부분을 따로 파일로 빼서 읽기 쉬워졌습니다.
- 2) 화면은 그대로인데, 내부 구조만 정리해서 유지보수하기 쉬운 상태가 됐습니다.
- 3) 이제 다음엔 화면 컴포넌트를 섹션으로 쪼개는 작업을 바로 시작할 수 있습니다.

## 주의 사항
- `commands.ts`가 373줄이라 또 비대화될 수 있어, submit 검증/저장 부분을 1회 더 나눌 필요가 있습니다.
- 훅과 명령 파일 간 타입 경계가 늘어나 import/타입 이동 시 누락 위험이 있습니다.
- UI 섹션 분리가 아직 미완이라 `RegisterLogisticsDailyPage.tsx`의 고위험(500+) 상태는 그대로입니다.

## 향후 과정
- 다음 턴에서 `RegisterLogisticsDailyPage.tsx`를 `sections/logistics/*`로 분리합니다.
- `commands.ts`는 `submit`, `partner`, `vehicle` 단위로 추가 세분화합니다.
- 분리 후 `register-daily-files.md`/`feature-files-map-unified.md`를 즉시 재갱신합니다.

## 이슈 상태
- `Open`: 유통 훅 2단계(commands 분리) 완료, UI 섹션 분리 단계 진행 필요.

## 추가 반영 16 (유통 페이지 UI 섹션 분리 완료)
- 008 다음 단계 지시에 따라 `RegisterLogisticsDailyPage.tsx`를 섹션 조립형으로 분리했다.
- 신규 섹션 파일:
  - `sections/logistics/LogisticsFormSection.tsx`
  - `sections/logistics/SelectedDateLogisticsList.tsx`
  - `sections/logistics/PartnerQuickModal.tsx`
  - `sections/logistics/VehicleQuickModal.tsx`
  - `sections/logistics/IssueActionModal.tsx`
  - `sections/logistics/LayerModal.tsx`
  - `sections/logistics/LogisticsToast.tsx`
  - `sections/logistics/index.ts`
- 결과:
  - `RegisterLogisticsDailyPage.tsx` 661 -> 268
  - 페이지는 조립/상태 연결만 담당하도록 단순화
- 문서 동기화:
  - `feature-files-map-unified.md`에 `sections/logistics/*` 반영
  - `register-daily-files.md`에 LOC/위험도/2단계 완료 상태 반영

검증:
- `npm.cmd run build` PASS
- `npm.cmd run lint:src2` PASS

간단 의견:
- 페이지 비대화(500+) 구간을 해소했고, 이후 수정은 섹션 단위로 안전하게 진행할 수 있는 구조가 됐다.

## 핵심 로직 3줄
- 1) 유통 페이지의 입력 폼/기록 목록/모달/토스트를 섹션 파일로 분리했습니다.
- 2) 메인 페이지는 훅 데이터 연결과 이벤트 핸들러 조립만 남겨 책임을 줄였습니다.
- 3) 기능파일 맵/상세 맵 문서를 새 구조 기준으로 즉시 갱신해 참조 신뢰도를 유지했습니다.

## 입문자 설명 3줄
- 1) 이제 유통 페이지 코드를 열면 "전체 흐름"만 보이고, 상세 UI는 별도 파일에서 보면 됩니다.
- 2) 입력폼이나 모달을 고칠 때 전체 페이지를 건드리지 않아도 됩니다.
- 3) 문서도 같이 업데이트해서 다음 작업자가 파일 위치를 바로 찾을 수 있습니다.

## 주의 사항
- `LogisticsFormSection.tsx`가 311줄로 경계 구간이라, 다음에 Basic/Type/Weight 블록으로 추가 분리가 필요합니다.
- `commands.ts`도 373줄이라 submit/quick-add 명령을 더 나누지 않으면 다시 비대화될 수 있습니다.
- 모달 섹션에서 공유하는 문구/템플릿은 공통화하지 않으면 향후 변경 시 중복 수정 포인트가 남습니다.

## 향후 과정
- 다음 단계에서 `LogisticsFormSection.tsx`를 입력 블록 단위로 2차 분해합니다.
- `commands.ts`는 partner/vehicle/submit 명령 파일로 세분화합니다.
- 이후 3단계 계획대로 `todayYmd/sort/title` 공통 helper를 kernel로 상향합니다.

## 이슈 상태
- `Open`: UI 섹션 분리 완료, command/폼 추가 세분화 단계 진행 필요.

## 추가 반영 17 (폼 섹션 2차 분해)
- UI 분리 후 남아있던 `LogisticsFormSection.tsx`(311)을 4개 하위 블록으로 추가 분해했다.
  - `LogisticsIdentityFields.tsx`
  - `LogisticsTypeFields.tsx`
  - `LogisticsWeightFields.tsx`
  - `LogisticsFormActions.tsx`
- 결과:
  - `LogisticsFormSection.tsx` 311 -> 76 (조립 전용)
  - 페이지 조립(`RegisterLogisticsDailyPage.tsx`) 268 유지
- 문서 갱신:
  - `register-daily-files.md`에 새 섹션 파일/LOC/위험도 반영

검증:
- `npm.cmd run build` PASS
- `npm.cmd run lint:src2` PASS

간단 의견:
- 입력 폼 변경 범위를 4개 블록으로 쪼개면서 UI 수정 시 충돌 가능성을 더 줄였다.

## 핵심 로직 3줄
- 1) 큰 폼 섹션을 Identity/Type/Weight/Actions 블록으로 나눴습니다.
- 2) `LogisticsFormSection`은 블록 조립만 담당하도록 단순화했습니다.
- 3) 전체 빌드/린트를 다시 통과시켜 분해 후 회귀가 없음을 확인했습니다.

## 입문자 설명 3줄
- 1) 이제 유통 입력 폼은 한 파일이 아니라 의미별 파일 4개로 관리됩니다.
- 2) 예를 들어 중량 입력만 바꾸려면 `LogisticsWeightFields.tsx`만 보면 됩니다.
- 3) 파일이 작아져서 다음 수정 때 실수할 확률이 줄어듭니다.

## 주의 사항
- Type/Identity 블록도 100줄 이상이라 요구사항이 더 늘면 1회 추가 분리가 필요할 수 있습니다.
- 동일 인라인 스타일 패턴이 섹션들에 반복되어 추후 스타일 공용화 포인트가 남아 있습니다.
- command 파일(373 LOC) 비대화는 아직 남아 있으므로 다음 턴에서 우선 처리해야 합니다.

## 향후 과정
- `commands.ts`를 `partner/vehicle/submit` 단위로 분해합니다.
- 제목/날짜/sort 유틸을 kernel 공용으로 상향해 register 훅 중복을 줄입니다.
- 다음 리뉴얼 대상 페이지에도 sections 패턴을 템플릿으로 재사용합니다.

## 이슈 상태
- `Open`: UI 세분화 완료, command 세분화 및 공용 유틸 상향 단계 진행 필요.

## 추가 반영 18 (공용 후보 즉시 상향 + 통합 문서 최신화)
- 사용자 요청("분리한 것 중 공용으로 쓸 수 있는가") 기준으로 코드/문서를 함께 정리했다.
- 코드 공용화 반영:
  - `useManageActionPage.ts`의 로컬 `sortByRecent` 제거 후 `@kernel/utils/sortByRecordDateUpdated` 사용
  - `useManageIssuePage.ts`의 로컬 `sortByRecent` 제거 후 동일 공용 유틸 사용
  - `useManageProductionPage.ts`의 로컬 `sortByRecent` 제거 후 동일 공용 유틸 사용
- 문서 최신화 반영:
  - `feature-files-map-unified.md`를 전체 도메인 기준으로 재정리하고, 신규 파일 추가 전 선참조 규칙을 명시
  - `register-daily-files.md`를 현재 구조/LOC/공용화 상태 기준으로 재작성
  - `PAGE_RENEWAL_CHECKLIST.md`에 "신규 기능파일 생성 전 feature-files-map 선확인"을 강제 규칙으로 고정

검증:
- `npm.cmd run build` PASS
- `npm.cmd run lint:src2` PASS

간단 의견:
- 지금 분리해둔 logistics 구조는 다른 페이지(특히 manage/register daily)에 그대로 재사용 가능한 패턴이 맞다.
- 이번에 정렬 로직을 register뿐 아니라 manage까지 공용화해 재사용 경로를 실제 코드로 확인했다.

## 핵심 로직 3줄
- 1) manage 훅 3곳의 정렬 로직을 `@kernel/utils/recordSort.ts`로 통합했습니다.
- 2) 기능 파일 통합 맵 문서를 재작성해 "파일 생성 전 선참조" 규칙을 고정했습니다.
- 3) register daily 상세 맵을 최신 LOC/분리 상태 기준으로 갱신했습니다.

## 입문자 설명 3줄
- 1) 비슷한 정렬 코드를 여러 파일에 두지 않고, 공용 유틸 하나를 같이 쓰게 만들었습니다.
- 2) 이제 새 기능 파일 만들기 전에 먼저 확인해야 할 문서가 명확해졌습니다.
- 3) 유통 리뉴얼 구조를 다른 페이지에도 복제하기 쉬운 기준 문서가 준비됐습니다.

## 주의 사항
- `useRegisterActionPage.ts`, `useRegisterProductionPage.ts`, `useRegisterOfficePage.ts`는 아직 300+ 구간이라 추가 분리 없이 요구가 누적되면 다시 비대화됩니다.
- 제목 템플릿(`[일일]/[이슈]/[조치]`)은 도메인별 하드코딩이 남아 있어 다음 공용화 대상입니다.
- manage 훅의 나머지 변환/정규화 helper도 증가하면 `kernel` 상향 기준을 더 엄격히 적용해야 합니다.

## 향후 과정
- 다음 턴에서 `useRegisterActionPage.ts`를 우선 분리하고, 제목 템플릿 helper를 `kernel`로 상향합니다.
- 이후 production/office 훅도 동일 분리 패턴(command + selector + mapper)으로 맞춥니다.
- page 리뉴얼 신규 작업 전 `feature-files-map-unified.md` 선검토를 작업 루틴으로 고정합니다.

## 이슈 상태
- `Open`: 공용화 1차 반영 완료, register daily 300+ 훅 분리와 title template 공용화가 다음 우선 작업.

## 추가 반영 19 (조치 훅 분리 + 제목 템플릿 공용화)
- `useRegisterActionPage.ts`를 orchestration 중심으로 축소하고, 조치 도메인 로직을 `hooks/action/*`로 분리했다.
  - 신규: `action/constants.ts`, `action/selectors.ts`, `action/commands.ts`, `action/types.ts`
  - 결과: `useRegisterActionPage.ts` 332 -> 139 LOC
- 제목 규칙을 kernel 공용 템플릿으로 상향했다.
  - 신규: `src2/kernel/schema/daily/titleTemplates.ts`
  - 반영: 유통(`logistics/formatters.ts`), 이슈(`useRegisterIssuePage.ts`), 조치(`action/commands.ts`), 자동제목(`AutoTitleField.tsx`, `useRegisterProductionPage.ts`)
- 유통 이슈 모달에서 조치 저장 시 템플릿/기록일을 명시적으로 전달하도록 보강했다.
  - `RegisterLogisticsDailyPage.tsx`의 `submitAction` 호출에 `titleTemplate`, `enforceRecordDate` 추가
- 문서 동기화:
  - `feature-files-map-unified.md`
  - `register-daily-files.md`

검증:
- `npm.cmd run build` PASS
- `npm.cmd run lint:src2` PASS

간단 의견:
- 지금 분리 구조는 다음 대상(`production`, `office`)에도 그대로 재사용 가능한 패턴으로 정착됐다.

## 핵심 로직 3줄
- 1) 조치 저장/삭제/이슈완료 연계를 `hooks/action/commands.ts`로 분리했습니다.
- 2) `[일일][유통]`, `[이슈][일일][유통]`, `[조치][일일][유통]` 제목 규칙을 kernel 템플릿으로 통합했습니다.
- 3) `useRegisterActionPage.ts`는 상태 조합/초기화/명령 호출만 담당하도록 축소했습니다.

## 입문자 설명 3줄
- 1) 조치 페이지의 긴 훅에서 "실행 로직"을 따로 빼서 파일 역할이 분명해졌습니다.
- 2) 제목 문구를 한 군데에서 만들도록 바꿔서 나중에 문구 수정이 쉬워졌습니다.
- 3) 유통 모달에서 조치 저장할 때도 같은 규칙이 자동으로 적용됩니다.

## 주의 사항
- `useRegisterProductionPage.ts`와 `useRegisterOfficePage.ts`는 아직 300+ LOC라 요구사항 누적 시 다시 비대화될 수 있습니다.
- 제목 템플릿이 늘어날 경우 `titleTemplates.ts`에 도메인별 네이밍 규칙을 더 엄격히 두지 않으면 함수가 커질 수 있습니다.
- `ActionRegisterForm.tsx`/`IssueRegisterForm.tsx`의 문자열/레이블 정리는 별도 UX 턴에서 한 번 더 다듬는 것이 안전합니다.

## 향후 과정
- 다음 턴에서 `useRegisterProductionPage.ts`를 `production/*` 보조 파일로 분해합니다.
- 이어서 `useRegisterOfficePage.ts`를 `office/*` 보조 파일로 분해하고, 태그/제목/정렬 공용만 남깁니다.
- 분해 완료 후 `register-daily-files.md`의 우선순위를 갱신하고 다음 리뉴얼 템플릿으로 고정합니다.

## 이슈 상태
- `Open`: action 분해와 title 공용화 완료, production/office 분해가 다음 우선 작업.


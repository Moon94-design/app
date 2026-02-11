# Excel/유통관리 보정: 날짜 파싱, site 전역 선택, 미입력 분리

> 작성일: 2026-02-11
> 주제: 계량현황 업로드/관리 화면 정합성 보정

---

## 변경 요약
- 날짜 파싱 규칙을 확장해 `Date 객체`, `YYYY-MM-DD HH:mm:ss`, `M/D/YYYY` 등을 정상 처리하도록 수정.
- 계량 업로드 적용 수량 정책을 `완료+미완료` 기준으로 UI/버튼/실제 저장 경로와 일치시킴.
- 엑셀 허브 상단에 지점(site) 전역 선택을 추가하고 로컬에 유지되도록 변경.
- 유통관리에서 `기본 미입력` / `추가 미입력`을 분리하고, site/미입력 필터를 추가.

## 코드 변경
- 엑셀
  - `src2/kernel/schema/excel/expressionNormalization.ts`
    - 날짜 파싱 확장 (Date/시간포함 포맷/M-D-YYYY 계열)
  - `src2/app/pages/excel/sections/ExcelHubLayoutSection.tsx`
    - 전역 site 선택 UI 추가
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
    - `selectedSite` 상태 + localStorage 유지
  - `src2/app/pages/excel/ExcelImportHubPage.tsx`
    - site를 허브/계량 섹션으로 전달
  - `src2/app/pages/excel/sections/ExcelWeighingUploadSection.tsx`
    - 적용 건수/정책 문구를 `완료+미완료` 기준으로 정합화
    - 섹션 내부 site 선택 제거(허브 전역 선택 사용)
  - `src2/app/pages/excel/components/ExcelParseResultView.tsx`
    - `미완성` 표기를 `미완료`로 변경
    - 상태 배지 텍스트 한국어화(완료/미완료/실패)

- 유통관리
  - `src2/kernel/schema/daily/logisticsTypes.ts`
    - line/site, baseMissing, extraMissing 필드 확장
  - `src2/kernel/schema/daily/logisticsHelpers.ts`
    - 계량->유통 변환 시 `기본 미입력/추가 미입력` 플래그 생성
    - 날짜 누락 건도 누락 그룹(`1900-01-01`)으로 포함해 관리에서 보이도록 처리
  - `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
    - siteFilter/missingFilter 추가
    - 필터 적용된 records 반환
  - `src2/app/pages/manage/ManageLogisticsPage.tsx`
    - 필터 상태/핸들러 연결
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
    - site 필터(전체/대구/성주)
    - 미입력 필터(전체/기본/추가/없음)
    - 라인 컬럼에 지점/기본 미입력/추가 미입력 표시 추가

## 게이트
- `npm.cmd run build` 성공

## 확인 필요(수동)
- `/excel`에서 site를 대구 선택 후 파일 업로드 -> 새로고침 후 선택 유지 확인
- `/excel` 계량 업로드 시 버튼 표시 건수와 실제 alert 건수 일치 확인
- 날짜 컬럼이 시간 포함인 행이 관리 유통기록에 정상 노출되는지 확인
- `/manage/daily` 유통기록에서 site/미입력 필터 동작 확인

다음 질문: 지금 수동 체크 결과 보면서 `기본 미입력`/`추가 미입력` 기준(현재: 중량/단가/날짜 vs 차량)을 더 조정할까?

## 핵심 로직 3줄
- 1) 날짜 파싱기가 시간 포함 문자열/Date 객체를 이해하도록 확장해 누락 전파를 줄였다.
- 2) 계량 업로드 적용 기준을 `OK+INCOMPLETE`로 고정해 화면 표시와 실제 저장 건수를 맞췄다.
- 3) 유통 라인에 `baseMissing/extraMissing/site` 메타를 붙여 관리 필터에서 분리 조회 가능하게 했다.

## 입문자 설명 3줄
- 1) 엑셀 날짜가 조금만 형식이 달라도 실패하던 걸, 더 많은 형식을 읽게 바꿨다.
- 2) 화면에 "몇 건 등록"이라고 보이는 숫자와 실제 저장 숫자가 다르던 문제를 맞췄다.
- 3) 미입력도 종류를 나눠서(기본/추가) 어디를 먼저 보완할지 관리에서 바로 고를 수 있게 했다.

## 주의 사항
- AI가 날짜 파싱 범위를 넓히면서 경계 포맷(지역설정 문자열)을 완전히 커버하지 못했을 수 있다.
- `1900-01-01` 누락 그룹은 운영 표준값이 아니므로, 후속 단계에서 전용 누락 버킷 구조로 바꾸는 게 안전하다.

## 향후 과정
- 다음 단계에서 누락 날짜 전용 버킷(`recordDateUnknown` 같은 명시 필드)으로 분리해 임시 날짜 의존을 제거한다.
- site 전역 선택을 partner/vehicle까지 메타 저장으로 확장할지 결정하면, 이후 통합 병합 키 일관성이 더 좋아진다.

---

## 추가 보정 (유통관리 미표시 이슈)
- 증상: 계량 업로드 후 유통관리에서 데이터가 안 보이는 케이스가 발생.
- 원인: `useManageLogisticsPage`의 seed meta 단락이 먼저 종료되어, `daily`가 비어 있어도 `weighing -> daily` 재시드가 건너뛰어질 수 있었음.
- 조치: seed meta 조기 종료 분기를 제거하고, `daily`에 logistics가 없으면 항상 weighing 기반 재시드를 수행하도록 수정.

### 코드 반영
- `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
  - `hasSeedMeta` 단독 종료 조건 제거
  - logistics 비어있을 때 재시드 경로 강제 유지

### 게이트
- `npm.cmd run build` 성공

### 확인 포인트
- localStorage 초기화 후 계량 업로드 -> `/manage/daily` 유통관리 진입 시 데이터 표시되는지 확인.
- 기존 seed meta가 남아 있어도 logistics 비어있다면 재시드되는지 확인.

## 핵심 로직 3줄
- 1) 유통관리는 `daily logistics`가 없으면 seed meta와 무관하게 weighing에서 다시 생성한다.
- 2) seed meta는 재시드 차단 조건이 아니라 참고 메타로만 유지한다.
- 3) 이 변경으로 "업로드는 됐는데 관리에 안 보임" 경로를 닫았다.

## 입문자 설명 3줄
- 1) 예전엔 "한번 생성했음" 표시(meta) 때문에 다시 만들기를 건너뛰는 경우가 있었다.
- 2) 이제는 실제 데이터가 없으면 항상 다시 만들어서 화면에 보이게 했다.
- 3) 즉, 표시 플래그보다 실제 데이터 존재 여부를 우선 기준으로 바꾼 것이다.

## 주의 사항
- AI가 재시드 조건을 넓히면서, 이후 정책에서 "재생성 금지" 규칙이 필요해지면 충돌 가능성이 있다.
- 향후에는 seed meta를 단순 플래그가 아니라 버전/조건 메타로 정교화할 필요가 있다.

## 향후 과정
- 다음 단계에서 재시드 조건에 버전(파서 버전/site 정책 버전) 정보를 붙여, 의도된 경우에만 강제 재생성되도록 고도화한다.
- 유통관리 진입 시점 자동 재시드 대신, 필요 시 수동 "재동기화" 버튼 옵션도 검토한다.

---

## 추가 보정 2 (필터 정확화 + 누락항목 가시화 + 수정폼 확장)
- 증상 1: 대구/성주 필터가 "포함"처럼 동작해서 선택 지점 외 라인이 같이 보이는 문제.
- 증상 2: 기본/추가 미입력의 기준/대상이 화면에서 명확히 보이지 않는 문제.
- 증상 3: 유통관리 수정폼에서 거래처/차량/site를 수정할 수 없어 고정값처럼 보이는 문제.

### 조치
- site/missing 필터를 "레코드 단위"가 아니라 "라인 단위"로 적용하도록 변경.
  - 선택 지점/미입력 조건에 맞는 라인만 남기고, 빈 레코드는 숨김.
- 기본/추가 미입력 항목명을 라인에 저장해서 표에서 직접 노출.
  - `baseMissingFields`, `extraMissingFields` 추가.
- 유통관리 수정폼에서 아래 항목 편집 가능하도록 확장.
  - site, 거래처명, 거래처 코드/ID, 차량번호
- 자동 생성 태그를 `계량현황` 단일에서 `엑셀추가 + 계량현황`으로 변경.

### 코드 반영
- `src2/kernel/schema/daily/logisticsTypes.ts`
- `src2/kernel/schema/daily/logisticsHelpers.ts`
- `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
- `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
- `src2/app/pages/manage/sections/ManageLogisticsEditFormSection.tsx`

### 게이트
- `npm.cmd run build` 성공

### 확인 포인트
- 유통관리에서 `site=성주` 선택 시 성주 라인만 보이는지.
- `기본 미입력`/`추가 미입력` 필터 각각에서 누락항목 텍스트가 보이는지.
- 수정폼에서 거래처/차량/site 수정 후 저장 시 목록 반영되는지.

## 핵심 로직 3줄
- 1) 필터 기준을 레코드가 아니라 라인으로 내려서 지점/미입력 분리가 정확히 동작하게 했다.
- 2) 미입력 판정을 boolean만 두지 않고 누락 필드명을 함께 저장해 원인을 보이게 했다.
- 3) 수정폼 편집 범위를 거래처/차량/site까지 확장해 고정값 문제를 해소했다.

## 입문자 설명 3줄
- 1) 이제 "성주만 보기"를 누르면 성주 데이터만 남고 나머지는 화면에서 빠진다.
- 2) "미입력"도 그냥 경고가 아니라, 어떤 칸이 비었는지 이름까지 보여준다.
- 3) 관리 화면에서 필요한 값(거래처/차량/지점)을 직접 고쳐서 다시 저장할 수 있다.

## 주의 사항
- AI가 누락 기준을 코드로 정의하는 과정에서, 실제 운영 기준과 1:1로 다를 수 있다.
- 현재 누락 분류는 규칙 기반이므로 도메인 확정 후 재조정(정책화)이 필요하다.

## 향후 과정
- 다음 단계에서 "거래처 없으면 등록/검색 연계"를 붙여 수정폼 수동 입력 부담을 줄인다.
- 미입력 기준(기본/추가)을 rule dictionary와 연결해 도메인별로 조절 가능하게 확장한다.

---

## 추가 보정 3 (미입력 재계산 + 완료 표기 + 날짜 중복 병합)
- 요청 반영:
  - `미입력 없음`은 `완료`로 표기.
  - 유통기록에서 `기본/추가` 분리를 제거하고 `미입력` 단일 체계로 단순화.
  - 단가/필수값 수정 후에도 미입력에서 안 빠지던 문제 해결.
  - 같은 날짜 레코드가 여러 번 보이던 문제 해결.

### 핵심 수정
- 저장/조회 시 라인 미입력 상태를 값 기반으로 매번 재계산하도록 변경.
  - `recomputeLineMissing(line)` 도입.
- 유통 목록 필터를 `all/missing/complete`로 단순화.
- 동일 `recordDate` 레코드를 목록 단계에서 병합(`mergeLogisticsByDate`)해 중복 표시 제거.

### 코드 반영
- `src2/kernel/schema/daily/logisticsHelpers.ts`
  - `recomputeLineMissing` 추가
  - `withNormalizedLogisticsRecord`에서 미입력 재계산 적용
- `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
  - missing 필터를 `missing/complete`로 단순화
  - `mergeLogisticsByDate` 추가 및 목록 적용
  - save 후 재조회 시 재계산/병합 적용
- `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
  - `미입력`/`완료` 단일 상태 표기
  - 미입력 항목은 통합 목록(기존 기본/추가 합산)으로 표기
- `src2/app/pages/manage/sections/ManageLogisticsEditFormSection.tsx`
  - 수정폼 누락 안내 문구를 단일 `미입력 항목`으로 정리

### 게이트
- `npm.cmd run build` 성공

### 확인 포인트
- 단가 수정 후 저장하면 해당 라인이 `완료`로 전환되는지.
- `미입력` 필터/`완료` 필터가 기대대로 분리되는지.
- 같은 날짜의 중복 카드가 하나로 병합되어 보이는지.

## 핵심 로직 3줄
- 1) 미입력 여부를 저장된 플래그가 아니라 현재 값으로 매번 재계산하도록 바꿨다.
- 2) 목록 상태를 `미입력/완료`로 단순화해 운영 판단을 빠르게 만들었다.
- 3) 동일 날짜 레코드는 병합해 중복 카드 표기를 제거했다.

## 입문자 설명 3줄
- 1) 예전에는 한번 미입력으로 찍히면 수정해도 그대로 남는 경우가 있었는데, 이제 다시 계산한다.
- 2) 화면에서 상태를 두 갈래(미입력/완료)로 단순하게 보여서 헷갈림을 줄였다.
- 3) 날짜가 같은 카드가 여러 개 뜨던 건 합쳐서 한 카드로 보이게 했다.

## 주의 사항
- 날짜 기준 병합은 운영상 유용하지만, 원본 분리 추적이 필요한 경우 상세 추적키 표시 보강이 필요하다.
- 미입력 기준은 현재 값 기반 규칙이므로, 업무정책 변경 시 규칙 함수만 단일 수정하도록 유지해야 한다.

## 향후 과정
- 다음 단계에서 카드 내부에 원본 배치/출처(업로드 회차) 표시를 추가해 병합 후 추적성을 강화한다.
- 완료 상태 기준을 rule dictionary와 연결해 도메인별(매입/매출)로 세분화 가능하게 확장한다.

---

## 추가 보정 4 (미입력 전용 수정모드)
- 요청 반영:
  - 미입력 필터에서 수정 진입 시, 해당 날짜의 전체 내역이 아니라 미입력 라인만 편집.
  - 전체/완료/미입력 상태를 단순화해 운영 흐름 정리.

### 핵심 수정
- 수정 진입에 `scope(all | missing)` 개념 추가.
  - 목록이 `미입력` 상태일 때는 `미입력 수정`으로 진입하고 편집폼에서 미입력 라인만 노출.
  - 목록이 `전체/완료` 상태일 때는 기존처럼 전체 라인 편집.
- 유통 목록 상태 체계 단순화.
  - 기존 `기본/추가` 분리 필터 -> `all/missing/complete`.
- 미입력 재계산 + 날짜 병합 유지.

### 코드 반영
- `src2/app/pages/manage/hooks/useManageLogisticsPage.ts`
  - `editingScope` 상태 추가
  - `startEdit(id, scope)`로 수정 진입 모드 전달
- `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx`
  - `onEdit(id, scope)` 시그니처 변경
  - 미입력 필터에서 버튼 라벨/동작을 `미입력 수정`으로 분기
- `src2/app/pages/manage/ManageLogisticsPage.tsx`
  - editScope를 수정폼으로 전달
- `src2/app/pages/manage/sections/ManageLogisticsEditFormSection.tsx`
  - `editScope` 반영
  - `missing` 모드일 때 미입력 라인 인덱스만 노출/편집

### 게이트
- `npm.cmd run build` 성공

### 확인 포인트
- `미입력` 필터 상태에서 `수정` 진입 시 미입력 라인만 나오는지.
- `전체` 필터 상태에서 `수정` 진입 시 그날 전체 라인이 나오는지.
- 미입력 라인 보정 후 저장하면 완료 필터에서 확인 가능한지.

## 핵심 로직 3줄
- 1) 수정 진입 시점에 `all/missing` 모드를 태워 편집 대상 라인 범위를 분리했다.
- 2) 미입력 화면에서는 미입력 라인만 보이고, 전체 화면에서는 날짜 전체 라인을 유지한다.
- 3) 목록 필터 체계를 단순화해 사용자 기준(미입력 vs 완료)으로 바로 동작하게 맞췄다.

## 입문자 설명 3줄
- 1) 이제 "미입력 화면에서 수정"을 누르면 필요한 줄만 보여서 빠르게 고칠 수 있다.
- 2) "전체 화면에서 수정"을 누르면 예전처럼 하루 전체를 한 번에 볼 수 있다.
- 3) 화면 진입 목적에 따라 편집 범위를 바꿔서 복잡함을 줄였다.

## 주의 사항
- AI가 미입력 라인 인덱스를 초기 스냅샷으로 잡았기 때문에, 편집 중 상태 변화가 있어도 노출 라인은 유지된다.
- 필요하면 다음 단계에서 편집 중 실시간 재필터(동적 숨김) 옵션을 추가할 수 있다.

## 향후 과정
- 미입력 모드 저장 후 자동으로 다음 미입력 라인으로 포커스를 이동하는 UX를 추가하면 처리 속도가 더 올라간다.
- 거래처/차량 연계 등록(검색/신규 팝업)은 별도 작업으로 분리해 단계적으로 붙인다.

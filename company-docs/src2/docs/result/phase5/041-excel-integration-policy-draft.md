# 엑셀 통합/매핑 정책 초안 (KORA + Hometax + Extra)

> 작성일: 2026-02-10
> 주제: 다중 엑셀 소스 통합 기준, 자동/수동 분류 전략, 등록/일지 참조 정책 정리

---

## 배경
- 소스가 `kora`, `hometax`, `extra`로 분화되어 있고, `site(대구/성주)`가 섞여 있다.
- KORA 계량현황은 `순번`이 아닌 행 끝 전표번호(`CW/CP...`)를 중심으로 식별해야 한다.
- hometax 매입 내역은 운임/서비스/기타가 혼재되어 있으며 텍스트가 비정형이라 완전 자동 분류가 어렵다.

## 핵심 정책 (요약)
- 마스터(기준정보): site 무관 통합
  - 대상: 거래처, 차량, 서비스업체
- 트랜잭션(거래내역): site 포함 분리 저장
  - 대상: 계량현황, 세금계산서(매입/매출), 수기 입급내역
- 자동화 원칙:
  - 퍼센트 목표 대신 `confidence 등급(High/Medium/Low)` + `reviewQueue` 운영
  - 불확실 항목은 자동 확정 금지

## 키/식별 기준
### 공통 저장 필드
- `source` (`kora` | `hometax` | `extra`)
- `site` (`대구` | `성주`)
- `sourceDocId` (파일/승인번호/전표번호)
- `sourceRowId`

### site 수집 규칙 (고정)
- 1순위: 업로드 시 사용자가 `site`를 필수 선택
- 2순위(선택): 파일 메타/헤더 텍스트에서 추론 가능
- 추론으로 채운 `site`는 `confidence=Low`로 저장하고 reviewQueue 확인 대상

### KORA 계량현황 중복 판정
- 1차 키: `site + slipNo(CW/CP...)`
- 2차 보조: `date + amount + vehicleNo + inOut`
- 규칙:
  - 같은 site + 같은 slipNo => 중복
  - 다른 site + 같은 slipNo => 기본 별건 처리
  - `slipNo`가 비어 있으면 중복 확정 금지(보조키 임시 그룹만 허용, reviewQueue 이동)

### Hometax 중복 판정
- 1차 키: `site + 승인번호 + 품목순번`
- 세금계산서/품목 시트는 `승인번호`로 연결

### Extra(수기 입금내역) 컬럼 규칙
- `Unnamed/None` 계열 컬럼은 무시
- 유효 컬럼 화이트리스트만 사용:
  - `일자`, `거래처`, `단가`, `입고량`, `금액`, `부가세합`, `송금일자`, `송금액`

## 등록/일지 자동 참조 정책
### 기준정보 등록
- 엑셀 업로드 시 키 매칭 성공:
  - 기존 master에 자동 병합
- 애매한 매칭:
  - reviewQueue로 보내고 관리자 확인 후 병합

### 일지 등록
- `site + date` 기준으로 KORA/Hometax/Extra 후보 자동 추천
- 추천 선택 시 일지 초안 자동 생성
  - 라인아이템, 금액, 거래처/차량 후보 자동 채움

## 완료 판정(추가 입력 필요)
### 차량
- 필수: 차량번호, 운송사/소유구분, 담당자명, 연락처(이메일/전화 중 1)

### 서비스업체(vendor)
- 필수: 상호, 사업자번호, 분류(운임/정비/기타), 정산계좌/연락처

### 매입세금계산서 항목
- 필수: 승인번호, 공급자, 품목, 공급가액, site, 분류코드

## Hometax 매입 분류 전략 (운임/서비스/기타)
1) 규칙 기반 자동 분류
- 키워드: 운임/운반/물류/배송/정비/수리/용역

2) 업체 사전 기반 보정
- `vendor_profile`에 업체별 기본 분류 저장

3) 수동 검토
- 불확실 항목은 `미분류`로 저장 후 일괄 분류 화면에서 확정

### 분류 결과 상태 규칙
- `classificationStatus`: `auto` | `reviewed` | `manual`
- `confidenceLevel`: `High` | `Medium` | `Low`
- `Low` 또는 핵심 필드 누락 케이스는 자동으로 reviewQueue 대상

## 차량 연계 이슈 대응 (차량번호 직접 부재)
- 직접키가 없는 경우 간접 매핑 적용:
  - `공급자 상호/사업자번호 -> vendor`
  - `vendor -> vehicle 그룹` 관계 테이블(`vendorVehicleLink`)
- 초기 운영:
  - 수동 링크 생성
- 후속 자동화:
  - 동일 공급자 반복 출현 시 링크 추천

## 신규 수동등록 폼(최종 방향)
### 공통 필드
- `site`, `date`, `sourceType`, `amount`, `counterparty`

### 운임 섹션
- `vehicle`, `driver/vendor`, `route(optional)`

### 서비스 섹션
- `serviceType`, `period`, `memo`

### 시스템 필드
- `classificationStatus` (`auto` | `reviewed` | `manual`)
- `confidenceScore`
- `linkedIds` (partner/vehicle/vendor/doc)

## 단계 적용 제안
- Phase 5:
  - site 분리 저장 + 기본 키 체계 + reviewQueue 도입
- Phase 6 준비:
  - mergePolicy 정교화, 통합 조회/집계 API 경계 확정

다음 질문: 이 초안을 기준으로 `docs/roadmap/phase5`에 정식 정책 문서(SSOT)로 승격할까?

## 핵심 로직 3줄
- 1) master는 통합, transaction은 site 분리 저장으로 모델 경계를 고정했다.
- 2) KORA 계량 중복 키를 `site + slipNo(CW/CP...)`로 정의해 대구/성주 충돌을 해소했다.
- 3) hometax 분류는 규칙+사전+수동큐 3단계로 설계해 비정형 텍스트 리스크를 제어했다.

## 입문자 설명 3줄
- 1) 기준정보는 하나로 합치고, 실제 거래내역은 지점별로 나눠 저장하면 관리가 쉬워진다.
- 2) 중복을 잡을 때는 지점 구분(site)을 키에 넣어야 잘못된 중복 판정이 줄어든다.
- 3) 자동 분류가 애매한 건 사람이 확인하도록 남겨야 데이터가 망가지지 않는다.

## 주의 사항
- AI가 만든 분류 규칙은 실제 현장 표기 변형을 100% 커버하지 못할 수 있어 미분류율이 예상보다 높을 수 있다.
- 차량-매입 연계는 직접 키가 부족한 구조라 초기에는 수동 링크 작업량이 발생한다.
- KORA 계량현황의 `slipNo` 공란 행은 자동 중복 제거를 시도하면 오판 위험이 높다.
- Hometax `site`를 추론만으로 확정하면 사업장 혼입 가능성이 있어 업로드 입력 강제가 우선이다.

## 향후 과정
- 다음 단계에서 parser 출력에 `site/source/sourceDocId/sourceRowId`를 강제하면 이후 병합/조회 정책이 안정된다.
- reviewQueue UI를 먼저 만들고 자동분류를 붙여야, 분류 실패 케이스를 운영에서 흡수할 수 있다.
- Extra 파서에 화이트리스트 컬럼 정책을 먼저 적용해 노이즈 컬럼 유입을 차단한다.
- `041` 정책을 기준으로 `docs/roadmap/phase5/excel-migration-roadmap.md`의 단계별 DoD와 동기화한다.

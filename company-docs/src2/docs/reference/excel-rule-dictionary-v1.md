# Excel Rule Dictionary v1 (Base / Learned / Price-Band)

작성일: 2026-02-11  
목적: `excel-unified-taxonomy-v1` 분류 체계를 실제 자동/반자동 분류에 적용하기 위한 규칙 사전을 정의한다.

---

## 0) taxonomy 문서와의 차이
- `excel-unified-taxonomy-v1.md`:
  - "무엇으로 분류할지"를 정의하는 상위 정책(분류 축/레벨/운영 원칙)
- `excel-rule-dictionary-v1.md`(현재 문서):
  - "어떤 텍스트/조건으로 분류할지"를 정의하는 실행 규칙(키워드/우선순위/예외 처리)

---

## 1) 공통 구조
- 규칙 타입:
  - `baseRules`: 기본 사전 규칙(운영자가 초기에 고정한 규칙)
  - `learnedRules`: 사용자 확정 누적으로 생긴 학습 규칙
  - `priceBandRules`: 날짜+단가 범위 기반 반자동 규칙
- 공통 출력:
  - `level1` (`매입` | `매출`)
  - `level2` (예: `PP`, `PE`, `운송료`, `서비스`)
  - `level3` (예: `스크랩`, `압축품`, `분쇄품`, `미세척분쇄품`, `압출펠렛`)
  - `confidence` (`high` | `medium` | `low`)
  - `ruleSource` (`base` | `learned` | `price-band`)

---

## 2) baseRules (기본 규칙)

### 2.1 1차 분류 규칙
1. 업로드 소스가 매입 파일이면 `level1=매입`
2. 업로드 소스가 매출 파일이면 `level1=매출`
3. KORA 계량현황은 문서 내 입/출 또는 방향값 기준으로 매입/매출 판정
4. 1차 판정 불가 시 예외큐로 보냄

### 2.2 2차/3차 키워드 규칙(매입)
- 운송료 계열 키워드:
  - `운송비`, `운임`, `운반비`, `운송료`, `배송`, `물류`, `상차`, `하차`
  - 결과: `level2=운송료` (level3는 비움 또는 하위 타입)
- 서비스 계열 키워드:
  - `수리`, `정비`, `대행`, `수수료`, `임대`, `렌탈`, `점검`, `청소`
  - 결과: `level2=서비스`
- PP/PE 계열 키워드:
  - `PP`, `피피` -> `level2=PP`
  - `PE`, `피이` -> `level2=PE`
  - `압축`, `스크랩`, `비압축`, `말통`, `상자`, `파레트/파렛트`, `혼합`은 3차 후보 신호로만 사용
  - 3차(`스크랩/압축품`)는 priceBandRules 또는 수동 확정으로만 결정

### 2.3 2차/3차 키워드 규칙(매출)
- PP/PE 키워드로 `level2` 판정
- 3차 제품형태 키워드:
  - `세척분쇄`, `분쇄`, `세척x분쇄`, `세척X분쇄`, `미세척분쇄`, `펠렛`, `압출`은 3차 후보 신호로만 사용
  - 3차(`분쇄품/미세척분쇄품/압출펠렛`)는 priceBandRules 또는 수동 확정으로만 결정
  - `말통`, `상자`, `파레트/파렛트`, `혼합`도 동일(자동확정 금지)

### 2.4 baseRules 우선순위
1. 1차(매입/매출) 고정
2. 운송료/서비스 키워드 우선(업무분류)
3. PP/PE 판정
4. 3차는 단어 기반 확정 금지, 후보 제안만 수행
5. 전 품목 공통으로 `priceBandRules(날짜+단가)` 또는 수동 확정으로 3차 결정
6. 불명확 시 예외큐

---

## 3) learnedRules (학습 규칙)

### 3.1 생성 조건
- 예외 항목을 사용자가 같은 결과로 2회 이상 확정하면 `learnedRules` 후보 생성
- 자동 승격 전 검토 목록에서 승인 필요

### 3.2 매칭 키(권장)
- `normalizedText` (비고+품목명 정규화 텍스트)
- `level1`
- `counterpartyHint`(선택)
- `site`(선택, 기본은 공통)

### 3.3 적용 정책
- learned rule은 base rule보다 우선 적용 가능하되, `auto-confirm` 금지
- 항상 `이전 분류 제안`으로 노출 후 사용자 확인
- 오분류 수정 시 해당 learned rule 비활성화/버전 증가

---

## 4) priceBandRules (날짜+단가 기반 반자동 규칙)

### 4.1 필수 조건
- `dateFrom`, `dateTo` 필수
- `priceMin`, `priceMax` 필수
- `level1` 필수(매입/매출 구분)

다의어 처리 강제 조건:
- `말통`, `상자`, `파레트`, `혼합`뿐 아니라 대부분의 품목 용어는 `priceBandRules` 없이는 3차 자동결정 금지
- 즉, baseRules는 기본적으로 level2까지만 확정하고 3차는 price-band 또는 수동확정으로만 결정

전 품목 공통 정책:
- 매입/매출 품목 전부 동일한 3차 결정 절차를 사용한다.
- 예외 없이 `level1 -> level2 -> (date+price rule) -> 사용자 확인 -> level3` 흐름을 따른다.

### 4.2 선택 조건
- `site`
- `supplier`
- `level2` 후보 제한

### 4.3 적용 결과
- 범위에 들어온 항목은 지정한 `level2/level3`를 제안
- 자동 확정하지 않고 사용자 확인 후 반영
- 범위 밖 항목은 예외 큐에 유지

### 4.4 주의
- 긴 기간 범위는 단가 변동으로 오분류 위험 증가
- 같은 단가라도 품목 맥락이 다른 경우가 있어 3차는 특히 확인 필요

---

## 5) 저장 스키마(초안)
```json
{
  "baseRules": [
    {
      "id": "base-transport-001",
      "level1": "매입",
      "tokensAny": ["운송비", "운임", "운송료", "운반비"],
      "result": { "level2": "운송료" },
      "confidence": "high",
      "enabled": true
    }
  ],
  "learnedRules": [
    {
      "id": "learned-pp-001",
      "level1": "매입",
      "normalizedText": "pp압축품",
      "result": { "level2": "PP", "level3": "압축품" },
      "confirmCount": 2,
      "enabled": true
    }
  ],
  "priceBandRules": [
    {
      "id": "priceband-2026-01-pp-01",
      "level1": "매입",
      "dateFrom": "2026-01-01",
      "dateTo": "2026-01-31",
      "priceMin": 100000,
      "priceMax": 130000,
      "result": { "level2": "PP", "level3": "압축품" },
      "enabled": true
    }
  ]
}
```

---

## 6) 운영 절차(요약)
1. baseRules로 자동 분류 시도  
2. 실패/불명확 항목은 예외 큐로 이동  
3. 예외 큐에서 수동 분류 또는 priceBandRules로 일괄 분류  
4. 반복 확정 패턴은 learnedRules 후보로 승격  
5. learned/price-band는 항상 반자동 확인 후 최종 확정

---

## 6.5 날짜 정규화 규칙 (필수)
- 저장 전 모든 날짜를 `YYYY-MM-DD`로 변환한다.
- 인식 대상:
  - `YYYY-MM-DD`
  - `YYYY.MM.DD`
  - `YYYY/MM/DD`
  - `YYYYMMDD`
  - `M/D/YY` (KORA 계량현황에서 다수)
- 변환 실패/공란은 `dateParseError`로 예외 큐에 보낸다.

---

## 7) 버전 관리 규칙
- `ruleVersion`을 명시해 분류 결과와 사용 규칙 버전을 함께 저장
- 규칙 변경 시:
  - 변경 이력 기록
  - 영향 범위(재분류 대상 건수) 확인
  - 필요 시 재분류 배치 실행

# 생산 항목 엑셀 템플릿 스펙 (TEMPLATE_PRODUCTION_LINES)

**작성일**: 2026-02-06  
**템플릿 버전**: v1.0  
**목적**: Phase5-1 파싱/검증 코드 작성 시 참조할 템플릿 규격 정의

---

## TL;DR (반드시 읽기)

DRAFT / 임시 / 변경 가능

“고정 정책”으로 쓴 부분을 권장(default) + 변경 가능

현장 엑셀 서식 기준으로 조정한다
1. **시트명**: `LINES` (없으면 첫 시트 사용)
2. **필수 컬럼**: shift, product, item, bags (4개)
3. **선택 컬럼**: kg, memo (2개)
4. **허용값**: shift=주간/오후/야간, product=분쇄품/펠렛, item=PP/PE
5. **Unique Key**: recordDate + shift + product + item (조합키)
6. **검증 규칙**: 필수값/숫자/허용값/중복키 체크 (Phase5-1 구현)

---

## 1. 시트명 규칙

| 항목 | 값 |
|------|------|
| **기본 시트명** | `LINES` |
| **대체 규칙** | 시트명이 `LINES`가 아니면 **첫 번째 시트** 사용 |
| **대소문자** | 구분 안 함 (lines, Lines, LINES 모두 허용) |

---

## 2. 컬럼 스키마 (헤더)

### 필수 컬럼 (4개)

| 한국어 | 영문 Alias | 필수/선택 | 타입 | 설명 |
|--------|-----------|----------|------|------|
| 근무 | shift | 필수 | 문자 | 근무 시간대 (주간/오후/야간) |
| 생산품 | product | 필수 | 문자 | 생산품 종류 (분쇄품/펠렛) |
| 품목 | item | 필수 | 문자 | 품목 (PP/PE) |
| 자루 | bags | 필수 | 숫자 | 생산 자루 수 |

### 선택 컬럼 (2개)

| 한국어 | 영문 Alias | 필수/선택 | 타입 | 설명 |
|--------|-----------|----------|------|------|
| Kg | kg | 선택 | 숫자 | 생산 중량 (kg) |
| 비고 | memo | 선택 | 문자 | 메모 |

### 컬럼 순서
- **권장 순서**: shift → product → item → bags → kg → memo
- **필수 아님**: 컬럼 순서는 고정되지 않음 (헤더 이름으로 인식)

---

## 3. 값 허용 범위 (Enum)

### shift (근무)
| 허용값 | 설명 |
|--------|------|
| 주간 | 주간 근무 |
| 오후 | 오후 근무 |
| 야간 | 야간 근무 |

- **대소문자**: 구분 안 함 (주간 = 주간 = 주간)
- **영문 alias**: day, afternoon, night (Phase5-1에서 매핑 검토)

### product (생산품)
| 허용값 | 설명 |
|--------|------|
| 분쇄품 | 분쇄 제품 |
| 펠렛 | 펠렛 제품 |

- **대소문자**: 구분 안 함
- **영문 alias**: crushed, pellet (Phase5-1에서 매핑 검토)

### item (품목)
| 허용값 | 설명 |
|--------|------|
| PP | 폴리프로필렌 |
| PE | 폴리에틸렌 |

- **대소문자**: 구분 안 함 (PP = pp = Pp)

---

## 4. Unique Key (업무키)

### 키 구성
```
Unique Key = recordDate + shift + product + item
```

- **recordDate**: 엑셀 파일명 또는 메타데이터에서 추출 (예: `production_lines_20260206.xlsx` → 2026-02-06)
- **shift**: 근무 시간대
- **product**: 생산품 종류
- **item**: 품목

### 중복 체크
- **엑셀 내부 중복**: 같은 파일 내 동일 키 2개 이상 → FAIL
- **DB 충돌**: DB에 이미 존재하는 키 → FAIL (Error 정책)

### 주의사항
- **rowIndex**: Unique Key에 포함 안 됨 (shift+product+item 조합이 유일해야 함)
- **bags/kg**: Unique Key에 포함 안 됨 (수량은 중복 허용)

### 예시
```
recordDate=2026-02-06, shift=주간, product=분쇄품, item=PP → Key: 20260206_주간_분쇄품_PP
recordDate=2026-02-06, shift=주간, product=분쇄품, item=PE → Key: 20260206_주간_분쇄품_PE (OK, 다른 item)
recordDate=2026-02-06, shift=주간, product=분쇄품, item=PP → Key: 20260206_주간_분쇄품_PP (FAIL, 중복)
```

---

## 5. 검증 규칙 (Phase5-1 구현)

### 필수값 검증
- **규칙**: shift, product, item, bags는 빈값 불가
- **에러 코드**: `missing_required`
- **메시지**: "필수값 누락 (행 {row}, 컬럼: {column})"

### 타입 검증
- **bags**: 숫자만 허용 (0 이상)
- **kg**: 숫자만 허용 (0 이상, 빈값 허용)
- **에러 코드**: `bad_number`
- **메시지**: "숫자 파싱 실패 (행 {row}, 컬럼: {column})"

### 허용값 검증
- **shift**: 주간/오후/야간 외 값 → FAIL
- **product**: 분쇄품/펠렛 외 값 → FAIL
- **item**: PP/PE 외 값 → FAIL
- **에러 코드**: `unknown_value`
- **메시지**: "허용되지 않은 값 (행 {row}, 컬럼: {column}, 값: {value})"

### 중복키 검증
- **엑셀 내부 중복**: 같은 파일 내 동일 키 → FAIL
- **DB 충돌**: DB에 이미 존재하는 키 → FAIL
- **에러 코드**: `dup_key`
- **메시지**: "중복키 발견 (행 {row1}, {row2})" 또는 "DB에 이미 존재하는 키"

---

<details>
<summary>Appendix (세부/긴 내용 접기)</summary>

## A. 예시 템플릿 (컬럼 순서)

| shift | product | item | bags | kg | memo |
|-------|---------|------|------|----|------|
| 주간 | 분쇄품 | PP | 100 | 2500 | - |
| 주간 | 분쇄품 | PE | 80 | 2000 | - |
| 오후 | 펠렛 | PP | 120 | 3000 | 특이사항 없음 |
| 야간 | 펠렛 | PE | 90 | 2200 | - |

---

## B. Alias 목록 (Phase5-1에서 매핑)

### shift 컬럼
- **한국어**: 근무, 근무시간, 시간대
- **영문**: shift, workshift, time

### product 컬럼
- **한국어**: 생산품, 제품, 생산제품
- **영문**: product, item_type, production

### item 컬럼
- **한국어**: 품목, 제품명, 아이템
- **영문**: item, product_name, material

### bags 컬럼
- **한국어**: 자루, 자루수, 개수
- **영문**: bags, quantity, count

### kg 컬럼
- **한국어**: Kg, 무게, 중량
- **영문**: kg, weight, mass

### memo 컬럼
- **한국어**: 비고, 메모, 특이사항
- **영문**: memo, note, remark

---

## C. 에러 코드 표

| 코드 | 설명 | 예시 |
|------|------|------|
| `missing_required` | 필수값 누락 | shift 컬럼이 빈값 |
| `bad_number` | 숫자 파싱 실패 | bags="abc" (숫자 아님) |
| `unknown_value` | 허용되지 않은 값 | shift="새벽" (허용값 아님) |
| `dup_key` | 중복키 | 동일 recordDate+shift+product+item |
| `invalid_format` | 포맷 오류 | 날짜 형식 오류 (추후) |

---

## D. Unique Key 초안 검증 (Phase5-1에서 확정)

### 현재 제안: recordDate + shift + product + item
- **장점**: 업무 의미 명확 (날짜별, 근무별, 생산품별, 품목별 유일)
- **단점**: 동일 근무/생산품/품목을 여러 번 생산 시 충돌
- **고려사항**: 실제 운영에서 "주간+분쇄품+PP"를 여러 라인에서 생산 가능?

### 대안 1: recordDate + shift + product + item + rowIndex
- **장점**: 충돌 없음 (rowIndex로 구분)
- **단점**: 업무 의미 약화 (rowIndex는 단순 순번)

### 대안 2: recordDate + shift + product + item + lineId
- **장점**: 라인별 구분 (여러 라인에서 동일 제품 생산 가능)
- **단점**: lineId 컬럼 추가 필요

### Phase5-1 결정 사항
- **초안 채택**: recordDate + shift + product + item (현재 제안)
- **검증 방법**: Phase5-1에서 실제 데이터 파싱 시 충돌 빈도 확인
- **유연성**: Phase5-2에서 Unique Key 변경 가능 (템플릿 버전 업그레이드)

---

## E. 템플릿 다운로드 (Phase5-1 이후 제공)

Phase5-1 완료 후 `public/templates/` 폴더에 엑셀 템플릿 파일 제공 예정:
- **파일명**: `production_lines_template_v1.0.xlsx`
- **포함 내용**:
  - 헤더 행 (shift, product, item, bags, kg, memo)
  - 예시 데이터 3행
  - 메타 시트 (TEMPLATE_VERSION=v1.0)

</details>

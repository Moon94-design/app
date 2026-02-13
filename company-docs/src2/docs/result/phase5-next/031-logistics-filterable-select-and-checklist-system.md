# 유통 선택 포함검색 + 체크리스트 체계 개편

> 작성일: 2026-02-13
> 주제: 유통 등록의 거래처/차량 선택 UX 개선(포함검색)과 체크리스트 운영 구조(원본/작성본 분리) 도입
> 해결 상태: Resolved

---

## 작업 배경
- 유통 등록에서 거래처/차량이 전체 목록 선택 방식이라 입력 속도가 느렸다.
- 단일 칸에서 타이핑하고 바로 하단 자동추천 목록을 선택하는 흐름이 필요했다.
- 동시에, 반복 리뉴얼에서 재작업을 줄이기 위해 BASIC 중심 체크리스트 체계를 확정하고 작성본 저장 폴더를 분리할 필요가 있었다.

## 변경 내용
- 선택 검색 공용 컴포넌트 추가
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx`
  - 단일 자동완성 입력 + 하단 목록 선택 구조 적용
  - 포함검색(대소문자 무시)으로 옵션 축소, 빈 입력 상태에서 목록 열기 시 전체 옵션 노출
  - 검색어는 저장하지 않고, 목록 선택 시에만 값 반영
- 유통 등록에 적용
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - 거래처/차량 선택을 `FilterableSelect`로 교체
- 체크리스트 구조 개편
  - BASIC 상단에 추가 체크리스트 목차/경로 고정
    - `src2/docs/rule/BASIC_EXECUTION_CHECKLIST.md`
  - 공용화 강제 문구 고정
    - "이번 작업 수정사항 중 공용화 가능한 항목은 원본 체크리스트에 즉시 반영하고, 반영 사실과 참조 경로를 채팅/결과 문서에 명시한다."
  - 작업별 원본 체크리스트 폴더 신설
    - `src2/docs/rule/checklist/README.md`
    - `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - 체크리스트 작성본 폴더 신설
    - `src2/docs/rule/checklist-result/README.md`
    - `src2/docs/rule/checklist-result/basic/2026-02-13-logistics-filter-select.md`
    - `src2/docs/rule/checklist-result/logistics-daily-renewal/2026-02-13-logistics-filter-select.md`
  - 페이지 리뉴얼 체크리스트 결과 저장 경로 규칙 갱신
    - `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- 문서 맵 반영
  - `src2/docs/reference/feature-files-map-unified.md`

## 검증
- `cmd /c npm run build` PASS

## 추가 반영 (2026-02-13, 동일 배치 후속)
- `FilterableSelect`를 2칸(입력+select) 구조에서 단일 자동완성 필드로 변경했다.
- 입력이 비어 있을 때 목록 열기 버튼으로 전체 옵션을 노출하고, 값 확정은 목록 선택으로만 처리한다.
- 체크리스트 원본에 "공용화 가능한 수정사항 즉시 승격" 고정 문구와 선택 UI 패턴 항목을 반영했다.
- 체크리스트 범위를 유통 전용에서 "모든 일일 페이지 공용"으로 승격했다.
  - 신규 SSOT: `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - 기존 유통 파일: deprecated 안내 문서로 전환
- 후속 검증:
  - `cmd /c npm run build` PASS

## 간단 의견 + 다음 진행 질문
- 이번 배치로 선택 UX 속도와 체크리스트 실행 일관성이 같이 올라갔다.
- 다음은 동일 `FilterableSelect`를 issue/action/office 등 다른 선택 UI에도 확장할지 결정하면 된다. 바로 확장할까?

## 핵심 로직 3줄
- 1) 단일 입력 필드에서 검색과 목록 선택을 처리하고, 값 확정은 목록 선택에서만 수행했다.
- 2) 필터 기준은 prefix가 아니라 includes(포함검색)로 고정했고, 빈 입력 시 전체 목록을 노출했다.
- 3) 체크리스트는 원본(`rule/checklist`)과 작성본(`rule/checklist-result`)을 분리해 반복 작업에서 재사용성을 높였다.

## 입문자 설명 3줄
- 1) 글자를 입력하면 목록이 줄어들지만, 저장은 목록에서 고른 값만 돼.
- 2) 그래서 오타로 새 값이 들어가거나 이상한 값이 저장되지 않아.
- 3) 체크리스트도 "규칙 문서"와 "이번 작업 체크 결과"를 따로 보관해서 다음 작업이 빨라져.

## 주의 사항
- `FilterableSelect`는 현재 유통 등록에만 적용됐다. 다른 페이지에 확장할 때 선택 id/label 매핑 규칙이 페이지별로 다르면 별도 어댑터가 필요할 수 있다.
- 체크리스트 결과 문서는 형식을 단순화했기 때문에, 장문 회고를 넣기 시작하면 다시 운영 부담이 커질 수 있다.

## 향후 과정
- 동일 선택 패턴이 있는 페이지(issue/action/office/production)의 select를 `FilterableSelect`로 단계적 교체한다.
- 체크리스트 신규 항목이 생기면 `BASIC_EXECUTION_CHECKLIST.md`의 "추가 작업 체크리스트 목차"에 경로를 즉시 추가한다.

## 해결 상태
- `Resolved`: 유통 등록 선택 포함검색 적용, 체크리스트 원본/작성본 분리 구조 도입, 문서 동기화 완료.

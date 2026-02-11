# 엑셀 2차 준비: kernel adapter/schema 골격 추가

> 작성일: 2026-02-10
> 주제: `/excel` 브리지 유지 상태에서 다중 포맷 통합 대비용 adapter/schema 엔트리 골격 추가

---

## 변경 요약
- `src2/kernel/adapters/excel` 공통 타입/소스별 엔트리를 추가했다.
- `src2/kernel/schema/excel` 통합 엔티티/소스 레코드/병합 정책 인터페이스를 추가했다.
- 현재 `/excel` 동작은 그대로 유지하고(legacy bridge), 확장 지점만 선반영했다.

## 코드 변경
- adapters:
  - `src2/kernel/adapters/excel/common/types.ts`
  - `src2/kernel/adapters/excel/common/createEmptyParseResult.ts`
  - `src2/kernel/adapters/excel/common/index.ts`
  - `src2/kernel/adapters/excel/kora/partner/index.ts`
  - `src2/kernel/adapters/excel/kora/weighing/index.ts`
  - `src2/kernel/adapters/excel/kora/vehicle/index.ts`
  - `src2/kernel/adapters/excel/kora/index.ts`
  - `src2/kernel/adapters/excel/index.ts`
  - `src2/kernel/adapters/index.ts` (excel export 추가)

- schema:
  - `src2/kernel/schema/excel/canonicalTypes.ts`
  - `src2/kernel/schema/excel/sourceTypes.ts`
  - `src2/kernel/schema/excel/mergePolicy.ts`
  - `src2/kernel/schema/excel/index.ts`
  - `src2/kernel/schema/index.ts` (excel export 추가)

- kernel barrel:
  - `src2/kernel/index.ts` (`adapters`, `schema` export 추가)

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-excel-import-hub-migration.md`
  - kernel adapter 자리 생성/설계 포인트 일부 체크 상태를 완료로 갱신

## 게이트 확인
- `npm.cmd run build` 성공
- smoke는 기존과 동일하게 환경 timeout 이슈가 있어 보류

다음 질문: 다음은 `kora partner/weighing/vehicle`에서 레거시 파서를 직접 이동하지 말고, src2 래퍼 함수에서 호출 규약만 먼저 맞추는 단계로 이어갈까?

## 핵심 로직 3줄
- 1) 엑셀 파싱 공통 계약(`ExcelParseResult`, `ExcelSourceMeta`, `ExcelNormalizedRecord`)을 kernel SSOT로 고정했다.
- 2) 소스별 엔트리(`parseKoraPartnerWorkbook` 등)를 만들되 아직 실제 파싱 로직 연결은 하지 않았다.
- 3) 통합 스키마(`canonicalId`, `sourceRowId`, `mergePolicy`)를 별도 모듈로 분리해 2차 병합 구현 진입점을 만들었다.

## 입문자 설명 3줄
- 1) 먼저 “데이터 모양(타입)”을 정해두면, 나중에 엑셀 종류가 늘어도 같은 규칙으로 처리할 수 있다.
- 2) 실제 기능을 바로 붙이지 않고 함수 자리만 먼저 만들면, 기존 기능을 안 깨고 확장 준비를 할 수 있다.
- 3) 병합 규칙 인터페이스를 미리 만들면, 나중에 값 충돌이 생겼을 때 한 곳에서 정책을 관리할 수 있다.

## 주의 사항
- 패턴 반복으로 엔트리 파일을 추가한 구간이라, 다음 단계에서 실제 파서 연결 시 import 경로 오타/누락 가능성이 있다.
- 현재 소스별 함수는 비어 있는 골격이므로, 실구현 이전에 호출 경로를 연결하면 빈 결과가 나올 수 있다.

## 향후 과정
- 다음 단계에서 `ExcelHubBridgeSection`이 새 adapter 래퍼를 선택적으로 호출하도록 연결하면, 레거시 파서를 단계적으로 분리할 수 있다.
- `mergePolicy` 구현이 시작되면 `schema/excel` 변경이 `/excel` 뿐 아니라 manage 조회 정책에도 영향을 줄 수 있으니, 영향 범위를 문서로 먼저 고정해야 한다.

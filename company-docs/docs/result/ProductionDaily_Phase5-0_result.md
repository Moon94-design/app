# ProductionDaily Phase5-0 — 엑셀 업로드 스펙 문서 확정 결과

**작업일**: 2026-02-06  
**작업자**: GitHub Copilot (Claude Sonnet 4.5)  
**CONTRACT 기준**: TL;DR 7줄 준수 — 기능 변경 0, 문서만 작성, 코딩 금지

---

## TL;DR (반드시 읽기)

1. **문서 2개 생성**: EXCEL_CONTRACT.md (정책), TEMPLATE_PRODUCTION_LINES.md (템플릿 스펙)
2. **고정 정책**: 업로드=All-or-Nothing, 충돌=Error, 버전=필수
3. **Phase5-1 준비 완료**: 파싱/검증 코드 작성 시 참조할 스펙 확정
4. **Unique Key**: recordDate + shift + product + item (초안, Phase5-1에서 검증)
5. **빌드 통과**: 246ms (환경 이상 없음)

---

## 1. 작업 요약 (Summary)

**목표**: 엑셀 업로드 전 "템플릿 규격 + Unique Key + 충돌정책" 문서 확정 (Phase5-1 재작업 최소화)

**작업 범위**:
- **문서 2개 생성**: 정책 계약서 + 템플릿 스펙
- **코딩 금지**: src/ 코드 수정/추가 없음
- **빌드 검증**: npm run build 1회 (환경 체크)

**Why**: Phase5-1 코딩 전에 정책/규격을 확정하여 구현 중 정책 변경으로 인한 재작업 방지

---

## 2. 생성/수정된 파일 목록

### 신규 생성 (3개)

#### 1. docs/excel/EXCEL_CONTRACT.md (정책 계약서)
- **내용**: 업로드 정책, 충돌 정책, 템플릿 버전, 감사 로그, Phase5-1 범위
- **길이**: 약 150 lines (TL;DR 포함, Appendix 접기)
- **핵심 결정**:
  - **업로드 정책**: Policy A (All-or-Nothing) — FAIL 1건이라도 전체 거부
  - **충돌 정책**: Error — 중복키 충돌 시 저장 거부
  - **버전 정책**: TEMPLATE_VERSION 필수, 불일치 시 경고/거부
  - **감사 로그**: 사용자/시각/파일명/버전/행수/OK/FAIL 카운트

#### 2. docs/excel/TEMPLATE_PRODUCTION_LINES.md (템플릿 스펙)
- **내용**: 시트명, 컬럼 스키마, 허용값, Unique Key, 검증 규칙
- **길이**: 약 200 lines (TL;DR 포함, Appendix 접기)
- **핵심 결정**:
  - **시트명**: LINES (없으면 첫 시트)
  - **필수 컬럼**: shift, product, item, bags (4개)
  - **선택 컬럼**: kg, memo (2개)
  - **허용값**: shift=주간/오후/야간, product=분쇄품/펠렛, item=PP/PE
  - **Unique Key**: recordDate + shift + product + item (초안)
  - **검증 규칙**: 필수값/타입/허용값/중복키 체크

#### 3. docs/result/ProductionDaily_Phase5-0_result.md (결과 문서, 본 파일)
- **내용**: 작업 요약, 고정 정책, 다음 단계, 의견/리스크
- **길이**: 약 150 lines (TL;DR 포함, Appendix 접기)

### 신규 폴더 생성
- **docs/excel/**: 엑셀 업로드 관련 문서 폴더

---

## 3. 고정된 정책 결론

### A. 업로드 정책
- **선택**: Policy A (All-or-Nothing) ✅
- **규칙**: FAIL 행이 1건이라도 있으면 전체 저장 거부
- **근거**: 데이터 일관성 보장, 부분 저장으로 인한 혼란 방지

### B. 충돌 정책
- **선택**: Error (충돌 시 저장 거부) ✅
- **규칙**: 중복키 충돌 시 전체 저장 거부, 사용자 확인 요청
- **근거**: 실수 방지, 사용자 의도 확인, 안전 우선

### C. 템플릿 버전 정책
- **필드**: TEMPLATE_VERSION (필수)
- **형식**: v1.0, v1.1 등 (시맨틱 버전)
- **처리**: 버전 불일치 시 경고 + 저장 거부

### D. Unique Key (초안)
- **구성**: recordDate + shift + product + item
- **검증**: Phase5-1에서 실제 데이터로 충돌 빈도 확인
- **유연성**: Phase5-2에서 변경 가능 (템플릿 버전 업그레이드)

---

## 4. Phase5-1에서 코딩할 항목

### ✅ 구현 예정 (Phase5-1)
1. **파싱**: 엑셀 파일 → JSON 파싱 (SheetJS 라이브러리)
2. **검증**: 필수값/타입/허용값/중복키 검증 로직
3. **미리보기**: 검증 결과 UI 표시 (OK/FAIL/WARN 행별 표시)

### ❌ 보류 (Phase5-2 이후)
1. **저장 반영**: DB merge 로직 (Policy A 적용)
2. **서버 제공통제**: 권한별 업로드 허용
3. **RBAC**: 역할별 접근 제어
4. **보고서**: 업로드 이력 조회/통계

---

## 5. 빌드 결과

### npm run build
```bash
> company-docs@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 92 modules transformed.
dist/index.html                 0.45 kB │ gzip:   0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip:   1.59 kB
dist/assets/index-DRvpudQK.js   418.25 kB │ gzip: 108.61 kB
✓ built in 246ms
```

**결과**: ✅ **PASS** (246ms)
- TypeScript 컴파일 통과
- 환경 이상 없음

---

<details>
<summary>Appendix (세부/긴 내용 접기)</summary>

## A. 문서 작성 중 의견/리스크

### 의견 1: Policy A vs. Policy B
- **Policy A (채택)**: 데이터 일관성 우선, 사용자 확인 필수
- **Policy B (보류)**: 부분 저장 허용 시 운영 혼란 가능
- **결론**: 초기 정책은 보수적으로 시작, 추후 옵션 추가 가능

### 의견 2: Unique Key 구성
- **현재 제안**: recordDate + shift + product + item
- **리스크**: 동일 근무/생산품/품목을 여러 라인에서 생산 시 충돌 가능
- **대안**: rowIndex 또는 lineId 추가 (Phase5-1 검증 후 결정)

### 의견 3: 템플릿 버전 관리
- **현재 제안**: TEMPLATE_VERSION 필드 필수, 불일치 시 거부
- **리스크**: 초기 버전(v1.0)만 있으므로 버전 체계 미검증
- **대안**: Phase5-2에서 버전 업그레이드 시나리오 테스트

### 의견 4: Alias 매핑
- **현재 제안**: 한국어/영문 alias 허용 (예: shift = 근무 = workshift)
- **리스크**: alias 목록이 많아지면 매핑 복잡도 증가
- **대안**: Phase5-1에서 alias 최소화, 필요 시 확장

---

## B. 아직 미확정인 항목

### 1. Unique Key 최종 확정 (우선순위: 높음)
- **현재 상태**: recordDate + shift + product + item (초안)
- **미확정 사항**: 실제 운영에서 충돌 가능성 미검증
- **확정 시점**: Phase5-1 파싱 후 실제 데이터로 검증

### 2. Alias 최종 목록 (우선순위: 중간)
- **현재 상태**: 한국어/영문 alias 목록 초안 작성
- **미확정 사항**: 실제 사용자가 어떤 alias를 쓸지 미검증
- **확정 시점**: Phase5-1 구현 중 최소 alias로 시작, 필요 시 확장

### 3. 저장 반영 로직 (우선순위: 낮음, 보류)
- **현재 상태**: Policy A (All-or-Nothing) 확정
- **미확정 사항**: DB merge 로직 구현 방법
- **확정 시점**: Phase5-2 (저장 반영 단계)

### 4. 감사 로그 상세 (우선순위: 낮음)
- **현재 상태**: 최소 기록 항목 확정 (사용자/시각/파일명/버전/행수)
- **미확정 사항**: 파일 해시, 상세 에러 로그 기록 여부
- **확정 시점**: Phase5-2 이후 (운영 경험 축적 후)

### 5. 템플릿 다운로드 제공 (우선순위: 중간)
- **현재 상태**: Phase5-1 이후 제공 예정
- **미확정 사항**: 템플릿 파일 위치 (public/templates/)
- **확정 시점**: Phase5-1 완료 후

---

## C. Phase5-1 코딩 시 주의사항

### 1. 정책 변경 금지
- Phase5-0에서 확정한 정책(Policy A, Error, 버전 필수)은 Phase5-1에서 변경 금지
- 정책 변경 시 문서 먼저 수정 후 코드 반영

### 2. Unique Key 검증 필수
- Phase5-1에서 실제 데이터 파싱 후 Unique Key 충돌 빈도 확인
- 충돌 빈도가 높으면 Phase5-0 문서 수정 후 Phase5-1 재작업

### 3. 단계별 빌드 게이트
- 파싱 → 검증 → 미리보기 각 단계마다 npm run build 통과
- 기능 변경 0 원칙 (새 기능 추가만, 기존 기능 변경 금지)

### 4. 테스트 데이터 준비
- 정상 데이터 (OK)
- 필수값 누락 (FAIL)
- 타입 오류 (FAIL)
- 허용값 불일치 (FAIL)
- 중복키 (엑셀 내부 + DB 충돌)

---

## D. Phase5-1 이후 작업 흐름 예상

### Phase5-1: 파싱/검증/미리보기 (코딩)
- 엑셀 파일 업로드 UI
- SheetJS로 파싱
- 검증 규칙 구현 (필수값/타입/허용값/중복키)
- 검증 결과 미리보기 (테이블 UI)
- npm run build 통과

### Phase5-2: 저장 반영 (코딩)
- Policy A (All-or-Nothing) 구현
- DB merge 로직
- 감사 로그 기록
- npm run build 통과

### Phase5-3: 운영 개선 (선택)
- Policy B (Partial Save) 옵션 추가
- Upsert 정책 옵션 추가
- 템플릿 다운로드 제공
- 업로드 이력 조회

---

## E. 작업형 AI 의견

### 장점
- **정책 확정**: Phase5-1 코딩 전 정책/규격 확정으로 재작업 최소화
- **단계 분리**: Phase5-0 (문서) → Phase5-1 (파싱/검증) → Phase5-2 (저장) 명확 분리
- **문서 접기**: Appendix 접기로 문서 길이 관리, TL;DR 중심

### 리스크
- **Unique Key 미검증**: recordDate + shift + product + item 초안, 실제 데이터로 검증 필요
- **Alias 확장성**: 한국어/영문 alias 목록이 많아지면 매핑 복잡도 증가
- **정책 변경 비용**: Policy A → Policy B 변경 시 코드 수정 범위 검토 필요

### 다음 단계 권장
1. Phase5-1 시작 전 현재 문서(EXCEL_CONTRACT, TEMPLATE_PRODUCTION_LINES) 재확인
2. Phase5-1 코딩 중 Unique Key 충돌 빈도 모니터링
3. Phase5-1 완료 후 템플릿 다운로드 파일 제공

</details>

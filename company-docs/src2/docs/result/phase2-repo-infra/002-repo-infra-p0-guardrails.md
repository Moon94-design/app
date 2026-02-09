# repo 인프라 P0 가드레일 보강

> 작성일: 2026-02-09
> 주제: impl 노출 차단 및 node 테스트 대비 저장소 fallback 추가

---

## 작업 요약
- repo 배럴(index.ts)에서 impl/export 경로 제거(도메인 repo만 노출)
- jsonStorage에 메모리 fallback 추가(localStorage 미존재 환경 대응)

## 변경 파일
- src2/kernel/repo/storage/jsonStorage.ts
- src2/kernel/repo/index.ts

## 체크리스트 대응
- 7) index.ts export 통제 강화(impl 직접 사용 경로 차단)
- 2) localStorage 직접 접근을 jsonStorage로만 제한 유지

## 비고
- node 환경에서도 domain repo 테스트가 가능하도록 기본 저장소 fallback 제공

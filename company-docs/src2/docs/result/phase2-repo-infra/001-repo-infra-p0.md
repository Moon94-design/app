# repo 인프라 P0 시작

> 작성일: 2026-02-09
> 주제: keys/jsonStorage/types/localRepo/domainRepo 기본 골격 생성

---

## 작업 요약
- keys.ts에 storage key SSOT 정의
- jsonStorage adapter 추가(localStorage 직접 접근 금지 준수)
- RepoContract/DocRepoContract 정의
- localRepo/serverRepo 기본 골격 구현
- domain repo(daily/partner)에서 impl 직접 사용 금지 규칙 준수

## 변경 파일
- src2/kernel/repo/keys.ts
- src2/kernel/repo/types.ts
- src2/kernel/repo/storage/jsonStorage.ts
- src2/kernel/repo/impl/localRepo.ts
- src2/kernel/repo/impl/serverRepo.ts
- src2/kernel/repo/domain/partnerRepo.ts
- src2/kernel/repo/domain/dailyRepo.ts
- src2/kernel/repo/index.ts
- src2/docs/rule/MIGRATION_STATUS.md

## 게이트
- G2 진행 중(체크리스트 일부 완료, UI 연결/검증은 미수행)

## 비고
- kernel에서 @legacy import 0 유지
- UI는 domain repo만 사용

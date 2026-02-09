# Phase 5 파트너 관리 이관 (Step 1)

> 작성일: 2026-02-09
> 주제: /manage/master 이관 시작 및 보류 해제 동작 추가

---

- /manage/master를 src2 ManageMasterPage로 전환하고 Partner 관리 페이지를 src2로 분리.
- Partner 관리에서 보류/보류 해제 동작을 추가하고 완료 판정은 shared helper로 정리.
- 완료/미완료 판정은 kernel/schema/partner helper로 공통화.

다음으로 검색(거래처명)과 공통 분리, 이후 일괄 수정/되돌리기를 순차 적용할 계획.
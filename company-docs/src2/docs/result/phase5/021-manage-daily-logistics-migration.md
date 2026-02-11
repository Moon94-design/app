# 일일기록 관리 logistics 상세 이관 (/manage/daily)

> 작성일: 2026-02-10
> 주제: Manage daily logistics 상세를 legacy bridge에서 src2 + @kernel 기반으로 전환

---

## 변경 요약
- `ManageDailyPage`의 logistics 상세를 `@legacy` 의존 없이 `src2` 페이지로 교체.
- logistics 상세를 hooks/sections로 분리해 수정 가능 구조로 재구성.
- `kernel/schema/daily` 최소 정본과 `weighingRepo`를 추가해 repo 경유 데이터 흐름으로 정리.

## 코드 변경
- pages:
  - `src2/app/pages/manage/ManageLogisticsPage.tsx` (신규)
  - `src2/app/pages/manage/hooks/useManageLogisticsPage.ts` (신규)
  - `src2/app/pages/manage/sections/ManageLogisticsListSection.tsx` (신규)
  - `src2/app/pages/manage/sections/ManageLogisticsEditFormSection.tsx` (신규)
  - `src2/app/pages/manage/ManageDailyPage.tsx`
    - legacy `LogisticsManage` import 제거
    - `ManageLogisticsPage` 연결

- kernel schema:
  - `src2/kernel/schema/daily/_common.ts` (신규)
  - `src2/kernel/schema/daily/logisticsTypes.ts` (신규)
  - `src2/kernel/schema/daily/logisticsHelpers.ts` (신규)
  - `src2/kernel/schema/daily/index.ts` (신규)
  - `src2/kernel/schema/index.ts` (daily export 추가)

- kernel repo:
  - `src2/kernel/repo/domain/weighingRepo.ts` (신규)
  - `src2/kernel/repo/keys.ts` (`weighing_transactions_v1` 호환 key 추가)
  - `src2/kernel/repo/index.ts` (weighingRepo export 추가)

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-daily-logistics.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/daily` 메모를 legacy bridge 제거 기준으로 갱신
- `src2/docs/rule/DECISIONS_LOG.md`
  - 계량 key 호환 결정(임시) 추가

## 동작/검증
- 초기 로드 시:
  - `repo:daily`에 logistics 레코드가 있으면 그대로 사용
  - 없으면 `weighing_transactions_v1`를 변환해 시드 후 사용
- 수정 저장 시 `repo:daily`로 반영
- 게이트:
  - `npm run build` 성공

## 후속 보완(안정성)
- daily 스키마 중복 점검:
  - `src2/kernel/schema/daily/*` 외 중복 daily 공통 파일 없음 확인.
- 시드 idempotency 강화:
  - 시드 메타 ID(`seed:manage:daily:logistics:from-weighing:v1`)를 `repo:daily`에 기록.
  - logistics 데이터가 없더라도 시드 메타가 있으면 재시드하지 않도록 강제.
- 레거시 key 명시 강화:
  - `STORAGE_KEYS.weighingTransactionsLegacyV1 = "weighing_transactions_v1"`로 명명해 임시 호환 의도를 코드에 드러냄.
- 상태 표기 점검:
  - `/manage/daily`는 SHADOW 유지 + "logistics 완료, 나머지 후속" 메모 유지.

## 후속
- `/manage/daily`의 생산/이슈·조치 상세 이관
- `/register/daily/*` src2 이관 시 daily schema/repo 재사용 확장

다음 질문: 같은 패턴으로 `/manage/master`의 vehicle legacy 의존 제거까지 이어갈까?

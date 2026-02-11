# 관리 셸 페이지 이관 (/manage, /manage/daily)

> 작성일: 2026-02-10
> 주제: Manage 영역에서 셸 라우트 우선 이관 (상세 도메인 이관은 후속 분리)

---

## 변경 요약
- `/manage`, `/manage/daily` loader를 `@legacy`에서 `@app2`로 전환.
- src2 관리 셸 페이지를 생성해 라우팅 기준을 src2로 맞춤.
- `manage/daily`의 logistics 상세는 현재 legacy bridge로 유지해 동작을 보존.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/manage` -> `@app2/pages/manage/ManageHomePage`
    - `/manage/daily` -> `@app2/pages/manage/ManageDailyPage`

- pages:
  - `src2/app/pages/manage/ManageHomePage.tsx` (신규)
  - `src2/app/pages/manage/ManageDailyPage.tsx` (신규)
    - `logistics` 상세는 `@legacy/app/pages/manage/daily/LogisticsManage` 브리지 사용

## 문서 변경
- `src2/docs/rule/MIGRATION_STATUS.md`
  - Manage 3개 항목 경로를 실제 loader 기준으로 갱신.
  - 현재 상태는 SHADOW 유지(셸 이관 완료, 상세 이관 필요).
- `src2/docs/roadmap/phase5/work-order-manage-daily-shell.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.

## 다음 단계
- `/manage/master` 상세(특히 vehicle legacy 의존) 제거
- `/manage/daily` logistics 상세를 src2 + @kernel(repo/schema)로 재작성

다음 질문: 바로 `/manage/daily` logistics 상세를 src2 구조로 분해 이관할까?

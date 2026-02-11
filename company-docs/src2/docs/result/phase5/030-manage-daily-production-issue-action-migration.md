# 관리 일일기록 상세 이관 (/manage/daily 생산/이슈/조치)

> 작성일: 2026-02-10
> 주제: manage/daily 남은 상세(생산/이슈/조치) src2 이관 + legacy 1회 마이그레이션

---

## 변경 요약
- `/manage/daily`에 `생산`, `이슈`, `조치` 상세 라우트를 src2 페이지로 추가했다.
- legacy 저장소(`daily_production_v1`, `issue_docs_v1`, `local_action_docs_v1`)를 `repo:*`로 1회 이관하는 가드레일을 추가했다.
- `browse` 영역은 요청대로 이번 턴에서 변경하지 않고 참조용으로 유지했다.

## 코드 변경
- nav/menu
  - `src2/app/nav/navConfig.ts`
    - `/manage/daily/production`, `/manage/daily/issue`, `/manage/daily/action` loader 추가
  - `src2/app/pages/manage/ManageDailyPage.tsx`
    - 생산/이슈/조치 카드 활성화

- manage pages
  - `src2/app/pages/manage/ManageProductionPage.tsx` (신규)
  - `src2/app/pages/manage/ManageIssuePage.tsx` (신규)
  - `src2/app/pages/manage/ManageActionPage.tsx` (신규)

- manage hooks
  - `src2/app/pages/manage/hooks/useManageProductionPage.ts` (신규)
  - `src2/app/pages/manage/hooks/useManageIssuePage.ts` (신규)
  - `src2/app/pages/manage/hooks/useManageActionPage.ts` (신규)

- kernel repo
  - `src2/kernel/repo/domain/issueRepo.ts` (신규)
  - `src2/kernel/repo/domain/actionRepo.ts` (신규)
  - `src2/kernel/repo/index.ts` (export 추가)
  - `src2/kernel/repo/keys.ts` (legacy/migrated meta key 추가)

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-manage-daily-production-issue-action.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/manage/daily` 상태를 `MIGRATED`로 갱신

## 게이트 확인
- `npm run lint:src2` 성공
- `npm run build` 성공

## 핵심 로직 3줄
- `issueRepo/actionRepo`에서 `ensureMigrated()`를 두고, `repo:*`가 비어 있을 때만 legacy key 데이터를 1회 이관한다.
- `useManageProductionPage`는 `repo:daily`에서 `kind === "production"`만 관리하고, 최초 1회에만 `daily_production_v1`를 흡수한다.
- `ManageDailyPage`와 `navConfig`를 함께 갱신해 메뉴와 실제 라우트가 항상 같은 상태를 보장한다.

## 입문자 설명 3줄
- 예전 데이터(localStorage)를 새 저장소로 옮길 때는 “한 번만” 실행되게 해야 중복 복사가 안 생긴다.
- 관리 화면은 저장 구조를 직접 만지지 않고, `repo`를 통해 읽고/삭제하도록 만들면 나중에 서버로 바꾸기 쉽다.
- 메뉴에서 버튼이 보이는데 라우트가 없으면 오류가 나므로, 메뉴 추가와 라우트 추가는 항상 세트로 해야 한다.

## 주의 사항
- AI가 패턴 반복으로 유사 페이지를 빠르게 생성했기 때문에, production/issue/action 문서 “삭제 단위(문서 단위)”가 운영 기대와 맞는지 수동 확인이 필요하다.
- legacy -> repo 이관은 안전장치를 넣었지만, 필드 누락/형식 불일치가 있는 예외 데이터가 있으면 일부 항목이 축약될 수 있다.

## 향후 과정
- 다음 작업에서 서버 이관을 시작하면 `issueRepo/actionRepo/dailyRepo` 경로를 그대로 server impl로 갈아끼울 수 있다.
- 이 SSOT(repo key + migrate meta)를 수정하면 manage/daily 4개 상세(유통/생산/이슈/조치)에 동시에 영향이 가므로 변경 전 체크리스트 검증이 필요하다.
- `browse`는 참조용 유지 상태이므로, 추후 조회 리뉴얼 단계에서만 별도 작업으로 분리해 진행한다.

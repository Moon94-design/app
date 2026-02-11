# 일일기록 이슈 페이지 이관 (/register/daily/issue)

> 작성일: 2026-02-10
> 주제: register daily issue를 legacy에서 src2로 전환하고 repo/draft 기반 저장으로 고정

---

## 변경 요약
- `/register/daily/issue` loader를 `@legacy`에서 `@app2`로 교체했다.
- src2 이슈 등록 페이지를 신규 생성하고, draft + repo 저장/문서 삭제 흐름을 붙였다.
- manage와 저장 경로를 맞추기 위해 `createIssueRepo` 타입에 `writerRole`을 보강했다.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/daily/issue` -> `@app2/pages/register/RegisterIssuePage`

- register page/hook:
  - `src2/app/pages/register/RegisterIssuePage.tsx` (신규)
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts` (신규)
    - 기록일/작성자/직책/분류/상태/제목/상세 입력
    - draft 저장/초기화
    - `createIssueRepo`를 통한 문서 upsert/삭제

- kernel:
  - `src2/kernel/draft/draftKeys.ts`
    - `issueRegister: "draft:daily:issue:register"` 추가
  - `src2/kernel/repo/domain/issueRepo.ts`
    - `IssueDocRecord`에 `writerRole?: string` 추가
    - legacy normalize 시 writerRole 복원 보강

## 문서 변경
- `src2/docs/roadmap/phase5/work-order-register-daily-issue.md` 신규 작성
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/daily/issue`를 `MIGRATED`로 갱신

## 게이트 확인
- `npm run lint:src2` 성공
- `npm run build` 성공

## 핵심 로직 3줄
- 이슈 등록 저장은 `recordDate + writerName` 기반 문서 id(`ISSUE_...`)로 묶어 같은 작성자/날짜 문서에 항목을 누적한다.
- 작성 화면 draft는 `DRAFT_KEYS.issueRegister`로 관리해 입력 중단 후 재진입에도 복원된다.
- nav loader를 src2로 교체해 `/register/daily/issue` 진입 시 더 이상 legacy 페이지를 타지 않는다.

## 입문자 설명 3줄
- 문서를 “날짜+작성자” 단위로 묶으면, 같은 날 같은 사람이 쓴 이슈를 한 곳에서 관리하기 쉽다.
- draft를 쓰면 저장 버튼을 누르기 전이라도 입력값이 임시 저장되어 날아가지 않는다.
- 라우터 loader를 바꾸는 방식은 URL은 그대로 두고 내부 구현만 새 페이지로 갈아끼우는 안전한 이관 방법이다.

## 주의 사항
- AI가 빠르게 최소 폼 구조로 이관했기 때문에, legacy의 복잡한 이슈 세부 필드(품질/설비/안전 상세 항목)가 현재 페이지에 1:1 반영되진 않았다.
- 문서 삭제는 문서 단위이므로 항목 단위 삭제 UX가 필요하면 별도 섹션/액션 추가가 필요하다.

## 향후 과정
- 다음 단계는 `/register/daily/action`을 동일 패턴으로 src2 이관해 issue/action 저장 경로를 완전히 맞춘다.
- 이후 `/register/daily/production`까지 완료하면 register-daily 핵심 3축(생산/이슈/조치)이 repo 기반으로 통일된다.
- 이슈 세부 도메인 필드 확장은 `useRegisterIssuePage.ts`와 `IssueItemRecord`를 같이 확장해야 manage 조회와 정합성이 유지된다.

다음 질문: 바로 `/register/daily/action` 이관으로 이어갈까?

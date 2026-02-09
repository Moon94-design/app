# 기준등록 중개업체 페이지 이관 (/register/master/agency)

> 작성일: 2026-02-09
> 주제: Factory 방식으로 기준등록 agency 페이지를 src2로 이관 + 가드레일 문서 보강

---

## 변경 요약
- `/register/master/agency` loader를 `@legacy` -> `@app2`로 교체.
- 페이지를 얇은 조립 구조로 만들고 폼/연락처/목록을 sections로 분리.
- agency 도메인 정본 세트(schema/repo/draft key)를 kernel에 추가.
- `@kernel/utils` 사용 강제와 key 네이밍 장기 계획을 문서에 명시.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/agency` -> `@app2/pages/agency/AgencyRegisterPage`

- page:
  - `src2/app/pages/agency/AgencyRegisterPage.tsx`
  - `src2/app/pages/agency/hooks/useAgencyRegisterPage.ts`
  - `src2/app/pages/agency/sections/AgencyFormSection.tsx`
  - `src2/app/pages/agency/sections/AgencyContactsSection.tsx`
  - `src2/app/pages/agency/sections/AgencyRecentList.tsx`

- kernel:
  - `src2/kernel/schema/agency/agencyTypes.ts`
  - `src2/kernel/schema/agency/index.ts`
  - `src2/kernel/schema/index.ts` (agency export 추가)
  - `src2/kernel/repo/domain/agencyRepo.ts`
  - `src2/kernel/repo/keys.ts` (`agency: local_agencies_v1` 추가, 레거시 키 호환 유지)
  - `src2/kernel/repo/index.ts` (agency repo export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`agencyRegister: draft:agency:register` 추가)

## 문서 보강
- `src2/docs/roadmap/phase5/factory-process-checklist.md`
  - 공용 유틸은 `@kernel/utils` 경유만 허용, `src/base/utils/*` 직접 import 금지 명시.
- `src2/docs/rule/DECISIONS_LOG.md`
  - local_* key는 Phase 5 동안 호환 유지 후 repo:* 일괄 이관 결정 추가.

## 문서/상태 갱신
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/agency` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-agency.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- URL 직접입력/재요청(새로고침 대체) 200 확인:
  - `/register/master/agency`

다음 질문: 기준등록 다음 타깃을 `/register/master/employee`로 이어갈까?

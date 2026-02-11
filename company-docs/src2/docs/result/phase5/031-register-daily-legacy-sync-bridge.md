# register/daily 레거시-관리 동기화 브리지 보강

> 작성일: 2026-02-10
> 주제: register/daily가 legacy인 상태에서 manage/daily 데이터 반영 지연 해소

---

## 변경 요약
- `issueRepo`, `actionRepo`의 legacy 이관 방식을 "1회 only"에서 "지속 동기화"로 전환했다.
- `ManageProduction`도 동일하게 legacy(`daily_production_v1`) 최신값을 주기적으로 repo에 반영하도록 보강했다.
- 목표: register/daily에서 저장한 데이터가 manage/daily에서 즉시 보이도록 데이터 단절을 닫음.

## 코드 변경
- `src2/kernel/repo/domain/issueRepo.ts`
  - `ensureMigrated()` -> `syncLegacy()`로 전환
  - legacy 문서를 매 접근 시 비교해 `updatedAt`이 더 최신이면 `repo:issue`에 upsert

- `src2/kernel/repo/domain/actionRepo.ts`
  - `ensureMigrated()` -> `syncLegacy()`로 전환
  - legacy 문서를 매 접근 시 비교해 `updatedAt`이 더 최신이면 `repo:action`에 upsert

- `src2/app/pages/manage/hooks/useManageProductionPage.ts`
  - `syncLegacyProduction()` 추가
  - `refresh()` 직전 legacy `daily_production_v1`를 읽어 `repo:daily(kind=production)`와 최신값 비교/반영

## 문서 변경
- `src2/docs/rule/DECISIONS_LOG.md`
  - register/daily legacy 유지 기간 동안 manage/daily 지속 동기화 브리지 사용 결정 추가

## 게이트 확인
- `npm run lint:src2` 성공
- `npm run build` 성공

## 핵심 로직 3줄
- issue/action repo는 legacy 문서를 매번 읽고, 동일 id의 `updatedAt` 비교로 더 최신 데이터만 repo에 반영한다.
- manage production은 `refresh()` 전에 legacy 생산문서를 먼저 동기화한 뒤 목록을 읽어 화면에 출력한다.
- 이렇게 해서 register가 아직 legacy여도 manage에서 데이터 최신성을 유지한다.

## 입문자 설명 3줄
- 예전 저장소와 새 저장소를 같이 쓸 때는 "한 번 복사"만 하면 금방 데이터가 어긋난다.
- 그래서 화면을 열 때마다 예전 데이터와 새 데이터를 비교해서 더 최신 것만 덮어쓰게 만들었다.
- 이 방식은 register를 완전히 새 구조로 바꾸기 전까지 임시 다리(브리지) 역할을 한다.

## 주의 사항
- AI가 패턴 기반으로 동기화 로직을 반복 적용했기 때문에, `updatedAt`이 비정상인 legacy 레코드가 있으면 예상과 다른 우선순위가 생길 수 있다.
- 문서 단위 삭제 후 register에서 같은 id를 다시 저장하는 경계 케이스는 수동 시나리오 테스트가 필요하다.

## 향후 과정
- 다음 단계는 `register/daily/production|issue|action`을 src2 페이지로 이관해 저장소를 repo 단일화한다.
- repo 단일화가 끝나면 이번 브리지(syncLegacy)는 제거 대상이며, 제거 시 `issueRepo/actionRepo/useManageProductionPage` 3지점을 같이 정리해야 한다.
- 수동 검증은 "register 저장 -> manage 즉시 조회" 시나리오를 production/issue/action 각각 1회 이상 확인한다.

다음 질문: 바로 `register/daily/issue`부터 src2 이관 시작할까, `production`부터 먼저 맞출까?

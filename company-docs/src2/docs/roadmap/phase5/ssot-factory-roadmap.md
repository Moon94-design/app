# Phase 5.5 로드맵 (SSOT 공통섹션 공장)

작성일: 2026-02-10
범위: 기준등록/관리/일지에서 재사용할 공통 폼 섹션 SSOT 고정
전제: 기준등록 마스터 이관(partner~consumable) 완료 상태
상태: 진행 예정

================================================================================
목표
- 기준등록(Register)과 관리(Manage)가 같은 폼 조각을 사용하도록 구조를 고정한다.
- "지금 UI 완성"이 아니라 "나중에 1회 수정"이 가능하도록 공통화한다.
- 페이지 전용 섹션과 공통 섹션의 경계를 문서/코드로 명확히 고정한다.

================================================================================
핵심 선언
- Phase 5.5는 공통 섹션만 다룬다. nav loader 교체/페이지 신규 이관은 하지 않는다(필요 시 별도 작업).
- 공통화 우선순위는 `Header -> Profiles -> Contacts -> Status -> Recent` 순서로 고정한다.
- 공통 UI는 `src2/kernel/components/**`, 도메인 규칙은 `src2/kernel/schema/<domain>/**`로만 둔다.
- 페이지 전용 조각은 `src2/app/pages/<domain>/sections/**`에 남긴다.
- `kernel/components`는 가능한 한 도메인 helper를 직접 import하지 않는다. 규칙 결합은 props 주입 또는 domain adapter(페이지/훅)에서 처리한다.
- `kernel/components` 승격 기준은 기본적으로 2도메인 재사용이다.
- 예외(인프라/완전 범용/근거 있는 즉시 재사용 예정)는 1도메인도 허용하되, DECISIONS_LOG에 이유/종료조건을 기록한다.

================================================================================
공통 SSOT 대상(1차)
1) MasterFormHeader
- 역할: 모드(create/edit), 저장/초기화 버튼, 상태 배지 슬롯 통일
- 위치: `src2/kernel/components/master/MasterFormHeader.tsx`

2) ProfilesEditor + profile helper
- 역할: 프로필 CRUD + 중복 제거 정책(dedupe/merge)
- 위치: `src2/kernel/components/profiles/ProfilesEditor.tsx`
- 규칙: `src2/kernel/schema/partner`에 dedupe/merge helper 고정

3) ContactsEditor
- 역할: 연락처 항목 추가/삭제/수정 + normalize
- 위치: `src2/kernel/components/contacts/ContactsEditor.tsx`

4) Status helper + StatusBadge
- 역할: 완료/미완료/보류 규칙 SSOT + 표시 분리
- 위치: helper=`src2/kernel/schema/<domain>/status.ts`, badge=`src2/kernel/components/status/StatusBadge.tsx`

5) BaseRecentList + domain adapter
- 역할: 최근 목록 렌더 패턴 통일
- 위치: `src2/kernel/components/recent/BaseRecentList.tsx`

================================================================================
적용 순서(권장)
1) Partner에 SSOT 1차 적용 (기준 도메인)
2) Vendor에 같은 섹션 재사용 연결
3) Agency/Employee/Vehicle/Consumable 순차 확장
4) Manage 편집 패널을 같은 섹션으로 연결
5) Daily 신규 페이지에서 필요한 섹션만 선택 재사용

================================================================================
완료 정의 (DoD)
- 공통 섹션은 kernel에 존재하고, 최소 2개 도메인에서 재사용된다.
- 재사용 확인은 `grep`으로 `<ComponentName>` import가 서로 다른 2개 도메인 페이지에 존재함을 검증한다.
- 페이지 파일은 조립 책임만 갖고, 공통 섹션 로직 중복이 없다.
- 완료판정 규칙이 helper 1곳에서 관리된다.
- `npm run build` 성공 + 대표 경로 URL 직접 진입/새로고침 통과.
- MIGRATION_STATUS/result 문서에 공통화 이력이 남아 있다.

================================================================================
리스크/주의
- 공통화를 한 번에 넓히면 속도가 급감하므로 1차 범위를 고정한다.
- RecentList는 완전 통합보다 adapter 패턴으로 시작한다.
- UI 외형 개선은 공통화 이후 별도 작업으로 분리한다.

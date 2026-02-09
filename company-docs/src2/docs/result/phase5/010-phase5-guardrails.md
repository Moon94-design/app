# Phase 5 가드레일 추가

> 작성일: 2026-02-09
> 주제: Partner Manage 이관 중 재작업 방지 규칙 고정

---

- Step 1에서 G4-lite 통과 전 기능 확장 금지.
- 일괄 수정은 upsertMany 1회 배치 저장으로 고정.
- 되돌리기 스냅샷은 최신 1개 유지 + keys.ts SSOT 사용.
- 완료/보류 판정은 kernel/schema/partner helper로 통일.
- 레거시(src) 수정 금지(예외는 DECISIONS_LOG 기록 후 1회).
- 공통화는 Step 3에서만 진행.

## G4-lite 확인
- npm run build 성공.
- npm run dev 기동(로컬 5174 응답 확인).

## Step 2 진행
- 거래처명 검색 입력 추가(파트너 관리 페이지 내 필터링).

## Step 3 진행
- 일괄 수정(체크/배치 적용)과 되돌리기(스냅샷) UI/로직 추가.
- 스냅샷은 keys.ts SSOT 키 사용 + 최신 1개 덮어쓰기 정책.
- 일괄 수정 대상에서 거래처 메모/담당자 메모 제외(중요도/관계현황/프로필만).

## 파일 규모 점검
- PartnerManagePage.tsx: 609 lines (가이드의 350~500 기준 초과).
- 다음 단계에서 섹션/일괄수정 UI를 분리해 파일 크기를 줄이는 것을 고려.

## 분리 계획 문서
- PartnerManage 분리 대상/현황 문서 추가.
## 분리 가이드 보강
- PartnerManagePage 최종 책임/벌크 훅 API 예시 추가.
- 기능 파일 현황 문서 분리 및 (EXIST)/(PLANNED) 표기 추가.

## 분리 작업 시작
- PartnerManagePage 분리: toolbar/list/bulk panel/hook 생성 및 조립.
- 기능 파일 현황 문서 위치를 reference로 이동.

## 런타임 오류 수정
- PartnerManagePage에서 status helper 누락으로 발생한 `isCompleted` 오류를 복구.

## 분리 후 확인
- /manage/master에서 콘솔 에러 없이 동작 확인.

다음으로 /manage/master 직접 입력/새로고침, Router 중복 경고 0개 여부를 확인할까?
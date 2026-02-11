# 공장 방식 첫 대상 페이지 작업 순서표 (템플릿)

작성일: 2026-02-09
목적: 다음 이관 대상 페이지를 공정으로 실행할 때 그대로 복사해서 쓰는 템플릿

================================================================================
대상 페이지
- 라우트: [여기에 1개만]
- 도메인: [partner/daily/...]
- 목표 상태: MIGRATED (src2 페이지, @legacy 0, @kernel only)

================================================================================
작업 순서(체크박스)
- [ ] 0) 범위 고정: 대상 페이지 1개만 (다른 페이지/기능 추가 금지)
- [ ] 0.1) 선조치 체크(roadmap.md 선조치 4항목) 수행
- [ ] 0.2) manage 안내 규칙 확인(엑셀 일괄등록 신규 구현 금지)
- [ ] 1) `src2/app/pages/<domain>/<Page>.tsx` 생성 (페이지는 얇게)
- [ ] 2) sections 분리
- [ ] Toolbar
- [ ] List/Table
- [ ] Detail/Editor(있으면)
- [ ] 3) hooks/state 분리(필요 시)
- [ ] `use<Domain><Page>.ts`
- [ ] 4) kernel 연결
- [ ] schema helper 사용(완료/보류/정규화 등)
- [ ] domain repo 사용(getAll/getById/upsertMany 등)
- [ ] draft 사용(필요 시) + resetDraft 규칙 적용
- [ ] 키 하드코딩 0(`keys.ts`만)
- [ ] 5) navConfig loader 교체(해당 path만)
- [ ] 6) 게이트
- [ ] `npm run build`
- [ ] 직접 URL + 새로고침 OK
- [ ] 기능 최소 확인(핵심 1~2개)
- [ ] 7) 문서
- [ ] MIGRATION_STATUS 업데이트
- [ ] result 기록(파일 목록/게이트 결과/특이사항)
- [ ] 역할 스위칭 점검 기록(주의할 점/Phase6 대비 선조치/체크 결과)

================================================================================
중요 금지(재작업 방지)
- src 수정 금지(예외는 DECISIONS_LOG에 이유/종료조건/1회 제한)
- component 필드 금지(loader only)
- impl 직접 import 금지(domain repo만)
- localStorage 직접 접근 금지(storage adapter/repo 경유)

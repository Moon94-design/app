# 2026-02-18-online-minimum-line-phase4-office-issue-action-conflict-permission

## online-minimum-line 체크 결과
- [x] office 저장/삭제 경계에 권한 포인트(`canRead/canWrite/canDelete`) 적용
- [x] issue 저장 경계에 `getById -> updatedAt` 충돌가드 적용
- [x] action 저장 경계에 `getById -> updatedAt` 충돌가드 적용
- [x] issue/action/office 삭제 경계에 권한 체크 + 메시지 반환 적용
- [x] UI 삭제 핸들러를 async 결과 처리로 정리(alert 메시지 노출)
- [x] L0/smoke 검증 수행(`build`, `test:smoke:routes`)
- [ ] L2 `check:qa:reuse-build`
  - reason: skipped by user request for speed

## notes
- 이번 배치는 충돌/권한 최소선만 확장했고, 실제 역할 정책은 allow-all stub 상태로 유지됩니다.
- 서버 인증/계정 도입 시 permissions provider만 교체하면 정책 연결이 가능합니다.

# G4 빌드 체크 및 타입 정리

> 작성일: 2026-02-09
> 주제: G4 빌드 통과를 위한 Partner 타입/상태 정리

---

- `npm run build` 실패 원인: `PartnerExtra.status` 타입이 `string`으로 확장되고 `PartnerV2.updatedAt` 타입이 `number` 계약과 불일치.
- 조치: `PartnerV2`의 `createdAt/updatedAt`을 `number`로 정렬하고, 관리/등록 화면에서 `PartnerExtra` 기본값과 `PartnerStatus`를 명시적으로 사용하도록 정리.
- 결과: `npm run build` 성공, G4 체크리스트 일부 항목(페이지 존재/loader/@legacy 0/@kernel only/build)을 체크.
- 추가 확인: `npm run dev` 기동 후 `/register/master/partner` 정상 렌더 확인(로컬 5174). Create/Edit 분기, draft 저장/복원/초기화, URL 직접 입력/새로고침은 사용자 확인 기준으로 정상 체크.

남은 작업: 별도 추가 확인 항목 없음. 필요 시 실사용 시나리오 QA 진행.
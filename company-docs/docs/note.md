작업 전 docs/CONTRACT_SSOT.md를 읽고 준수해라. 이번 단계는 “기능 변경 0”이다.

수정/생성할 것:
1) src/ssot/ 폴더 및 하위 index.ts placeholder 생성
2) src/ssot/index.ts 생성(re-export 진입점)
   - 훅: useAutoTitle, useTagSuggestion, useLinkedEntity
   - 태그: tagIndex 유틸(실제 export 이름을 확인해서 그대로 re-export)
   - TagInputText는 default export일 가능성이 크니 `export { default as TagInputText } ...` 형태로 처리
   - 타입: domain/schema/daily/_common.ts의 Ref/BaseRecord를 type-only로 re-export
   - repo.ts re-export는 제외
3) docs/CONTRACT_SSOT.md에 “SSOT 진입점은 src/ssot/index.ts로만 import” 1줄 추가
4) docs/ANCHORS_INDEX.txt에 SSOT 후보 파일 설명 항목 추가(코드에 앵커 추가는 하지 말 것)
5) docs/result/SSOT_step1_result.md 생성:
   - 변경 파일 리스트
   - 각 파일 변경 요약
   - 다음 단계 체크리스트

검증:
- npm run build 통과
- 기존 페이지 동작 변경 없음

출력:
- 실제 변경한 파일 목록과 경로

## (추가) 서버 이식 대비 최소 규약 (Docker 없이 지금부터 적용)
- **설정/비밀정보는 환경변수로만 관리**한다. (API 키/DB URL/OTP 시드/알림 토큰 등은 코드에 하드코딩 금지)
- **파일 경로는 절대 경로(C:\..., /Users/...) 사용 금지**. 상대 경로 또는 “스토리지 인터페이스”를 통해서만 접근한다.
- **저장/권한/조회는 repo 경계로만 호출**한다. (프론트는 Local/Server 구현을 몰라야 하며, 서버 이식 시 ServerRepo로 교체 가능해야 한다)
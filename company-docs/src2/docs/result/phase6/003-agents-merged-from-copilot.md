# AGENTS 통합 개편 (copilot-instructions 이관)

> 작성일: 2026-02-09
> 주제: copilot-instructions 핵심 규칙을 AGENTS.md로 통합해 우선 참조 문서 단일화

---

- `AGENTS.md`를 기존 우선 참조 규칙 4줄에서, 실제 작업 규칙 전체(문서 로딩/디버깅/아키텍처/데이터/docs 워크플로우)로 확장.
- `.github/copilot-instructions.md`의 핵심 지시를 AGENTS 기준 문서로 재구성.
- 다음 작업부터는 AGENTS.md만 먼저 봐도 핵심 운영 규칙을 바로 적용 가능.

다음 질문: `.github/copilot-instructions.md`는 백업 용도로 유지할까, 아니면 AGENTS.md를 참조하도록 축약본으로 바꿀까?

## 추가 운영 규칙(2026-02-09)
- 긴 작업/중요 작업이 아니면 새 result 번호를 만들지 않고, 현재 result 파일에 덧붙여 기록.
- result 번호 증가는 "다음 작업이 명확히 시작되는 시점"에만 수행.

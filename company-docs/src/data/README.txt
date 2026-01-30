[DATA REPO LAYER]

목표:
- 화면(페이지)에서 localStorage 직접 접근을 제거하고
  repo를 통해서만 CRUD 하도록 정리한다.
- 서버 이식 시 LocalRepo -> ServerRepo 로 "갈아끼우기" 한다.

원칙:
- Draft(임시 입력값), ShiftMem(개인 프리셋) 같은 "개인 로컬 설정"은 서버로 보내지 않는다.
- 업무 데이터(기준정보/일일기록/이벤트)는 repo를 통해 저장한다.

이관 방법(권장):
1) 페이지 1개씩 repo로 옮긴다.
   - 기존: loadJson/saveJson(KEY_...)
   - 변경: repo.partners().getAll() / repo.partners().prepend(...)
2) 전체 페이지를 옮긴 뒤, ServerRepo를 구현한다.
3) repo.ts에서 export를 ServerRepo로 교체한다.
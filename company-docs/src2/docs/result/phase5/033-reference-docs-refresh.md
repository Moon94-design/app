# reference 문서 최신화 (partner/manage + 구조 역할 맵)

> 작성일: 2026-02-10
> 주제: 기능 파일 참조 문서 갱신 + src2 폴더 구조/파일 역할 문서 신설

---

## 변경 요약
- `partner-manage-files.md`를 실제 코드 구조 기준으로 전면 최신화했다.
- 제거된 파일(`PartnerHeader.tsx`) 흔적을 정리하고, 현재 연결되는 kernel 공통 컴포넌트 기준으로 문서를 업데이트했다.
- `src2` 전체 폴더 구조와 각 레이어 역할을 한 문서로 정리했다.

## 변경 파일
- `src2/docs/reference/partner-manage-files.md`
- `src2/docs/reference/src2-folder-roles.md` (신규)

## 메모
- 이번 턴은 문서 갱신 작업이라 코드 게이트(`lint/build`)는 별도 수행하지 않았다.

## 핵심 로직 3줄
- partner 참조 문서는 실제 존재 파일 목록 기준으로 재작성해 문서-코드 불일치를 해소했다.
- 공통 헤더/상태/프로필/최근목록 등 현재 SSOT 컴포넌트 연결점을 reference에 명시했다.
- `src2-folder-roles.md`를 신설해 app/kernel/docs 레이어별 책임 경계를 고정했다.

## 입문자 설명 3줄
- 문서가 오래되면 “없는 파일을 찾는 시간”이 늘어나서 개발 속도가 떨어진다.
- 그래서 코드에 맞춰 문서를 갱신하면, 다음 작업자가 어디를 고쳐야 할지 바로 알 수 있다.
- 폴더 역할 문서는 새 기능을 넣을 때 위치를 헷갈리지 않게 해주는 지도 역할을 한다.

## 주의 사항
- AI가 구조 요약을 만들 때 세부 예외(특정 페이지만 쓰는 특수 로직)를 일반 규칙으로 과단순화할 수 있으므로, 구현 시작 전 해당 도메인 파일을 한 번 더 확인해야 한다.

## 향후 과정
- 다음 이관 작업(register/action, register/production) 완료 시 reference 문서도 같은 턴에서 동시 갱신해야 문서 신뢰도를 유지할 수 있다.
- 공통 컴포넌트 승격/제거가 발생하면 `partner-manage-files.md`와 `src2-folder-roles.md`를 같이 업데이트한다.

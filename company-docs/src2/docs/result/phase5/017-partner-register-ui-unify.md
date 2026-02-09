# 거래처 등록 UI 톤 통일

> 작성일: 2026-02-09
> 주제: 기준등록 공통 톤에 맞춰 PartnerRegisterPage UI 스타일 단순화

---

## 변경 요약
- partner 등록 화면의 번호/이모지/강한 색상 헤더를 제거하고, 다른 기준등록 페이지와 동일한 톤으로 정리.
- 기능/데이터 구조는 유지하고 표현 계층(UI)만 통일.

## 코드 변경
- `src2/app/pages/partner/PartnerRegisterPage.tsx`
  - 카드 배경 커스텀 제거 (`className="card"` 기본 톤 사용)
  - 수정 모드 안내를 단순 텍스트로 정리

- `src2/app/pages/partner/sections/PartnerHeader.tsx`
  - 제목을 `h1` 스타일로 통일
  - 완료 배지의 이모지 제거 및 문구 단순화

- `src2/app/pages/partner/sections/PartnerCreateFlow.tsx`
  - `1.`, `2.` 번호형 섹션 제목 제거
  - 공통 `p` 라벨 톤으로 변경
  - `+ 프로필 추가` -> `프로필 추가`로 단순화

- `src2/app/pages/partner/sections/PartnerBaseSection.tsx`
  - 컬러/아이콘 헤더 제거
  - 기본 입력 라벨 중심 레이아웃 유지

- `src2/app/pages/partner/sections/PartnerExtraSection.tsx`
  - 컬러/아이콘 헤더 제거
  - 기본 입력 라벨 중심 레이아웃 유지

## 게이트 확인
- `npm run build` 성공.

다음 질문: 동일 톤 통일을 `manage/master`(거래처 관리)의 상단 헤더/버튼 배치에도 적용할까?

## 후속 수정
- 사용자 요청에 따라 `PartnerCreateFlow` 내부의 블록 소제목(거래처 정보/주소·사업자/담당자/메모·계좌/중요도·관계현황/거래 프로필)을 제거해, 필드 라벨만 보이도록 단순화.
- 변경 파일: `src2/app/pages/partner/sections/PartnerCreateFlow.tsx`
- 검증: `npm run build` 성공, `/register/master/partner` URL 재요청 200.

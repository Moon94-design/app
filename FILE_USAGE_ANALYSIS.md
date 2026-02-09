# 프로젝트 파일/폴더 사용 현황 분석

> **분석일:** 2026-02-04  
> **목적:** 실사용/미사용/혼재 파일 및 폴더 정리

---

## 📊 요약

- **실사용 폴더:** 핵심 기능 구현 및 문서
- **안 쓰는 폴더:** 빈 폴더, 백업 파일, 플레이스홀더
- **혼재 폴더:** 일부는 사용하고 일부는 비어있거나 백업만 존재

---

## 🟢 실사용 중인 파일/폴더

### 루트 레벨
```
/workspaces/app/
├── PROJECT_OVERVIEW.md          ✅ 프로젝트 개요 문서
├── README.md                    ✅ 프로젝트 설명
├── 정리문서_생산이슈조치기록_기능분석.md  ✅ 기능 분석 문서
└── company-docs/                ✅ 메인 프로젝트 (실사용)
```

### company-docs 내부 - 핵심 파일

#### 설정 파일 (실사용)
```
company-docs/
├── package.json                 ✅ 의존성 관리
├── package-lock.json            ✅ 의존성 잠금
├── tsconfig.json                ✅ TypeScript 설정
├── tsconfig.app.json            ✅ TypeScript 앱 설정
├── tsconfig.node.json           ✅ TypeScript 노드 설정
├── vite.config.ts               ✅ Vite 빌드 설정
├── eslint.config.js             ✅ ESLint 설정
└── index.html                   ✅ 엔트리 HTML
```

#### 소스 코드 (실사용)

**1. src/app/ - 애플리케이션 레이어 (실사용)**
```
src/app/
├── routes.tsx                   ✅ 라우팅 정의 (핵심)
├── App.tsx                      ✅ 앱 루트 컴포넌트
├── shell/
│   ├── Shell.tsx                ✅ 레이아웃 쉘
│   └── shell.css                ✅ 쉘 스타일
├── nav/
│   └── navModel.ts              ✅ 네비게이션 모델
└── pages/
    ├── home/
    │   └── HomeMain.tsx         ✅ 홈 페이지
    ├── register/                ✅ 등록 페이지들 (15개 파일)
    │   ├── RegisterHome.tsx
    │   ├── RegisterMaster.tsx
    │   ├── RegisterDaily.tsx
    │   ├── RegisterPartner.tsx
    │   ├── RegisterVehicle.tsx
    │   ├── RegisterVendor.tsx
    │   ├── RegisterAgency.tsx
    │   ├── RegisterEmployee.tsx
    │   ├── RegisterEquipment.tsx
    │   ├── RegisterConsumable.tsx
    │   ├── RegisterProductionDaily.tsx
    │   ├── RegisterLogisticsDaily.tsx
    │   ├── RegisterOfficeDaily.tsx
    │   ├── RegisterIssue.tsx
    │   └── RegisterAction.tsx
    ├── manage/                  ✅ 관리 페이지들 (3개 파일)
    │   ├── ManageHome.tsx
    │   ├── ManageMaster.tsx
    │   └── ManageDaily.tsx
    └── browse/                  ✅ 조회 페이지들 (4개 파일)
        ├── BrowseHome.tsx
        ├── BrowseMaster.tsx
        ├── BrowseDaily.tsx
        └── BrowsePrice.tsx
```

**2. src/base/ - 기초 유틸리티 (실사용)**
```
src/base/
├── components/                  ✅ 재사용 컴포넌트
│   ├── NameAutocomplete.tsx     ✅ 이름 자동완성
│   ├── TagInputText.tsx         ✅ 태그 입력
│   ├── TagWidgets.tsx           ✅ 태그 위젯
│   ├── LinkedEntitySelect.tsx   ✅ 연계 엔티티 선택
│   └── form/                    ✅ 폼 컴포넌트 (5개 파일)
│       ├── IssueForm.tsx
│       ├── ActionForm.tsx
│       ├── IssueQualityFields.tsx
│       ├── IssueEquipmentFields.tsx
│       ├── IssueSafetyFields.tsx
│       ├── LinkedSelector.tsx
│       └── index.ts
├── hooks/                       ✅ React 훅
│   ├── useAutoTitle.ts          ✅ 제목 자동완성
│   ├── useTagSuggestion.ts      ✅ 태그 추천
│   ├── useLinkedEntity.ts       ✅ 연계 엔티티
│   ├── useWriterInfo.ts         ✅ 작성자 정보
│   ├── useFormValidation.ts     ✅ 폼 검증
│   ├── usePreserveSelection.ts  ✅ 선택 보존
│   └── index.ts
├── utils/                       ✅ 유틸 함수
│   ├── tagIndex.ts              ✅ 태그 인덱스
│   ├── phone.ts                 ✅ 전화번호 포맷
│   ├── pageStorage.ts           ✅ 페이지 저장소
│   └── useDraftState.ts         ✅ 드래프트 상태
├── dev/
│   └── UiEditOverlay.tsx        ✅ UI 편집 오버레이
└── theme/
    └── tokens.css               ✅ 테마 토큰
```

**3. src/data/ - 데이터 저장소 (실사용)**
```
src/data/
├── repo.ts                      ✅ 저장소 진입점
├── repoTypes.ts                 ✅ 저장소 타입
├── localRepo.ts                 ✅ 로컬 저장소 구현
├── storage.ts                   ✅ localStorage 래퍼
├── keys.ts                      ✅ 저장소 키
├── issueRepo.ts                 ✅ 이슈 저장소
├── actionRepo.ts                ✅ 조치 저장소
└── README.txt                   ✅ 설명
```

**4. src/domain/schema/ - 도메인 스키마 (실사용)**
```
src/domain/schema/
├── README.md                    ✅ 스키마 설명
└── daily/                       ✅ 일일기록 스키마
    ├── _common.ts               ✅ 공통 타입
    ├── production.ts            ✅ 생산일지
    ├── logistics.ts             ✅ 유통일지
    ├── office.ts                ✅ 사무일지
    ├── equipment.ts             ✅ 설비일지
    ├── inventory.ts             ✅ 재고일지
    ├── accounting.ts            ✅ 회계일지
    ├── quality.ts               ✅ 품질일지
    ├── safety.ts                ✅ 안전일지
    ├── issue.ts                 ✅ 이슈
    └── action.ts                ✅ 조치
```

**5. src/ssot/ - 정본(SSOT) (실사용)**
```
src/ssot/
├── index.ts                     ✅ 정본 진입점 (re-export)
├── forms/blocks/                ✅ 공통 폼 블록
│   ├── RecordHeaderBlock.tsx    ✅ 기록 헤더
│   ├── AutoTitleBlock.tsx       ✅ 자동 제목
│   ├── TagBlock.tsx             ✅ 태그 블록
│   ├── MainContentBlock.tsx     ✅ 메인 컨텐츠
│   └── index.ts                 ✅ 블록 export
├── linking/
│   └── index.ts                 ✅ 연계 엔진 (플레이스홀더)
├── schema/
│   └── index.ts                 ✅ 스키마 (플레이스홀더)
└── tags/
    └── index.ts                 ✅ 태그 엔진 (플레이스홀더)
```

**6. 기타 소스 파일**
```
src/
├── main.tsx                     ✅ React 엔트리
├── App.tsx                      ✅ 앱 루트
├── index.css                    ✅ 글로벌 스타일
├── App.css                      ✅ 앱 스타일
├── overrides.css                ✅ 오버라이드 스타일
└── assets/
    └── react.svg                ✅ React 로고
```

#### 문서 (실사용)
```
company-docs/docs/
├── CONTRACT_SSOT.md             ✅ SSOT 계약서 (핵심 문서)
├── ROADMAP.txt                  ✅ 로드맵
├── SERVER_MIGRATION_SUMMARY.md  ✅ 서버 마이그레이션 요약
├── ANCHORS_INDEX.txt            ✅ 앵커 인덱스
├── ANCHOR_MANIFEST.txt          ✅ 앵커 매니페스트
├── note.md                      ✅ 노트
├── patch.txt                    ✅ 패치 파일
├── anchor-maps/
│   └── PRODUCTION_DAILY.md      ✅ 생산일지 앵커 맵
└── result/                      ✅ 작업 결과 문서 (8개)
    ├── SSOT_step1_result.md
    ├── SSOT_step2_result.md
    ├── SSOT_step3_result.md
    ├── SSOT_step4_result.md
    ├── SSOT_step45_result.md
    ├── SSOT_step5_1_result.md
    ├── SSOT_step5_5_result.md
    └── SSOT_step5_6_result.md
```

#### 도구/스크립트 (실사용)
```
company-docs/tools/
├── patch.sh                     ✅ 패치 적용
├── patch2.sh                    ✅ 패치 적용 v2
├── safe_apply.sh                ✅ 안전 적용
├── backup.sh                    ✅ 백업
├── restore.sh                   ✅ 복원
├── list_backups.sh              ✅ 백업 목록
├── rollback.mjs                 ✅ 롤백
├── rollback_latest.mjs          ✅ 최신 롤백
├── apply_anchor_manifest.mjs    ✅ 앵커 매니페스트 적용
├── safe_anchor_apply.mjs        ✅ 안전 앵커 적용
├── apply_from_txt.mjs           ✅ txt에서 적용
├── migrate_repo_passA.mjs       ✅ 저장소 마이그레이션
└── repl/                        ✅ 교체 블록 (7개 파일)
    ├── production_buildSuggestions_body.txt
    ├── production_tag_suggest_block.txt
    ├── production_confirmed_tags_ui.txt
    ├── production_tag_row_with_confirmed_tags.txt
    ├── personal_tag_manager_block.txt
    ├── taginput_minlen.txt
    └── (기타 교체 블록)
```

---

## 🔴 안 쓰는 파일/폴더 (삭제 또는 정리 대상)

### 루트 레벨
```
/workspaces/app/
├── aa                           ❌ 의미 불명 파일
├── comand.txt                   ❌ 임시 명령 메모
├── 순서                          ❌ 임시 메모
├── 전체순서 .txt                 ❌ 임시 메모 (공백 포함 파일명)
├── save/                        ❌ 백업 폴더 (안 씀)
│   ├── S20260202_064654_0485726566/
│   ├── S20260202_064839_b99e6d8fe8/
│   └── S20260202_065226_6480097753/
├── app_handover_20260204.tar.gz    ❌ 압축 파일 (배포용)
├── app_project.zip                 ❌ 압축 파일 (배포용)
└── app_snapshot_20260203_221800.tar.gz  ❌ 압축 파일 (백업)
```

### company-docs 내부

#### 빈 폴더 (플레이스홀더)
```
src/lab/                         ❌ 비어있음 (실험용 플레이스홀더)

src/app/pages/
├── admin/                       ❌ 비어있음
├── daily/                       ❌ 비어있음
├── master/                      ❌ 비어있음
└── reports/                     ❌ 비어있음

src/app/components/
├── form/                        ❌ 비어있음
├── ui/                          ❌ 비어있음
└── print/                       ❌ 비어있음

src/base/
├── repo/                        ❌ 빈 파일들만 (Repo.ts, ServerRepo.ts, LocalRepo.ts)
├── types/                       ❌ 비어있음
└── config/
    └── featureFlags.ts          ❌ 비어있음

src/domain/
├── index/                       ❌ 비어있음
├── migrations/                  ❌ 비어있음
├── rules/
│   └── README.md                ❌ README만 (내용 없음)
└── views/
    └── README.md                ❌ README만 (내용 없음)
```

#### 백업 폴더
```
company-docs/.backups/           ❌ 백업 폴더 (안 씀)
├── S20260202_122532_3d057ab8ba/
├── S20260202_124822_506f803499/
├── S20260202_125614_fa9c0f59f2/
├── S20260202_130241_9a1b076187/
├── S20260202_131331_80ddfe1691/
└── index.json

company-docs/tools/
├── .backups_anchor/             ❌ 앵커 백업 (24개 파일)
└── .backups_repo_passA/         ❌ 저장소 패스A 백업 (5개 파일)
```

#### 기타
```
company-docs/tools.zip           ❌ 압축 파일
company-docs/public/
└── vite.svg                     ⚠️  사용 여부 불명 (기본 파일)
```

---

## 🟡 혼재되어 있는 폴더

### src/app/pages/
**상태:** 일부 폴더는 실사용, 일부는 비어있음

```
src/app/pages/
├── home/            ✅ 실사용 (HomeMain.tsx)
├── register/        ✅ 실사용 (15개 파일)
├── manage/          ✅ 실사용 (3개 파일)
├── browse/          ✅ 실사용 (4개 파일)
├── admin/           ❌ 비어있음 (미구현)
├── daily/           ❌ 비어있음 (미구현)
├── master/          ❌ 비어있음 (미구현)
└── reports/         ❌ 비어있음 (미구현)
```

**권장 조치:**
- 빈 폴더(admin, daily, master, reports) 삭제
- 필요 시 나중에 재생성

### src/app/components/
**상태:** 모든 하위 폴더 비어있음

```
src/app/components/
├── form/            ❌ 비어있음
├── ui/              ❌ 비어있음
└── print/           ❌ 비어있음
```

**권장 조치:**
- 전체 폴더 삭제 (필요 없음)
- 컴포넌트는 src/base/components/에 이미 있음

### src/base/
**상태:** 대부분 실사용, 일부만 비어있음

```
src/base/
├── components/      ✅ 실사용
├── hooks/           ✅ 실사용
├── utils/           ✅ 실사용
├── dev/             ✅ 실사용
├── theme/           ✅ 실사용
├── config/          ⚠️  featureFlags.ts만 비어있음
├── repo/            ❌ 빈 파일들만
└── types/           ❌ 비어있음
```

**권장 조치:**
- repo/ 폴더 삭제 (빈 파일만 있음)
- types/ 폴더 삭제 (비어있음)
- config/ 폴더 삭제 또는 featureFlags.ts 삭제

### src/domain/
**상태:** schema만 실사용, 나머지는 플레이스홀더

```
src/domain/
├── schema/          ✅ 실사용 (11개 스키마 파일)
├── rules/           ⚠️  README.md만 (내용 없음)
├── views/           ⚠️  README.md만 (내용 없음)
├── index/           ❌ 비어있음
└── migrations/      ❌ 비어있음
```

**권장 조치:**
- index/, migrations/ 폴더 삭제
- rules/, views/ 폴더는 나중에 사용 예정이면 유지

### company-docs/tools/
**상태:** 실제 스크립트와 백업 폴더 혼재

```
tools/
├── *.sh                         ✅ 실사용 셸 스크립트
├── *.mjs                        ✅ 실사용 Node 스크립트
├── repl/                        ✅ 실사용 교체 블록
├── .backups_anchor/             ❌ 백업 폴더
└── .backups_repo_passA/         ❌ 백업 폴더
```

**권장 조치:**
- 백업 폴더(.backups_*)는 별도 백업 위치로 이동 또는 삭제

---

## 📋 정리 권장 사항

### 우선순위 1 (즉시 삭제 가능)

```bash
# 루트 레벨 임시 파일
rm /workspaces/app/aa
rm /workspaces/app/comand.txt
rm /workspaces/app/순서
rm "/workspaces/app/전체순서 .txt"

# 압축 파일 (이미 배포했으면 삭제)
rm /workspaces/app/app_handover_20260204.tar.gz
rm /workspaces/app/app_project.zip
rm /workspaces/app/app_snapshot_20260203_221800.tar.gz

# 빈 폴더 삭제
rm -rf /workspaces/app/save/
rm -rf /workspaces/app/company-docs/src/lab/
rm -rf /workspaces/app/company-docs/src/app/pages/admin/
rm -rf /workspaces/app/company-docs/src/app/pages/daily/
rm -rf /workspaces/app/company-docs/src/app/pages/master/
rm -rf /workspaces/app/company-docs/src/app/pages/reports/
rm -rf /workspaces/app/company-docs/src/app/components/
rm -rf /workspaces/app/company-docs/src/base/repo/
rm -rf /workspaces/app/company-docs/src/base/types/
rm -rf /workspaces/app/company-docs/src/base/config/
rm -rf /workspaces/app/company-docs/src/domain/index/
rm -rf /workspaces/app/company-docs/src/domain/migrations/
```

### 우선순위 2 (백업 후 삭제)

```bash
# 백업 폴더 (필요하면 아카이브 후 삭제)
rm -rf /workspaces/app/company-docs/.backups/
rm -rf /workspaces/app/company-docs/tools/.backups_anchor/
rm -rf /workspaces/app/company-docs/tools/.backups_repo_passA/
```

### 우선순위 3 (판단 필요)

```bash
# 나중에 사용 예정이면 유지
/workspaces/app/company-docs/src/domain/rules/
/workspaces/app/company-docs/src/domain/views/

# SSOT 플레이스홀더 (계획된 기능)
/workspaces/app/company-docs/src/ssot/linking/
/workspaces/app/company-docs/src/ssot/schema/
/workspaces/app/company-docs/src/ssot/tags/
```

---

## 📊 통계 요약

### 파일/폴더 개수
- **실사용 폴더:** ~20개
- **실사용 파일:** ~100개
- **안 쓰는 빈 폴더:** 15개
- **백업 폴더:** 3개 (30개 이상의 백업 파일)
- **임시 파일:** 4개 (루트 레벨)

### 디스크 사용량 (추정)
- **실제 소스 코드:** ~2-3MB
- **백업 파일:** ~200KB
- **압축 파일:** ~2.5MB
- **node_modules (제외):** ~수백 MB

---

## ✅ 정리 후 예상 구조

```
/workspaces/app/
├── PROJECT_OVERVIEW.md
├── FILE_USAGE_ANALYSIS.md
├── README.md
├── 정리문서_생산이슈조치기록_기능분석.md
└── company-docs/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── eslint.config.js
    ├── index.html
    ├── docs/               (문서)
    ├── tools/              (스크립트만)
    ├── public/
    └── src/
        ├── app/            (라우팅, 페이지)
        ├── base/           (컴포넌트, 훅, 유틸)
        ├── data/           (저장소)
        ├── domain/schema/  (스키마)
        ├── ssot/           (정본)
        └── assets/
```

---

**문서 버전:** 1.0  
**마지막 업데이트:** 2026-02-04

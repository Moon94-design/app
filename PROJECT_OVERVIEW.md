# 프로젝트 개요 문서 (Project Overview)

> **작성일:** 2026-02-04  
> **목적:** 새로운 작업자 온보딩용 프로젝트 전체 구조 요약

---

## 1. 폴더/페이지 구조 맵

```
company-docs/
├── src/
│   ├── app/                    # 애플리케이션 레이어
│   │   ├── routes.tsx         # 라우팅 정의
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── home/          # 홈 페이지
│   │   │   ├── register/      # 등록 페이지들
│   │   │   │   ├── RegisterHome.tsx
│   │   │   │   ├── RegisterMaster.tsx      # 기준정보 등록 허브
│   │   │   │   ├── RegisterDaily.tsx       # 일일기록 등록 허브
│   │   │   │   ├── RegisterPartner.tsx     # 거래처 등록
│   │   │   │   ├── RegisterVehicle.tsx     # 차량 등록
│   │   │   │   ├── RegisterVendor.tsx      # 업체 등록
│   │   │   │   ├── RegisterAgency.tsx      # 기관 등록
│   │   │   │   ├── RegisterEmployee.tsx    # 직원 등록
│   │   │   │   ├── RegisterEquipment.tsx   # 설비 등록
│   │   │   │   ├── RegisterConsumable.tsx  # 소모품 등록
│   │   │   │   ├── RegisterProductionDaily.tsx   # 생산일지
│   │   │   │   ├── RegisterLogisticsDaily.tsx    # 유통일지
│   │   │   │   ├── RegisterOfficeDaily.tsx       # 사무일지
│   │   │   │   ├── RegisterIssue.tsx        # 이슈 등록
│   │   │   │   └── RegisterAction.tsx       # 조치 등록
│   │   │   ├── manage/        # 관리 페이지들
│   │   │   ├── browse/        # 조회/보고서 페이지들
│   │   │   └── reports/       # 통계/보고서
│   │   ├── shell/             # 앱 쉘(레이아웃)
│   │   └── nav/               # 네비게이션
│   │
│   ├── domain/                # 도메인 레이어
│   │   ├── schema/            # 데이터 스키마
│   │   │   └── daily/         # 일일기록 스키마
│   │   │       ├── _common.ts
│   │   │       ├── production.ts      # 생산일지
│   │   │       ├── logistics.ts       # 유통일지
│   │   │       ├── office.ts          # 사무일지
│   │   │       ├── equipment.ts       # 설비일지
│   │   │       ├── inventory.ts       # 재고일지
│   │   │       ├── accounting.ts      # 회계일지
│   │   │       ├── quality.ts         # 품질일지
│   │   │       ├── safety.ts          # 안전일지
│   │   │       ├── issue.ts           # 이슈
│   │   │       └── action.ts          # 조치
│   │   ├── rules/             # 비즈니스 규칙
│   │   ├── views/             # 뷰 로직
│   │   └── migrations/        # 데이터 마이그레이션
│   │
│   ├── ssot/                  # 정본(SSOT) - Single Source of Truth
│   │   ├── schema/            # 정본 스키마
│   │   ├── linking/           # 연계 엔진(Ref/LinkPicker)
│   │   ├── tags/              # 태그 엔진
│   │   └── forms/             # 공통 폼 블록
│   │
│   ├── data/                  # 데이터 저장소
│   │   ├── repo.ts            # 로컬 저장소 구현
│   │   ├── repoTypes.ts       # 저장소 타입
│   │   ├── storage.ts         # localStorage 래퍼
│   │   └── keys.ts            # 저장소 키 관리
│   │
│   └── base/                  # 기초 유틸리티
│       ├── components/        # 기본 컴포넌트
│       ├── hooks/             # React 훅
│       ├── utils/             # 유틸 함수
│       ├── config/            # 설정
│       └── theme/             # 테마/스타일
│
├── docs/                      # 프로젝트 문서
│   ├── CONTRACT_SSOT.md       # SSOT 규약 (핵심 문서)
│   ├── ROADMAP.txt
│   └── result/                # 작업 결과 문서
│
└── tools/                     # 빌드/패치 도구
    ├── patch.sh
    ├── rollback.mjs
    └── safe_anchor_apply.mjs
```

---

## 2. 라우트(페이지) 목록 + 사용 데이터 타입

### 2.1 홈
| 라우트 | 페이지 | 데이터 타입 |
|--------|--------|------------|
| `/` | HomeMain | - |

### 2.2 등록 페이지 (Register)

#### 기준정보 등록
| 라우트 | 페이지 | 데이터 타입 |
|--------|--------|------------|
| `/register/master/partner` | RegisterPartner | Partner |
| `/register/master/vehicle` | RegisterVehicle | Vehicle |
| `/register/master/vendor` | RegisterVendor | Vendor |
| `/register/master/agency` | RegisterAgency | Agency |
| `/register/master/employee` | RegisterEmployee | Employee |
| `/register/master/equipment` | RegisterEquipment | Equipment |
| `/register/master/consumable` | RegisterConsumable | Consumable |

#### 일일기록 등록
| 라우트 | 페이지 | 데이터 타입 |
|--------|--------|------------|
| `/register/daily/production` | RegisterProductionDaily | ProductionRecord, ProductionDraft |
| `/register/daily/logistics` | RegisterLogisticsDaily | LogisticsRecord, LogisticsDraft |
| `/register/daily/office` | RegisterOfficeDaily | OfficeRecord, OfficeDraft |
| `/register/daily/issue` | RegisterIssue | IssueDoc, IssueItem, IssueDraft |
| `/register/daily/action` | RegisterAction | ActionDoc, ActionItem, ActionDraft |

### 2.3 관리 페이지 (Manage)
| 라우트 | 페이지 | 데이터 타입 |
|--------|--------|------------|
| `/manage` | ManageHome | - |
| `/manage/master` | ManageMaster | 기준정보 전체 |
| `/manage/daily` | ManageDaily | 일일기록 전체 |

### 2.4 조회/보고서 (Browse)
| 라우트 | 페이지 | 데이터 타입 |
|--------|--------|------------|
| `/browse` | BrowseHome | - |
| `/browse/master` | BrowseMaster | 기준정보 전체 |
| `/browse/daily` | BrowseDaily | 일일기록 전체 |
| `/browse/price` | BrowsePrice | 단가 이력 |

---

## 3. 데이터 모델 초안 (SSOT 스키마) 요약

### 3.1 공통 기본 타입 (BaseRecord)

모든 기록(Record)은 아래 필드를 포함:

```typescript
type BaseRecord = {
  id: string;              // 고유 ID (필수)
  recordDate: string;      // 기록 날짜 (YYYY-MM-DD)
  createdAt: string;       // 생성 시각 (ISO8601)
  updatedAt: string;       // 수정 시각 (ISO8601)
  writerName?: string;     // 작성자명 (선택)
  title: string;           // 제목
  details: string;         // 상세 내용
  tags: string[];          // 태그 목록
};
```

### 3.2 연계(Ref) 표준 형식

모든 연계는 아래 형식을 따름:

```typescript
type Ref = {
  type: string;    // 엔티티 타입 (예: "partner", "vehicle", "equipment")
  id: string;      // 연계 대상 ID
  label: string;   // 화면 표시용 이름
  meta?: object;   // 선택: 필터/표시 보조 데이터
};
```

**연계 예시:**
- `{ type: "partner", id: "PTR_...", label: "ABC거래처" }`
- `{ type: "vehicle", id: "VEH_...", label: "01가1234" }`
- `{ type: "equipment", id: "EQP_...", label: "압축기-1호" }`

---

## 4. 엔티티 목록 및 필수 필드/Refs 방식

### 4.1 기준정보 (Master Data)

#### 거래처 (Partner)
```typescript
type Partner = {
  id: string;                 // 고유 ID (예: PTR_xxx)
  name: string;               // 거래처명 (필수)
  address: string;            // 주소
  companyPhone: string;       // 회사 전화번호
  status: "거래중" | "보류" | "중단";
  contacts: Contact[];        // 연락처 목록
  linkedVehicles: LinkedVehicle[];  // 연계 차량 목록
  priceRows: PriceRow[];      // 단가 이력
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- 다른 엔티티에서 참조 시: `{ type: "partner", id: partner.id, label: partner.name }`

#### 차량 (Vehicle)
```typescript
type Vehicle = {
  id: string;                 // 고유 ID (예: VEH_xxx)
  vehicleNo: string;          // 차량번호 (필수)
  carrier: string;            // 운송사
  driverName: string;         // 운전자명
  driverPhone: string;        // 운전자 전화
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "vehicle", id: vehicle.id, label: vehicle.vehicleNo }`

#### 설비 (Equipment)
```typescript
type Equipment = {
  id: string;                 // 고유 ID (예: EQP_xxx)
  name: string;               // 설비명 (필수)
  category: "생산" | "유통" | "안전" | "기타";
  location: string;           // 설치 위치
  status: "정상" | "점검중" | "고장" | "폐기";
  model: string;              // 모델명
  serialNo: string;           // 시리얼번호
  installDate: string;        // 설치일
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "equipment", id: equipment.id, label: equipment.name }`

#### 직원 (Employee)
```typescript
type Employee = {
  id: string;                 // 고유 ID (예: EMP_xxx)
  name: string;               // 이름 (필수)
  role: string;               // 직책
  department: string;         // 부서
  phone: string;              // 연락처
  email: string;              // 이메일
  status: "재직" | "휴직" | "퇴사";
  hireDate: string;           // 입사일
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "employee", id: employee.id, label: employee.name }`

#### 업체 (Vendor)
```typescript
type Vendor = {
  id: string;                 // 고유 ID (예: VND_xxx)
  name: string;               // 업체명 (필수)
  category: "정비" | "청소" | "운송" | "기타";
  phone: string;              // 전화번호
  address: string;            // 주소
  contacts: Contact[];        // 담당자 목록
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "vendor", id: vendor.id, label: vendor.name }`

#### 기관 (Agency)
```typescript
type Agency = {
  id: string;                 // 고유 ID (예: AGC_xxx)
  name: string;               // 기관명 (필수)
  category: "관공서" | "금융" | "협회" | "기타";
  phone: string;              // 전화번호
  address: string;            // 주소
  contacts: Contact[];        // 담당자 목록
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "agency", id: agency.id, label: agency.name }`

#### 소모품 (Consumable)
```typescript
type Consumable = {
  id: string;                 // 고유 ID (예: CSM_xxx)
  name: string;               // 품목명 (필수)
  category: string;           // 분류
  unit: string;               // 단위
  currentStock: number;       // 현재 재고
  minStock: number;           // 최소 재고
  supplier: string;           // 공급처
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};
```

**Refs 방식:**
- `{ type: "consumable", id: consumable.id, label: consumable.name }`

---

### 4.2 일일기록 (Daily Records)

#### 생산일지 (Production)
```typescript
type ProductionRecord = BaseRecord & {
  kind: "production";
  site: "대구" | "성주";      // 지부 (필수)
  writerRole?: string;         // 작성자 직책
  lines: ProductionLine[];     // 생산 라인 목록 (필수, 1개 이상)
};

type ProductionLine = {
  id: string;                  // 라인 ID
  shift: "주간" | "오후" | "야간";
  product: "분쇄품" | "펠렛";
  item: "PP" | "PE";
  bags: number;                // 포대 수
  kg: number;                  // 중량(kg)
  memo: string;                // 메모
};
```

**필수 필드:** `recordDate`, `lines` (1개 이상)

#### 유통일지 (Logistics)
```typescript
type LogisticsRecord = BaseRecord & {
  kind: "logistics";
  lines: LogisticsLine[];      // 유통 라인 목록 (필수, 1개 이상)
};

type LogisticsLine = {
  direction: "매입" | "출고";
  kind: "압축품" | "분쇄품" | "펠렛";
  item: "PP" | "PE";
  kg: number;                  // 중량(kg)
  unitPricePerKg: number;      // 단가(원/kg)
  partner: Ref;                // 거래처 참조 (필수)
  vehicle?: Ref;               // 차량 참조 (선택)
};
```

**필수 필드:** `recordDate`, `title`, `lines` (1개 이상)  
**Refs 사용:** `partner` (필수), `vehicle` (선택)

#### 사무일지 (Office)
```typescript
type OfficeRecord = BaseRecord & {
  kind: "office";
  agencyExtras: OfficeExtraAgency[];  // 기관 관련 항목
  etcExtras: OfficeExtraEtc[];        // 기타 항목
};

type OfficeExtraAgency = {
  id: string;
  agencyId: string;            // 기관 ID
  agencyLabel: string;         // 기관명
  title: string;               // 제목
  details: string;             // 상세
};
```

**Refs 사용:** `agencyId` → Agency 엔티티 참조

---

### 4.3 이슈/조치 (Issue/Action)

#### 이슈 (Issue)
```typescript
type IssueDoc = {
  id: string;                  // 문서 ID: ISSUE_YYYY-MM-DD_writer
  recordDate: string;          // 기록 날짜
  writerName: string;          // 작성자
  items: IssueItem[];          // 이슈 항목 목록
  updatedAt: string;
};

type IssueItem = {
  id: string;                  // 이슈 ID
  recordDate: string;          // 기록 날짜
  actualCreatedAt: string;     // 실제 작성 시각
  site?: "대구" | "성주";
  writerName: string;
  title: string;               // 제목 (필수)
  details: string;             // 상세 (필수)
  category: "quality" | "equipment" | "safety";  // 카테고리 (필수)
  categoryLabel: string;       // 카테고리 표시명
  status: "진행중" | "완료";
  severity: "낮음" | "보통" | "높음";
  linkedActionId?: string;     // 연계된 조치 ID
  tags: string[];
  tagIds: string[];
  
  // 카테고리별 상세
  quality?: IssueQuality;
  equipment?: IssueEquipment;
  safety?: IssueSafety;
  
  // Refs (내부 저장)
  equipmentId?: string;        // 설비 ID
  equipmentLabel?: string;
  employeeId?: string;         // 직원 ID
  employeeLabel?: string;
  
  history?: IssueHistoryEntry[];  // 수정 이력
};
```

**필수 필드:** `recordDate`, `writerName`, `title`, `category`, `status`, `severity`  
**Refs 방식:** 설비/직원 등을 ID로 참조하고 label을 함께 저장

#### 조치 (Action)
```typescript
type ActionDoc = {
  id: string;                  // 문서 ID: ACTION_YYYY-MM-DD_writer
  recordDate: string;
  writerName: string;
  items: ActionItem[];         // 조치 항목 목록
  updatedAt: string;
};

type ActionItem = {
  id: string;                  // 조치 ID
  recordDate: string;          // 기록일
  actualCreatedAt: string;
  site?: "대구" | "성주";
  writerName: string;
  writerRole: string;
  title: string;               // 제목 (필수)
  details: string;             // 상세 (필수)
  
  // 이슈 연계
  issueId?: string;            // 이슈 ID
  issueLabel?: string;
  
  // 정비업체 연계
  vendorId?: string;           // 업체 ID
  vendorLabel?: string;
  vendorCost?: number;         // 정비 비용
  
  tags: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};
```

**필수 필드:** `recordDate`, `writerName`, `title`  
**Refs 방식:** 이슈/업체를 ID로 참조하고 label을 함께 저장

---

## 5. ID/키 규칙

### 5.1 ID 생성 규칙

모든 엔티티는 prefix + timestamp + random 조합:

```
{PREFIX}_{TIMESTAMP}_{RANDOM}
```

**Prefix 목록:**
- `PTR_` : Partner (거래처)
- `VEH_` : Vehicle (차량)
- `EQP_` : Equipment (설비)
- `EMP_` : Employee (직원)
- `VND_` : Vendor (업체)
- `AGC_` : Agency (기관)
- `CSM_` : Consumable (소모품)
- `PROD_` : Production (생산일지)
- `LOG_` : Logistics (유통일지)
- `OFC_` : Office (사무일지)
- `ISS_` : Issue (이슈)
- `ACT_` : Action (조치)
- `PL_` : ProductionLine (생산 라인)

### 5.2 Document ID 규칙 (일일기록)

일일기록은 "1계정 × 1일 = 1문서" 원칙:

```
{TYPE}_{YYYY-MM-DD}_{WRITER}
```

**예시:**
- `PROD_2026-02-04_홍길동` : 2026년 2월 4일 홍길동의 생산일지
- `ISSUE_2026-02-04_홍길동` : 2026년 2월 4일 홍길동의 이슈 문서

### 5.3 저장소 키 규칙

localStorage 키:

```
APP_{ENTITY_TYPE}
```

**예시:**
- `APP_PARTNERS` : 거래처 목록
- `APP_VEHICLES` : 차량 목록
- `APP_PRODUCTION_RECORDS` : 생산일지 목록
- `APP_ISSUE_DOCS` : 이슈 문서 목록

---

## 6. 핵심 설계 원칙 (SSOT Contract)

### 6.1 정본(SSOT) 우선
- 동일한 로직이 2곳에 보이면 → 정본(SSOT)으로 승격
- 페이지는 조립만, 로직은 SSOT에서만 구현
- 제목 자동완성, 태그 추천, 연계 추가 로직 → 모두 SSOT

### 6.2 연계 강제 (페이지 이동 최소화)
- 선택(기존 불러오기) UI에는 항상 **추가/수정** 기능 포함
- 등록 페이지로 이동 후 돌아오는 UX 금지
- LinkPicker(연계 엔진)로 그 자리에서 해결

### 6.3 스키마 책임
- default / normalize / validate / toRecord → 스키마가 책임
- 페이지는 스키마 호출만, 검증 로직 복제 금지

### 6.4 TS strict 준수
- unused import/function → 빌드 실패
- `import type` 필수 (verbatimModuleSyntax)

### 6.5 후반(서버) 이식 우선
- 지금 당장 편한 구현보다 서버 확장 가능한 구조 우선
- 권한(RBAC), 감사로그, 제공 통제 전제

---

## 7. 주요 기능 모듈

### 7.1 공통 폼 블록 (SSOT Forms)
- **RecordHeaderBlock**: 기록날짜/지부/작성자/직책
- **AutoTitleBlock**: 제목 자동완성 (클릭 시 auto on, 수정 시 auto off)
- **TagBlock**: 태그 입력 + 추천 + 색상 + dismiss + 더보기
- **MainContentBlock**: 내용 입력

모든 등록 페이지에서 재사용

### 7.2 연계 엔진 (SSOT Linking)
- **LinkPicker**: 검색 + 선택 + 추가 + 수정(rename/중복방지) 통합 모달
- **adapters**: partner/vehicle/equipment/employee/agency/vendor
  - 데이터 소스 + rename 규칙 + create form 담당
- 페이지는 `openLinkPicker(...)` 호출만

### 7.3 태그 엔진 (SSOT Tags)
- **기준(시스템) 태그**: 파란색 진한 톤
- **개인 태그**: 연회색 + 본인만 삭제 가능
- **내용 기반 추천**: 전체 내용 포함 + suffix 보조 + 최대 5개 + 더보기 + dismiss
- 개인 태그는 타 사용자에게 비공개

---

## 8. 다음 작업자를 위한 시작 가이드

### 8.1 개발 환경 설정
```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 빌드 테스트
npm run build
```

### 8.2 핵심 문서 읽기 (필독)
1. **CONTRACT_SSOT.md** - SSOT 규약 및 개발 원칙
2. **PROJECT_OVERVIEW.md** (본 문서) - 프로젝트 구조 요약

### 8.3 코드 수정 시 주의사항
- 변경은 작게(1~2파일) 후 빌드 확인
- 페이지에 로직 추가 금지 → SSOT로
- 동일 기능 2번 발견 시 → SSOT로 승격
- `npm run build` 반드시 통과해야 함

### 8.4 참고 파일 경로
- 라우트: [src/app/routes.tsx](company-docs/src/app/routes.tsx)
- 스키마: [src/domain/schema/daily/](company-docs/src/domain/schema/daily/)
- SSOT: [src/ssot/](company-docs/src/ssot/)
- 데이터 저장소: [src/data/repo.ts](company-docs/src/data/repo.ts)

---

## 9. 현재 진행 상황

✅ **완료된 항목:**
- 기본 프로젝트 구조 확립
- 기준정보 등록 페이지 (거래처/차량/설비/직원/업체/기관/소모품)
- 일일기록 등록 페이지 (생산/유통/사무)
- 이슈/조치 등록 페이지
- 로컬 저장소 구현
- 스키마 정의 (production, logistics, office, issue, action)

🚧 **진행 중/계획:**
- SSOT 폴더 정비 및 재export 구조 확립
- 연계 엔진(LinkPicker) 완성
- 태그 엔진 완성
- 조회/보고서 기능 구현
- 서버 이식 준비 (권한/보안)

---

**문서 버전:** 1.0  
**마지막 업데이트:** 2026-02-04

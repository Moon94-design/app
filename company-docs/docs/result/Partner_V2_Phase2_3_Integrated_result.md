# Partner V2 (Phase2+3) — 입력/수정 모드 분리 + 코드 비노출 + 거래프로필 조합리스트

**2025-02-06** | Phase: Partner V2 Phase2+3 통합

---

## TL;DR

Partner V2를 실사용 가능하게 만들기 위한 UI/모델 개선 완료. mode 분리(create/edit), partnerCode 비노출, tradeProfiles 조합 리스트, 입력 순서 확정(거래처명→ note→ 담당자→ contactMemo→ 프로필→ 중요도/관계현황→ 기타 Base). 기존 기능 변경 없이 병렬 추가. 빌드 PASS (517ms, 773.82 kB).

---

## 📋 Summary

### Changed

**데이터 모델** ([partnerV2Types.ts](../src/app/pages/register/partner/partnerV2Types.ts)):
- `PartnerExtra` 필드 추가: `importance: "상"|"중"|"하"`, `relationshipStatus: "상"|"중"|"하"`
- `tradeProfile` (체크박스 배열) → `tradeProfiles: TradeProfileItem[]` (조합 리스트)
- `TradeProfileItem` 타입: `{ direction, item, kind, memo? }`
- 기본값: importance="중", relationshipStatus="중", tradeProfiles=[]

**V2 화면** ([RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx)):
- `mode` prop 지원: "create" (신규 등록) | "edit" (관리 수정)
- **mode="create"**: 입력 순서=조회 순서 (거래처명 → note → 담당자 → contactMemo → tradeProfiles → 중요도/관계현황 → 대표자/연락처/주소/사업자번호)
- **mode="edit"**: Base(읽기 전용, 위) / Extra(편집, 아래) 섹션 분리
- **partnerCode 완전 비노출**: UI 어디에도 표시하지 않음 (내부키만)
- **tradeProfiles UI**: 
  - 배열 관리 (추가/삭제 가능)
  - 각 행: direction(매입/매출) + item(PP/PE) + kind(압축/분쇄/펠렛) + memo(선택)
- **중요도/관계현황**: 각각 select (상/중/하)
- 최근 등록 리스트에서 partnerCode 제거 (대표: {ceoName}만 표시)

**관리 화면** ([ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx)):
- **partnerCode 노출 제거**: 리스트에서 거래처명만 표시
- **mode="edit" 전달**: row 클릭 시 RegisterPartnerV2에 mode="edit" 전달
- 완료 배지/필터 유지 (note 기준)

**연결 화면** ([RegisterPartner.tsx](../src/app/pages/register/RegisterPartner.tsx)):
- **mode="create" 전달**: V2 열기 시 mode="create" 전달

### Not Changed

- 기존 RegisterPartner (레거시) 기능: 동작 변경 0
- partners 키, repo.partners() 메서드: 유지 (partners_v2와 분리)
- keys.ts, localRepo.ts: 기존 코드 유지
- 완료 기준: note 비어있지 않으면 완료 (변경 없음)

---

## 📄 Files Changed

| File | Lines | Status | Description |
|------|-------|--------|-------------|
| [partnerV2Types.ts](../src/app/pages/register/partner/partnerV2Types.ts) | ~100 | ✅ Modified | importance, relationshipStatus 추가, tradeProfiles 변경 |
| [RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx) | 475 | ✅ Rewritten | mode 분리, partnerCode 비노출, tradeProfiles UI, 입력 순서 확정 |
| [ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx) | ~110 | ✅ Modified | partnerCode 비노출, mode="edit" 전달 |
| [RegisterPartner.tsx](../src/app/pages/register/RegisterPartner.tsx) | +1 | ✅ Modified | mode="create" 전달 |

**Total**: 4 files

---

## 🧪 Build Gate

### 최종 빌드 결과

```bash
$ npm run build
> company-docs@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 98 modules transformed.
dist/index.html                 0.45 kB │ gzip:   0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip:   1.59 kB
dist/assets/index-C0rdog2T.js   773.82 kB │ gzip: 227.88 kB
✓ built in 517ms
```

**상태**: ✅ **PASS** (517ms, 773.82 kB)

**TypeScript**: 0 errors  
**Vite**: 0 errors

---

## ⚠️ Risks / Notes

### 완료 사항

- ✅ partnerCode UI 완전 비노출 (내부키로만 유지)
- ✅ mode 분리 (create: 입력 순서=조회 순서, edit: Base/Extra 섹션 분리)
- ✅ tradeProfiles 조합 리스트 UI (추가/삭제 가능)
- ✅ 입력/조회 순서 확정 (거래처명 → note → 담당자 → contactMemo → 프로필 → 중요도/관계현황 → 기타 Base)
- ✅ importance, relationshipStatus 추가 (기본값: 중)

### 호환성 메모

- **기존 partners_v2 데이터**: tradeProfile 필드가 있는 경우
  - defaultPartnerV2Draft()가 tradeProfiles=[] 빈 배열로 초기화
  - 기존 데이터 손실 없음 (Base/Extra 분리는 그대로)
  - 프로필 정보는 재입력 필요 (구조 변경)

- **partnerCode 자동 생성**: 신규 등록 시 `PC_{timestamp}` 형식

### 알려진 제약

- **엑셀 업로드 미구현**: 현재는 수동 입력만 가능 (Phase5-2에서 구현 예정)
- **Base 정보 수정 제한**: mode="edit"에서 Base는 읽기 전용 (엑셀 기반)
- **프로필 마이그레이션**: 기존 tradeProfile(체크박스) 데이터는 자동 변환 미지원

---

## 📝 Next Steps

**단기**: Phase5-2 — 엑셀 업로드 MVP-1 (Base 정보 자동 입력, 중복 검증, 완료 안내)

---

<details>
<summary>📂 Appendix (세부 사항)</summary>

## 데이터 모델 변경 상세

### PartnerExtra 변경 (before → after)

**Before** (Phase1):
```typescript
type PartnerExtra = {
  note: string;
  contactMemo?: string;
  tradeProfile?: TradeProfile; // 체크박스 배열 (direction[], item[], kind[])
  custom?: Record<string, any>;
};
```

**After** (Phase2+3):
```typescript
type PartnerExtra = {
  note: string;
  contactMemo?: string;
  importance: "상" | "중" | "하"; // 추가 (기본: 중)
  relationshipStatus: "상" | "중" | "하"; // 추가 (기본: 중)
  tradeProfiles: TradeProfileItem[]; // 조합 리스트
  custom?: Record<string, any>;
};

type TradeProfileItem = {
  direction: "매입" | "매출";
  item: "PP" | "PE";
  kind: "압축" | "분쇄" | "펠렛";
  memo?: string;
};
```

### tradeProfile → tradeProfiles 처리 방식

**기존 데이터 (Phase1)**:
```json
{
  "extra": {
    "tradeProfile": {
      "direction": ["매입"],
      "item": ["PP"],
      "kind": ["압축", "분쇄"]
    }
  }
}
```

**새 데이터 (Phase2+3)**:
```json
{
  "extra": {
    "tradeProfiles": [
      { "direction": "매입", "item": "PP", "kind": "압축", "memo": "" },
      { "direction": "매입", "item": "PP", "kind": "분쇄", "memo": "" }
    ]
  }
}
```

**마이그레이션**: 현재 자동 변환 미지원 (defaultPartnerV2Draft()는 빈 배열로 초기화)
- Phase1 데이터는 수동으로 프로필 재입력 필요
- 다음 단계에서 마이그레이션 스크립트 추가 고려

## UI 변경 상세

### mode="create" (신규 등록)

**입력 순서** (=조회 순서):
1. 거래처명 * (필수)
2. 거래처 메모(note) * (필수, 완료 기준)
3. 담당자 (담당자명 + 담당자 휴대폰)
4. 담당자 참고사항(contactMemo)
5. 거래 프로필(tradeProfiles 리스트)
   - 각 행: direction + item + kind + memo
   - + 프로필 추가 버튼
6. 중요도 / 관계현황 (select: 상/중/하)
7. 대표자
8. 연락처
9. 주소 (우편번호 + 주소1 + 주소2)
10. 사업자번호

**Base/Extra 구분 최소화**: 모든 필드가 입력 가능 (단, 순서만 명확히)

### mode="edit" (관리 수정)

**Base 섹션** (읽기 전용, 위):
- 거래처명, 대표자, 연락처, 주소, 담당자, 사업자번호 (읽기 전용)
- ※ Base 정보는 엑셀에서 수정합니다.

**Extra 섹션** (편집 가능, 아래):
- 거래처 메모(note) *
- 담당자 (읽기 전용)
- 담당자 참고사항(contactMemo)
- 거래 프로필(tradeProfiles)
- 중요도 / 관계현황

## partnerCode 처리

**신규 등록 (mode="create")**:
- partnerCode 입력칸 없음
- 저장 시 자동 생성: `PC_{Date.now()}`
- UI에 표시하지 않음

**수정 (mode="edit")**:
- 기존 partnerCode 유지 (내부적으로만)
- UI에 표시하지 않음

**관리 리스트 (ManageMaster)**:
- 이전: 거래처명(partnerCode) 표시
- 현재: 거래처명만 표시 (partnerCode 제거)

## 완료 기준 (변경 없음)

```typescript
function isCompleted(extra: PartnerExtra): boolean {
  return !!extra.note && extra.note.trim().length > 0;
}
```

- note가 비어있지 않으면 완료 (파랑 배지)
- note가 비어있으면 미입력 (빨강 배지)

</details>

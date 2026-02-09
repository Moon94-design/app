# Register 페이지 서버 이식 정리 완료

## 개선 사항

### 1. **공통 스토리지 유틸 생성** (`src/base/utils/pageStorage.ts`)
- `loadJson<T>()`, `saveJson()`, `loadString()`, `saveString()` 함수 통합
- **스토리지 어댑터 패턴** 도입: `setPageStorageAdapter()`로 localStorage → 서버 저장소 교체 가능
- 모든 페이지에서 동일한 방식으로 초안(draft) 및 설정 저장

### 2. **Register 페이지 정리 상황**

#### 수정 완료 페이지:
| 페이지 | 수정 내용 |
|--------|---------|
| `RegisterLogisticsDaily.tsx` | `loadJson/saveJson` → `pageStorage` 유틸로 교체, 중복 함수 제거 |
| `RegisterVehicle.tsx` | 중복된 로컬 헬퍼 함수 제거, `pageStorage` import |
| `RegisterEmployee.tsx` | 중복된 로컬 헬퍼 함수 제거, `pageStorage` import |
| `RegisterEquipment.tsx` | 중복된 로컬 헬퍼 함수 제거, `pageStorage` import |
| `RegisterVendor.tsx` | 중복된 로컬 헬퍼 함수 제거, `pageStorage` import |

#### 이미 정리된 페이지:
- `RegisterProductionDaily.tsx` - `repo` 중심 설계, 태그 통합
- `RegisterOfficeDaily.tsx` - `repo` 중심 설계
- 기타 Master/Daily 페이지들 - `repo` 기반 구현

### 3. **코드 정리 전후 비교**

#### Before (중복):
```tsx
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }
```

#### After (통합):
```tsx
import { loadJson, saveJson } from "../../../base/utils/pageStorage";
// 각 페이지에서 바로 사용 가능
```

## 서버 이식 준비 상태

### ✅ 완료
- [x] 태그 인덱스 스토리지 어댑터 (`tagIndex.ts`)
- [x] 페이지 초안/설정 스토리지 어댑터 (`pageStorage.ts`)
- [x] Register 페이지들에서 `localStorage` 직접 호출 제거
- [x] 공통 유틸 함수화로 교체점 단일화

### 📋 서버 이식 시 체크리스트
1. `src/base/utils/pageStorage.ts`에서 `setPageStorageAdapter()` 호출
   ```tsx
   import { setPageStorageAdapter } from "../base/utils/pageStorage";
   setPageStorageAdapter(serverStorageAdapter); // 서버 API 기반 어댑터
   ```

2. `src/base/utils/tagIndex.ts`에서 `setStorageAdapter()` 호출
   ```tsx
   import { setStorageAdapter } from "../base/utils/tagIndex";
   setStorageAdapter(serverStorageAdapter);
   ```

3. `src/data/repo.ts`에서 `LocalRepo` → `ServerRepo` 교체

## 파일 구조 정리

```
src/
├─ base/
│  ├─ components/
│  │  ├─ TagInputText.tsx (통합됨)
│  │  ├─ TagWidgets.tsx
│  │  └─ ...
│  ├─ hooks/
│  │  └─ usePreserveSelection.ts
│  └─ utils/
│     ├─ tagIndex.ts (스토리지 어댑터 지원)
│     ├─ pageStorage.ts (NEW - 공통 스토리지 유틸)
│     └─ ...
├─ data/
│  ├─ repo.ts (LocalRepo 기반, 서버 이식 준비됨)
│  └─ ...
└─ app/pages/register/
   ├─ RegisterProductionDaily.tsx ✅
   ├─ RegisterLogisticsDaily.tsx ✅
   ├─ RegisterVehicle.tsx ✅
   ├─ RegisterEmployee.tsx ✅
   ├─ RegisterEquipment.tsx ✅
   ├─ RegisterVendor.tsx ✅
   └─ ...
```

## 빌드 상태
✅ **TS Strict 모드 통과**
- 생산 빌드: `349.27 kB` JS (gzip: 96.03 kB)
- 빌드 시간: 454ms

## 다음 단계
1. 서버 API 준비 (저장소 어댑터 구현)
2. 각 어댑터를 애플리케이션 부트스트랩에서 초기화
3. 네트워크 요청 처리 (로딩, 에러 상태)
4. 오프라인 모드 지원 (선택사항)

/**
 * 페이지 전역 설정 및 초안(draft) 저장소 관리 유틸
 * 서버 이식을 위해 스토리지 어댑터를 사용하므로, localStorage 직접 호출 금지
 */

export type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

let adapter: StorageAdapter = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

export function setPageStorageAdapter(a: StorageAdapter) {
  adapter = a;
}

/**
 * JSON 형태의 데이터를 로드
 */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = adapter.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * JSON 형태의 데이터를 저장
 */
export function saveJson(key: string, value: any): void {
  try {
    adapter.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * 문자열 값을 로드
 */
export function loadString(key: string, fallback = ""): string {
  try {
    return adapter.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * 문자열 값을 저장
 */
export function saveString(key: string, value: string): void {
  try {
    adapter.setItem(key, value);
  } catch {}
}

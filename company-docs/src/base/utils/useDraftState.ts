import { useEffect, useState } from "react";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * B방식: 공통 Draft 훅
 * - key로 localStorage에 자동 저장/복원
 * - 값이 바뀌면 즉시 저장
 */
export function useDraftState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => loadJson<T>(key, initial));

  useEffect(() => {
    saveJson(key, state);
  }, [key, state]);

  const reset = () => setState(initial);
  const clear = () => {
    try { localStorage.removeItem(key); } catch {}
    setState(initial);
  };

  return { state, setState, reset, clear };
}

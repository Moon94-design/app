import { useCallback } from "react";
import type { RefObject } from "react";

export default function usePreserveSelection(ref: RefObject<HTMLTextAreaElement | HTMLInputElement | null>) {
  return useCallback(<T,>(fn: () => T) => {
    const el = ref.current as HTMLTextAreaElement | HTMLInputElement | null;
    const sel = el ? { start: (el as any).selectionStart, end: (el as any).selectionEnd } : null;
    const res = fn();
    setTimeout(() => {
      if (!el) return;
      try {
        el.focus();
        if (sel && typeof (el as any).setSelectionRange === "function") {
          (el as any).setSelectionRange(sel.start, sel.end);
        }
      } catch {}
    }, 0);
    return res;
  }, [ref]);
}

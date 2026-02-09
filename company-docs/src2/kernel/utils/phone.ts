// ORIGIN: copied from src/base/utils/phone.ts (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

export function formatPhoneInput(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("02")) {
    const d = digits.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }

  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

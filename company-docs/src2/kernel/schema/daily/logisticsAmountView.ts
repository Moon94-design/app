import type { Direction, LogisticsLine } from "./logisticsTypes";
import type { ReturnStatusInfo } from "./logisticsReturnStatus";

export type LogisticsTone = "inbound" | "outbound" | "neutral";

export type LogisticsAmountView = {
  amount: number;
  tone: LogisticsTone;
  includeInNetTotal: boolean;
};

function toSafeNumber(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num;
}

export function getDirectionTone(direction: Direction): LogisticsTone {
  if (direction === "매입") return "inbound";
  if (direction === "출고") return "outbound";
  return "neutral";
}

export function getLogisticsLineAmountView(args: {
  line: LogisticsLine;
  netKg: number;
  returnStatus: ReturnStatusInfo | null;
}): LogisticsAmountView {
  const { line, netKg, returnStatus } = args;
  const unitPrice = toSafeNumber(line.unitPricePerKg);

  if (line.isReturn) {
    const returnedKg = returnStatus?.returnedKg ?? toSafeNumber(line.returnedKg ?? line.kg ?? 0);
    return {
      amount: returnedKg * unitPrice,
      tone: "neutral",
      includeInNetTotal: false,
    };
  }

  const amount = Math.max(0, toSafeNumber(netKg)) * unitPrice;
  if (returnStatus?.role === "return-target" && amount <= 0) {
    return {
      amount: 0,
      tone: "neutral",
      includeInNetTotal: true,
    };
  }

  return {
    amount,
    tone: getDirectionTone(line.direction),
    includeInNetTotal: true,
  };
}

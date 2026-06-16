import type { Pool } from "./types";

export function currencyFormat(currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function poolTotals(pools: Pool[]) {
  const netContributions = pools.reduce((s, p) => s + p.netContributions, 0);
  const portfolioValue = pools.reduce((s, p) => s + p.portfolioValue, 0);
  return {
    netContributions,
    portfolioValue,
    returnAmount: portfolioValue - netContributions,
  };
}

export function returnLabel(value: number) {
  if (value > 0) return "Gain";
  if (value < 0) return "Drawdown";
  return "Flat";
}

export function signedAmount(value: number, formatted: string) {
  return value > 0 ? `+${formatted}` : formatted;
}

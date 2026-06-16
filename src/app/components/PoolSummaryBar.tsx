"use client";

import { CircleDollarSign, Landmark, Layers3, LineChart } from "lucide-react";
import type { Pool } from "@/lib/types";
import { currencyFormat, poolTotals, returnLabel, signedAmount } from "@/lib/utils";
import { Metric } from "./Metric";

export function PoolSummaryBar({ pools, currency }: { pools: Pool[]; currency: string }) {
  const fmt = currencyFormat(currency);
  const { portfolioValue, netContributions, returnAmount } = poolTotals(pools);

  return (
    <section className="metrics-grid">
      <Metric icon={<Landmark />} label="Portfolio value" value={fmt.format(portfolioValue)} />
      <Metric icon={<CircleDollarSign />} label="Net contributions" value={fmt.format(netContributions)} />
      <Metric icon={<LineChart />} label={returnLabel(returnAmount)} value={signedAmount(returnAmount, fmt.format(returnAmount))} />
      <Metric icon={<Layers3 />} label="Active pools" value={String(pools.length)} />
    </section>
  );
}

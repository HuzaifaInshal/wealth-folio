"use client";

import { BarChart3, CircleDollarSign, Layers3, LineChart, Plus, UserRound, WalletCards } from "lucide-react";
import { FormEvent, useState } from "react";
import { appConfig } from "@/lib/config";
import type { WealthFlow } from "@/lib/types";
import { useWealthStore } from "@/lib/use-wealth-store";
import { currencyFormat, poolTotals, returnLabel, signedAmount } from "@/lib/utils";
import { Metric } from "../components/Metric";

export function Dashboard({ onOpenFlow, onProfile }: { onOpenFlow: (id: string) => void; onProfile: () => void }) {
  const { data, backend, addFlow } = useWealthStore();
  const fmt = currencyFormat(data.profile.baseCurrency);
  const totals = poolTotals(data.pools);

  const [flowName, setFlowName] = useState("");
  const [category, setCategory] = useState<WealthFlow["category"]>("Savings");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!flowName.trim()) return;
    addFlow({ name: flowName.trim(), category, description: "New wealth lifecycle ready for pools, actions, and transfers." });
    setFlowName("");
    setCategory("Savings");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">{appConfig.appName}</p>
          <h1>Portfolio command center</h1>
        </div>
        <button className="icon-button" onClick={onProfile} title="Open profile">
          <UserRound size={19} />
          <span>Profile</span>
        </button>
      </section>

      <section className="metrics-grid">
        <Metric icon={<WalletCards />} label="Portfolio value" value={fmt.format(totals.portfolioValue)} />
        <Metric icon={<CircleDollarSign />} label="Net contributions" value={fmt.format(totals.netContributions)} />
        <Metric icon={<LineChart />} label={returnLabel(totals.returnAmount)} value={signedAmount(totals.returnAmount, fmt.format(totals.returnAmount))} />
        <Metric icon={<Layers3 />} label="Data backend" value={backend === "local" ? "Local state" : "Supabase"} />
      </section>

      <section className="content-grid">
        <div className="panel panel--wide">
          <div className="section-title">
            <div>
              <p className="eyebrow">Flows</p>
              <h2>Investment lifecycles</h2>
            </div>
          </div>
          <div className="flow-list">
            {data.flows.map((flow) => {
              const flowPools = data.pools.filter((p) => p.flowId === flow.id);
              const ft = poolTotals(flowPools);
              return (
                <button key={flow.id} className="flow-row" onClick={() => onOpenFlow(flow.id)}>
                  <div className="flow-row__icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <strong>{flow.name}</strong>
                    <span>{flow.description}</span>
                  </div>
                  <div className="flow-row__stats">
                    <strong>{fmt.format(ft.portfolioValue)}</strong>
                    <span>{flowPools.length} pools</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form className="panel compact-form" onSubmit={submit}>
          <div>
            <p className="eyebrow">Create</p>
            <h2>New flow</h2>
          </div>
          <label>
            Flow name
            <input value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder="e.g. Retirement plan" />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as WealthFlow["category"])}>
              <option>Savings</option>
              <option>Stocks</option>
              <option>Real Estate</option>
              <option>Retirement</option>
              <option>Crypto</option>
            </select>
          </label>
          <button className="primary-button">
            <Plus size={17} />
            Add flow
          </button>
        </form>
      </section>
    </main>
  );
}

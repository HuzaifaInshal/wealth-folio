"use client";

import { useState } from "react";
import { useWealthStore } from "@/lib/use-wealth-store";
import { PoolSummaryBar } from "../../components/PoolSummaryBar";
import { TimelineView } from "./TimelineView";
import { BuilderView } from "./BuilderView";

type Tab = "timeline" | "builder";

export function FlowWorkspace({ flowId, onBack }: { flowId: string; onBack: () => void }) {
  const { data } = useWealthStore();
  const flow = data.flows.find((f) => f.id === flowId) ?? data.flows[0];
  const pools = data.pools.filter((p) => p.flowId === flow.id);
  const events = data.events.filter((e) => e.flowId === flow.id);
  const transfers = data.transfers.filter((t) => t.flowId === flow.id);

  const [tab, setTab] = useState<Tab>("timeline");

  return (
    <main className="app-shell">
      <button className="back-button" onClick={onBack}>
        ← Back to dashboard
      </button>

      <section className="topbar">
        <div>
          <p className="eyebrow">{flow.category}</p>
          <h1>{flow.name}</h1>
          <p className="muted">{flow.description}</p>
        </div>
      </section>

      <PoolSummaryBar pools={pools} currency={data.profile.baseCurrency} />

      <div className="tab-bar">
        <button className={tab === "timeline" ? "tab-bar__item is-active" : "tab-bar__item"} onClick={() => setTab("timeline")}>
          Timeline view
        </button>
        <button className={tab === "builder" ? "tab-bar__item is-active" : "tab-bar__item"} onClick={() => setTab("builder")}>
          Flow builder
        </button>
      </div>

      {tab === "timeline" ? (
        <TimelineView flowId={flow.id} pools={pools} events={events} transfers={transfers} currency={data.profile.baseCurrency} />
      ) : (
        <BuilderView pools={pools} transfers={transfers} currency={data.profile.baseCurrency} />
      )}
    </main>
  );
}

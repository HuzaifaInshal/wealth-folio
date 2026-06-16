"use client";

import type { Pool, TimelineEvent, Transfer } from "@/lib/types";
import { currencyFormat } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  cash_in: "Cash In",
  cash_out: "Cash Out",
  info_update: "Info Update",
};

export function ActivityFeed({
  events,
  transfers,
  pools,
  currency,
}: {
  events: TimelineEvent[];
  transfers: Transfer[];
  pools: Pool[];
  currency: string;
}) {
  const fmt = currencyFormat(currency);
  const poolName = (id: string) => pools.find((p) => p.id === id)?.name ?? id;

  return (
    <section className="activity-grid">
      <div className="panel">
        <h2>Recent timeline</h2>
        <div className="activity-list">
          {events.length === 0 && <p className="muted">No events yet.</p>}
          {events.map((ev) => (
            <div className="activity-item" key={ev.id}>
              <strong>{ACTION_LABELS[ev.type] ?? ev.type}</strong>
              <span>
                {poolName(ev.poolId)}
                {ev.amount != null ? ` — ${fmt.format(ev.amount)}` : ""}
                {ev.note ? ` — ${ev.note}` : ""}
              </span>
              <small>{ev.happenedAt}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Transfers</h2>
        <div className="activity-list">
          {transfers.length === 0 && <p className="muted">No transfers yet.</p>}
          {transfers.map((t) => (
            <div className="activity-item" key={t.id}>
              <strong>{fmt.format(t.amount)}</strong>
              <span>
                {poolName(t.fromPoolId)} → {poolName(t.toPoolId)}
                {t.note ? ` — ${t.note}` : ""}
              </span>
              <small>{t.happenedAt}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

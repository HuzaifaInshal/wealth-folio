"use client";

import { ArrowLeftRight, Plus } from "lucide-react";
import type { Pool, TimelineEvent, Transfer } from "@/lib/types";
import { useFlowForms } from "@/lib/hooks/useFlowForms";
import { ActivityFeed } from "../../components/ActivityFeed";

export function TimelineView({
  flowId,
  pools,
  events,
  transfers,
  currency,
}: {
  flowId: string;
  pools: Pool[];
  events: TimelineEvent[];
  transfers: Transfer[];
  currency: string;
}) {
  const firstPoolId = pools[0]?.id ?? "";
  const secondPoolId = pools[1]?.id ?? firstPoolId;
  const { timeline, pool: poolForm, transferForm } = useFlowForms(flowId, firstPoolId, secondPoolId);

  return (
    <>
      <section className="workspace-grid">
        {/* Record action */}
        <div className="panel">
          <p className="eyebrow">Timeline</p>
          <h2>Record action</h2>
          <form className="stacked-form" onSubmit={timeline.submitAction}>
            <label>
              Pool
              <select value={timeline.poolId} onChange={(e) => timeline.setPoolId(e.target.value)}>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="segmented">
              {(["cash_in", "cash_out", "info_update"] as const).map((type) => (
                <button key={type} type="button" className={timeline.actionType === type ? "is-active" : ""} onClick={() => timeline.setActionType(type)}>
                  {type === "cash_in" ? "Cash In" : type === "cash_out" ? "Cash Out" : "Info Update"}
                </button>
              ))}
            </div>

            {timeline.actionType === "info_update" ? (
              <>
                <label>
                  Update field
                  <select value={timeline.field} onChange={(e) => timeline.setField(e.target.value as typeof timeline.field)}>
                    <option value="portfolioValue">Portfolio value</option>
                    <option value="netContributions">Net contributions</option>
                  </select>
                </label>
                <label>
                  New value
                  <input type="number" min="0" value={timeline.newValue} onChange={(e) => timeline.setNewValue(Number(e.target.value))} />
                </label>
              </>
            ) : (
              <label>
                Amount
                <input type="number" min="0" value={timeline.amount} onChange={(e) => timeline.setAmount(Number(e.target.value))} />
              </label>
            )}

            <label>
              Note
              <input value={timeline.note} onChange={(e) => timeline.setNote(e.target.value)} placeholder="Short action memo" />
            </label>
            <button className="primary-button">Add timeline item</button>
          </form>
        </div>

        {/* Add pool */}
        <div className="panel">
          <p className="eyebrow">Pools</p>
          <h2>Add starting point</h2>
          <form className="stacked-form" onSubmit={poolForm.submitPool}>
            <label>
              Pool name
              <input value={poolForm.poolName} onChange={(e) => poolForm.setPoolName(e.target.value)} placeholder="Brokerage, bank, wallet…" />
            </label>
            <label>
              Type
              <select value={poolForm.poolKind} onChange={(e) => poolForm.setPoolKind(e.target.value as typeof poolForm.poolKind)}>
                <option value="investment">Investment</option>
                <option value="savings">Savings</option>
                <option value="cash">Cash</option>
              </select>
            </label>
            <label>
              Opening amount
              <input type="number" min="0" value={poolForm.openingAmount} onChange={(e) => poolForm.setOpeningAmount(Number(e.target.value))} />
            </label>
            <label>
              Notes
              <input value={poolForm.poolNotes} onChange={(e) => poolForm.setPoolNotes(e.target.value)} placeholder="Optional notes" />
            </label>
            <button className="secondary-button">
              <Plus size={17} />
              Add pool
            </button>
          </form>
        </div>

        {/* Transfer */}
        <div className="panel">
          <p className="eyebrow">Transfer</p>
          <h2>Move between pools</h2>
          <form className="stacked-form" onSubmit={transferForm.submitTransfer}>
            <label>
              From
              <select value={transferForm.transferFrom} onChange={(e) => transferForm.setTransferFrom(e.target.value)}>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To
              <select value={transferForm.transferTo} onChange={(e) => transferForm.setTransferTo(e.target.value)}>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input type="number" min="0" value={transferForm.transferAmount} onChange={(e) => transferForm.setTransferAmount(Number(e.target.value))} />
            </label>
            <label>
              Note
              <input value={transferForm.transferNote} onChange={(e) => transferForm.setTransferNote(e.target.value)} placeholder="Optional note" />
            </label>
            <button className="secondary-button">
              <ArrowLeftRight size={17} />
              Transfer
            </button>
          </form>
        </div>
      </section>

      <ActivityFeed events={events} transfers={transfers} pools={pools} currency={currency} />
    </>
  );
}

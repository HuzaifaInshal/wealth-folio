"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  ArrowLeftRight,
  BarChart3,
  CircleDollarSign,
  Landmark,
  Layers3,
  LineChart,
  Plus,
  UserRound,
  WalletCards,
} from "lucide-react";
import { DragEvent, FormEvent, useMemo, useState } from "react";
import { appConfig } from "@/lib/config";
import { WealthStoreProvider, useWealthStore } from "@/lib/use-wealth-store";
import type { InfoUpdateField, Pool, PoolKind, TimelineActionType, WealthFlow } from "@/lib/types";

type Screen = "dashboard" | "profile" | "flow";

type FlowNodeData = {
  label: string;
  kind: PoolKind;
  netContributions: number;
  portfolioValue: number;
  notes: string;
};

const currencyFormat = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

function poolTotals(pools: Pool[]) {
  const netContributions = pools.reduce((sum, pool) => sum + pool.netContributions, 0);
  const portfolioValue = pools.reduce((sum, pool) => sum + pool.portfolioValue, 0);

  return {
    netContributions,
    portfolioValue,
    returnAmount: portfolioValue - netContributions,
  };
}

function metricLabel(value: number) {
  if (value > 0) return "Gain";
  if (value < 0) return "Drawdown";
  return "Flat";
}

function FlowPoolNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const performance = data.portfolioValue - data.netContributions;

  return (
    <div className="flow-node">
      <Handle type="target" position={Position.Top} />
      <div className="flow-node__header">
        <span>{data.label}</span>
        <small>{data.kind}</small>
      </div>
      <div className="flow-node__body">
        <span>Current value</span>
        <strong>${data.portfolioValue.toLocaleString()}</strong>
      </div>
      <div className="flow-node__body">
        <span>Net contributions</span>
        <strong>${data.netContributions.toLocaleString()}</strong>
      </div>
      <div className={performance >= 0 ? "flow-node__gain" : "flow-node__loss"}>
        {performance >= 0 ? "+" : ""}
        {performance.toLocaleString()} return
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { pool: FlowPoolNode };

function Dashboard({
  onOpenFlow,
  onProfile,
}: {
  onOpenFlow: (id: string) => void;
  onProfile: () => void;
}) {
  const { data, backend, addFlow } = useWealthStore();
  const format = currencyFormat(data.profile.baseCurrency);
  const totals = poolTotals(data.pools);
  const [flowName, setFlowName] = useState("");
  const [category, setCategory] = useState<WealthFlow["category"]>("Savings");

  function submitFlow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!flowName.trim()) return;

    addFlow({
      name: flowName.trim(),
      category,
      description: "New wealth lifecycle ready for pools, actions, and transfers.",
    });
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
        <Metric icon={<WalletCards />} label="Current value" value={format.format(totals.portfolioValue)} />
        <Metric icon={<CircleDollarSign />} label="Net contributions" value={format.format(totals.netContributions)} />
        <Metric icon={<LineChart />} label={metricLabel(totals.returnAmount)} value={format.format(totals.returnAmount)} />
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
              const pools = data.pools.filter((pool) => pool.flowId === flow.id);
              const flowTotals = poolTotals(pools);

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
                    <strong>{format.format(flowTotals.portfolioValue)}</strong>
                    <span>{pools.length} pools</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form className="panel compact-form" onSubmit={submitFlow}>
          <div>
            <p className="eyebrow">Create</p>
            <h2>New flow</h2>
          </div>
          <label>
            Flow name
            <input value={flowName} onChange={(event) => setFlowName(event.target.value)} placeholder="e.g. Retirement plan" />
          </label>
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value as WealthFlow["category"])}>
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

function Profile({ onBack }: { onBack: () => void }) {
  const { data, updateProfile } = useWealthStore();
  const [profile, setProfile] = useState(data.profile);

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(profile);
    onBack();
  }

  return (
    <main className="app-shell">
      <button className="back-button" onClick={onBack}>
        Back to dashboard
      </button>
      <form className="profile-panel" onSubmit={submitProfile}>
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Household settings</h1>
        </div>
        <div className="form-grid">
          <label>
            Display name
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label>
            Base currency
            <input value={profile.baseCurrency} onChange={(event) => setProfile({ ...profile, baseCurrency: event.target.value.toUpperCase() })} />
          </label>
          <label>
            Monthly savings target
            <input
              type="number"
              min="0"
              value={profile.targetMonthlySavings}
              onChange={(event) => setProfile({ ...profile, targetMonthlySavings: Number(event.target.value) })}
            />
          </label>
          <label>
            Risk style
            <select value={profile.riskStyle} onChange={(event) => setProfile({ ...profile, riskStyle: event.target.value as typeof profile.riskStyle })}>
              <option>Conservative</option>
              <option>Balanced</option>
              <option>Growth</option>
            </select>
          </label>
        </div>
        <button className="primary-button">Save profile</button>
      </form>
    </main>
  );
}

function FlowWorkspace({ flowId, onBack }: { flowId: string; onBack: () => void }) {
  const { data, addEvent, addPool, transfer } = useWealthStore();
  const flow = data.flows.find((item) => item.id === flowId) ?? data.flows[0];
  const pools = data.pools.filter((pool) => pool.flowId === flow.id);
  const events = data.events.filter((event) => event.flowId === flow.id);
  const transfers = data.transfers.filter((item) => item.flowId === flow.id);
  const totals = poolTotals(pools);
  const format = currencyFormat(data.profile.baseCurrency);

  const initialNodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      pools.map((pool, index) => ({
        id: pool.id,
        type: "pool",
        position: { x: 80 + (index % 3) * 260, y: 80 + Math.floor(index / 3) * 190 },
        data: {
          label: pool.name,
          kind: pool.kind,
          netContributions: pool.netContributions,
          portfolioValue: pool.portfolioValue,
          notes: pool.notes,
        },
      })),
    [pools],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      transfers.map((item) => ({
        id: item.id,
        source: item.fromPoolId,
        target: item.toPoolId,
        animated: true,
        label: format.format(item.amount),
      })),
    [format, transfers],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [actionType, setActionType] = useState<TimelineActionType>("cash_in");
  const [poolId, setPoolId] = useState(pools[0]?.id ?? "");
  const [amount, setAmount] = useState(500);
  const [field, setField] = useState<InfoUpdateField>("portfolioValue");
  const [newValue, setNewValue] = useState(0);
  const [note, setNote] = useState("");
  const [poolName, setPoolName] = useState("");
  const [poolKind, setPoolKind] = useState<PoolKind>("investment");
  const [openingAmount, setOpeningAmount] = useState(1000);
  const [transferFrom, setTransferFrom] = useState(pools[0]?.id ?? "");
  const [transferTo, setTransferTo] = useState(pools[1]?.id ?? pools[0]?.id ?? "");
  const [transferAmount, setTransferAmount] = useState(250);

  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialEdges, initialNodes, setEdges, setNodes]);

  function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!poolId) return;

    addEvent({
      flowId: flow.id,
      poolId,
      type: actionType,
      amount: actionType === "info_update" ? undefined : amount,
      field: actionType === "info_update" ? field : undefined,
      newValue: actionType === "info_update" ? newValue : undefined,
      note,
    });
    setNote("");
  }

  function submitPool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!poolName.trim()) return;

    addPool({
      flowId: flow.id,
      name: poolName.trim(),
      kind: poolKind,
      openingAmount,
      notes: "Added from flow workspace.",
    });
    setPoolName("");
  }

  function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transferFrom || !transferTo || transferFrom === transferTo) return;

    transfer({
      flowId: flow.id,
      fromPoolId: transferFrom,
      toPoolId: transferTo,
      amount: transferAmount,
      note: "Internal pool transfer.",
    });
  }

  function onConnect(connection: Connection) {
    setEdges((currentEdges) => addEdge({ ...connection, animated: true }, currentEdges));
  }

  function onDragStart(event: DragEvent<HTMLButtonElement>, kind: PoolKind) {
    event.dataTransfer.setData("application/wealth-kind", kind);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/wealth-kind") as PoolKind;
    if (!kind) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const newNode: Node<FlowNodeData> = {
      id: `canvas-${Date.now()}`,
      type: "pool",
      position: { x: event.clientX - bounds.left - 110, y: event.clientY - bounds.top - 60 },
      data: {
        label: `Draft ${kind}`,
        kind,
        netContributions: 0,
        portfolioValue: 0,
        notes: "Draft canvas node. Add a pool to persist it.",
      },
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
  }

  return (
    <main className="app-shell">
      <button className="back-button" onClick={onBack}>
        Back to dashboard
      </button>

      <section className="topbar">
        <div>
          <p className="eyebrow">{flow.category}</p>
          <h1>{flow.name}</h1>
          <p className="muted">{flow.description}</p>
        </div>
      </section>

      <section className="metrics-grid">
        <Metric icon={<Landmark />} label="Current value" value={format.format(totals.portfolioValue)} />
        <Metric icon={<CircleDollarSign />} label="Net contributions" value={format.format(totals.netContributions)} />
        <Metric icon={<LineChart />} label={metricLabel(totals.returnAmount)} value={format.format(totals.returnAmount)} />
        <Metric icon={<Layers3 />} label="Starting pools" value={String(pools.length)} />
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Record action</h2>
          </div>
          <form className="stacked-form" onSubmit={submitAction}>
            <label>
              Pool
              <select value={poolId} onChange={(event) => setPoolId(event.target.value)}>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="segmented">
              {[
                ["cash_in", "Cash in"],
                ["cash_out", "Cash out"],
                ["info_update", "Info update"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={actionType === value ? "is-active" : ""}
                  onClick={() => setActionType(value as TimelineActionType)}
                >
                  {label}
                </button>
              ))}
            </div>
            {actionType === "info_update" ? (
              <>
                <label>
                  Update field
                  <select value={field} onChange={(event) => setField(event.target.value as InfoUpdateField)}>
                    <option value="portfolioValue">Current portfolio value</option>
                    <option value="netContributions">Net contributions</option>
                  </select>
                </label>
                <label>
                  New value
                  <input type="number" min="0" value={newValue} onChange={(event) => setNewValue(Number(event.target.value))} />
                </label>
              </>
            ) : (
              <label>
                Amount
                <input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              </label>
            )}
            <label>
              Note
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Short action memo" />
            </label>
            <button className="primary-button">Add timeline item</button>
          </form>
        </div>

        <div className="panel">
          <div>
            <p className="eyebrow">Pools</p>
            <h2>Starting point</h2>
          </div>
          <form className="stacked-form" onSubmit={submitPool}>
            <label>
              Pool name
              <input value={poolName} onChange={(event) => setPoolName(event.target.value)} placeholder="Brokerage, bank, wallet..." />
            </label>
            <label>
              Type
              <select value={poolKind} onChange={(event) => setPoolKind(event.target.value as PoolKind)}>
                <option value="investment">Investment</option>
                <option value="savings">Savings</option>
                <option value="cash">Cash</option>
              </select>
            </label>
            <label>
              Opening amount
              <input type="number" min="0" value={openingAmount} onChange={(event) => setOpeningAmount(Number(event.target.value))} />
            </label>
            <button className="secondary-button">
              <Plus size={17} />
              Add pool
            </button>
          </form>
        </div>

        <div className="panel">
          <div>
            <p className="eyebrow">Transfer</p>
            <h2>Move between pools</h2>
          </div>
          <form className="stacked-form" onSubmit={submitTransfer}>
            <label>
              From
              <select value={transferFrom} onChange={(event) => setTransferFrom(event.target.value)}>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To
              <select value={transferTo} onChange={(event) => setTransferTo(event.target.value)}>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input type="number" min="0" value={transferAmount} onChange={(event) => setTransferAmount(Number(event.target.value))} />
            </label>
            <button className="secondary-button">
              <ArrowLeftRight size={17} />
              Transfer
            </button>
          </form>
        </div>
      </section>

      <section className="builder-layout">
        <aside className="node-palette">
          <p className="eyebrow">Builder</p>
          <h2>Node list</h2>
          {(["investment", "savings", "cash"] as PoolKind[]).map((kind) => (
            <button key={kind} draggable onDragStart={(event) => onDragStart(event, kind)}>
              <Layers3 size={17} />
              {kind}
            </button>
          ))}
        </aside>
        <div className="flow-canvas" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
        </div>
      </section>

      <section className="activity-grid">
        <div className="panel">
          <h2>Recent timeline</h2>
          <div className="activity-list">
            {events.map((event) => {
              const pool = pools.find((item) => item.id === event.poolId);
              return (
                <div className="activity-item" key={event.id}>
                  <strong>{event.type.replace("_", " ")}</strong>
                  <span>
                    {pool?.name} - {event.note || "No note"}
                  </span>
                  <small>{event.happenedAt}</small>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <h2>Transfers</h2>
          <div className="activity-list">
            {transfers.map((item) => (
              <div className="activity-item" key={item.id}>
                <strong>{format.format(item.amount)}</strong>
                <span>
                  {pools.find((pool) => pool.id === item.fromPoolId)?.name} to {pools.find((pool) => pool.id === item.toPoolId)?.name}
                </span>
                <small>{item.happenedAt}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric-card">
      <div className="metric-card__icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WealthFolioApp() {
  const { data } = useWealthStore();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [activeFlowId, setActiveFlowId] = useState(data.flows[0]?.id ?? "");

  if (screen === "profile") {
    return <Profile onBack={() => setScreen("dashboard")} />;
  }

  if (screen === "flow") {
    return <FlowWorkspace flowId={activeFlowId} onBack={() => setScreen("dashboard")} />;
  }

  return (
    <Dashboard
      onProfile={() => setScreen("profile")}
      onOpenFlow={(id) => {
        setActiveFlowId(id);
        setScreen("flow");
      }}
    />
  );
}

export default function Home() {
  return (
    <WealthStoreProvider>
      <WealthFolioApp />
    </WealthStoreProvider>
  );
}

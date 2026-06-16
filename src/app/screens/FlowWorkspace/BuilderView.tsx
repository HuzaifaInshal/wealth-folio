"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { Banknote, Landmark, TrendingUp } from "lucide-react";
import type { Pool, PoolKind, Transfer } from "@/lib/types";
import { useFlowCanvas } from "@/lib/hooks/useFlowCanvas";
import { flowNodeTypes } from "../../components/FlowPoolNode";

const PALETTE_NODES: { kind: PoolKind; label: string; icon: React.ReactNode }[] = [
  { kind: "investment", label: "Investment", icon: <TrendingUp size={16} /> },
  { kind: "savings", label: "Savings", icon: <Landmark size={16} /> },
  { kind: "cash", label: "Cash", icon: <Banknote size={16} /> },
];

export function BuilderView({ pools, transfers, currency }: { pools: Pool[]; transfers: Transfer[]; currency: string }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragStart, onDrop } = useFlowCanvas(pools, transfers, currency);

  return (
    <section className="builder-layout">
      <aside className="node-palette">
        <p className="eyebrow">Builder</p>
        <h2>Node palette</h2>
        <p className="palette-hint">Drag a node onto the canvas to sketch a new pool.</p>
        {PALETTE_NODES.map(({ kind, label, icon }) => (
          <button key={kind} className="palette-node" draggable onDragStart={(e) => onDragStart(e, kind)}>
            <span className="palette-node__icon">{icon}</span>
            <div>
              <strong>{label}</strong>
              <small>{kind} pool</small>
            </div>
          </button>
        ))}
      </aside>

      <div className="flow-canvas" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={flowNodeTypes}
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
  );
}

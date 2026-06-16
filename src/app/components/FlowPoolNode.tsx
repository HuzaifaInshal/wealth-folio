"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "@/lib/hooks/useFlowCanvas";

export function FlowPoolNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const perf = data.portfolioValue - data.netContributions;
  return (
    <div className="flow-node">
      <Handle type="target" position={Position.Top} />
      <div className="flow-node__header">
        <span>{data.label}</span>
        <small>{data.kind}</small>
      </div>
      <div className="flow-node__body">
        <span>Portfolio value</span>
        <strong>${data.portfolioValue.toLocaleString()}</strong>
      </div>
      <div className="flow-node__body">
        <span>Net contributions</span>
        <strong>${data.netContributions.toLocaleString()}</strong>
      </div>
      <div className={perf >= 0 ? "flow-node__gain" : "flow-node__loss"}>
        {perf >= 0 ? "+" : ""}
        {perf.toLocaleString()} return
      </div>
      {data.notes && <p className="flow-node__notes">{data.notes}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const flowNodeTypes = { pool: FlowPoolNode };

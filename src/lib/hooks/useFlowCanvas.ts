"use client";

import { addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from "@xyflow/react";
import { DragEvent, useEffect, useRef } from "react";
import type { Pool, PoolKind, Transfer } from "../types";
import { currencyFormat } from "../utils";

export type FlowNodeData = {
  label: string;
  kind: PoolKind;
  netContributions: number;
  portfolioValue: number;
  notes: string;
};

function buildNodes(pools: Pool[]): Node<FlowNodeData>[] {
  return pools.map((pool, i) => ({
    id: pool.id,
    type: "pool",
    position: { x: 80 + (i % 3) * 260, y: 80 + Math.floor(i / 3) * 190 },
    data: {
      label: pool.name,
      kind: pool.kind,
      netContributions: pool.netContributions,
      portfolioValue: pool.portfolioValue,
      notes: pool.notes,
    },
  }));
}

function buildEdges(transfers: Transfer[], format: Intl.NumberFormat): Edge[] {
  return transfers.map((t) => ({
    id: t.id,
    source: t.fromPoolId,
    target: t.toPoolId,
    animated: true,
    label: format.format(t.amount),
  }));
}

export function useFlowCanvas(pools: Pool[], transfers: Transfer[], currency: string) {
  const format = currencyFormat(currency);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(buildNodes(pools));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(transfers, format));

  // Track a stable fingerprint so we only re-sync when data actually changes
  const poolsKey = pools.map((p) => `${p.id}:${p.portfolioValue}:${p.netContributions}`).join("|");
  const transfersKey = transfers.map((t) => `${t.id}:${t.amount}`).join("|");
  const prevPoolsKey = useRef(poolsKey);
  const prevTransfersKey = useRef(transfersKey);

  useEffect(() => {
    if (poolsKey !== prevPoolsKey.current) {
      prevPoolsKey.current = poolsKey;
      setNodes(buildNodes(pools));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolsKey]);

  useEffect(() => {
    if (transfersKey !== prevTransfersKey.current) {
      prevTransfersKey.current = transfersKey;
      setEdges(buildEdges(transfers, format));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfersKey]);

  function onConnect(connection: Connection) {
    setEdges((prev) => addEdge({ ...connection, animated: true }, prev));
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
    const draftNode: Node<FlowNodeData> = {
      id: `canvas-${Date.now()}`,
      type: "pool",
      position: { x: event.clientX - bounds.left - 110, y: event.clientY - bounds.top - 60 },
      data: {
        label: `Draft ${kind}`,
        kind,
        netContributions: 0,
        portfolioValue: 0,
        notes: "Draft node — add a pool to persist.",
      },
    };
    setNodes((prev) => [...prev, draftNode]);
  }

  return { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragStart, onDrop };
}

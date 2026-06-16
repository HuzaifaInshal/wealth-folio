'use client';

import { Flow } from '@/lib/types';
import { useWealthStore } from '@/lib/store';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo } from 'react';
import PoolNode from './PoolNode';

const nodeTypes = {
  poolNode: PoolNode,
};

export default function BuilderView({ flow }: { flow: Flow }) {
  const { updateFlow, addTransfer } = useWealthStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

  // Sync store when nodes/edges change
  useEffect(() => {
    updateFlow(flow.id, { nodes, edges });
  }, [nodes, edges, flow.id, updateFlow]);

  // Update nodes when flow.pools change (e.g. from TimelineView)
  useEffect(() => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [flow.nodes, flow.edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // When a connection is made, we treat it as a transfer potential
      // For now, just add the edge. In a real app, maybe open a transfer modal.
      const edge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        animated: true,
        label: 'Transfer',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <div className="flex-1 w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            return '#3b82f6';
          }}
          maskColor="rgb(241, 245, 249, 0.7)"
        />
      </ReactFlow>
      
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-xs text-slate-500 shadow-sm pointer-events-none">
        Drag nodes to organize • Connect nodes to visualize transfers
      </div>
    </div>
  );
}

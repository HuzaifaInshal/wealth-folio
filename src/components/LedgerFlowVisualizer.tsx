/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  Handle,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { InvestmentPool, Transaction, PoolCategory, TransactionType } from '../types';
import { CATEGORY_DETAILS } from '../data';
import {
  Sparkles,
  Plus,
  Minus,
  ArrowRightLeft,
  Scale,
  X,
  PiggyBank,
  TrendingUp,
  Coins,
  Home,
  Shield,
  Sparkles as GoldIcon,
  FileText,
  HelpCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  Search,
  Filter
} from 'lucide-react';

interface LedgerFlowVisualizerProps {
  pools: InvestmentPool[];
  transactions: Transaction[];
  onClose: () => void;
}

// Custom Helper: Format Currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom Helper: Format Date
const formatDateString = (isoStr: string) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
};

// Custom Helper: Get Category Icons self-contained
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'cash':
      return <PiggyBank className="w-3.5 h-3.5" />;
    case 'stocks':
      return <TrendingUp className="w-3.5 h-3.5" />;
    case 'crypto':
      return <Coins className="w-3.5 h-3.5" />;
    case 'real_estate':
      return <Home className="w-3.5 h-3.5" />;
    case 'retirement':
      return <Shield className="w-3.5 h-3.5" />;
    case 'precious_metals':
      return <GoldIcon className="w-3.5 h-3.5" />;
    case 'bonds':
      return <FileText className="w-3.5 h-3.5" />;
    default:
      return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

// Custom Helper: Get Transaction Badge details self-contained
const getTransactionBadgeDetails = (type: TransactionType) => {
  switch (type) {
    case 'creation':
      return {
        icon: <Sparkles className="w-2.5 h-2.5 text-[#1A1A1A]" />,
        bg: 'bg-white border-[#DCDAD2]',
        text: 'text-[#1A1A1A]',
        label: 'Inception',
      };
    case 'deposit':
      return {
        icon: <Plus className="w-2.5 h-2.5 text-emerald-700" />,
        bg: 'bg-[#F0FDF4] border-[#A7F3D0]',
        text: 'text-emerald-800',
        label: 'Deposit',
      };
    case 'withdrawal':
      return {
        icon: <Minus className="w-2.5 h-2.5 text-rose-700" />,
        bg: 'bg-[#FFF5F5] border-[#FCA5A5]',
        text: 'text-rose-800',
        label: 'Withdrawal',
      };
    case 'transfer':
      return {
        icon: <ArrowRightLeft className="w-2.5 h-2.5 text-blue-700" />,
        bg: 'bg-[#EFF6FF] border-[#BFDBFE]',
        text: 'text-blue-800',
        label: 'Transfer',
      };
    case 'valuation_adjustment':
      return {
        icon: <Scale className="w-2.5 h-2.5 text-[#1A1A1A]" />,
        bg: 'bg-white border-[#DCDAD2]',
        text: 'text-[#1A1A1A]',
        label: 'Revaluation',
      };
  }
};

// 1. --- Custom POOL NODE Component ---
const PoolNodeComponent = ({ data }: { data: any }) => {
  const pool = data.pool as InvestmentPool;
  const catDetails = CATEGORY_DETAILS[pool.category];
  
  return (
    <div className="bg-white border border-[#1A1A1A] p-4 min-w-[220px] text-left transition-all relative">
      {/* Target handle - left */}
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-[#1A1A1A]" />
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-[#DCDAD2] pb-2 mb-2.5">
        <span 
          className="p-1 px-1.5 text-white flex items-center justify-center" 
          style={{ backgroundColor: catDetails?.color || '#64748b' }}
        >
          {getCategoryIcon(pool.category)}
        </span>
        <div className="min-w-0">
          <span className="font-serif font-bold text-xs text-[#1A1A1A] block truncate max-w-[140px]">
            {pool.name}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#8C8C85] block font-mono">
            {catDetails?.label || 'Asset Group'}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#8C8C85] font-serif italic">Ledger Value:</span>
          <span className="font-bold text-[#1A1A1A] font-serif pr-1">
            {formatCurrency(pool.currentValuation)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-[#8C8C85] font-serif italic">Raw Cost Basis:</span>
          <span className="font-bold text-[#6B6B66] font-serif pr-1">
            {formatCurrency(pool.investedAmount)}
          </span>
        </div>
        {pool.targetAmount && (
          <div className="pt-1.5 border-t border-[#F1EFEA] mt-1.5 flex justify-between items-center text-[9px]">
            <span className="text-[#8C8C85]">Goal Progress:</span>
            <span className="font-serif font-semibold text-[#1A1A1A]">
              {Math.round((pool.currentValuation / pool.targetAmount) * 100)}% of {formatCurrency(pool.targetAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Source handle - right */}
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-[#1A1A1A]" />
    </div>
  );
};

// 2. --- Custom TRANSACTION NODE Component ---
const TransactionNodeComponent = ({ data }: { data: any }) => {
  const tx = data.transaction as Transaction;
  const type = tx.type;
  const badge = getTransactionBadgeDetails(type);
  
  // Format specific content based on transaction type
  const isAdjustment = type === 'valuation_adjustment';
  const displayAmount = isAdjustment && tx.newValuation !== undefined && tx.previousValuation !== undefined
    ? tx.newValuation - tx.previousValuation
    : tx.amount;
  
  const isPositive = displayAmount >= 0;

  return (
    <div className="bg-[#F9F8F6] border border-[#DCDAD2] hover:border-[#1A1A1A] p-3.5 min-w-[240px] text-left transition-all relative">
      {/* Target handle - left */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-[#8C8C85]" />

      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-1.5 mb-2">
        <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </span>
        <span className="text-[9px] text-[#8C8C85] font-mono">
          {formatDateString(tx.timestamp)}
        </span>
      </div>

      {/* Core values */}
      <div className="space-y-1 text-[10px]">
        {isAdjustment ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#8C8C85] font-serif italic">Value Drift:</span>
              <span className={`font-serif font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isPositive ? '+' : ''}{formatCurrency(displayAmount)}
              </span>
            </div>
            <div className="flex justify-between text-[9px] text-[#8C8C85]">
              <span>Previous Balance:</span>
              <span className="font-mono">{formatCurrency(tx.previousValuation || 0)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-[#1A1A1A] font-bold">
              <span>Ending Balance:</span>
              <span className="font-mono">{formatCurrency(tx.newValuation || 0)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-[#8C8C85] font-serif italic">Capital:</span>
            <span className="font-bold text-[#1A1A1A] font-serif">
              {type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
            </span>
          </div>
        )}

        {/* Note */}
        {tx.note && (
          <div className="text-[9px] text-[#6B6B66] font-serif italic leading-relaxed line-clamp-2 mt-1.5 border-t border-[#EAE9E2] pt-1.5">
            &ldquo;{tx.note}&rdquo;
          </div>
        )}
      </div>

      {/* Source handle - right */}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#8C8C85]" />
    </div>
  );
};

// NodeTypes mapping
const nodeTypes = {
  poolNode: PoolNodeComponent,
  transactionNode: TransactionNodeComponent,
};

export default function LedgerFlowVisualizer({ pools, transactions, onClose }: LedgerFlowVisualizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate Nodes and Edges
  const { nodes, edges } = useMemo(() => {
    const listNodes: Node[] = [];
    const listEdges: Edge[] = [];

    // Filter pools
    const filteredPools = pools.filter((p) => {
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // 1. Render Row of Pool Lanes
    filteredPools.forEach((pool, poolIndex) => {
      const yOffset = poolIndex * 260 + 100;

      // Pool Node
      listNodes.push({
        id: pool.id,
        type: 'poolNode',
        position: { x: 50, y: yOffset },
        data: { pool },
      });

      // Filter transactions for this pool
      // Direct transactions
      const directTxs = transactions.filter(
        (tx) => tx.poolId === pool.id || tx.sourcePoolId === pool.id || tx.destinationPoolId === pool.id
      );

      // Sort transactions chronologically ascending
      const sortedTxs = [...directTxs].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Map Transactions horizontally as children in timeline
      sortedTxs.forEach((tx, txIndex) => {
        const txNodeId = `node-${tx.id}-${pool.id}`; // custom node id per lane instance
        const xOffset = 360 + txIndex * 290;

        listNodes.push({
          id: txNodeId,
          type: 'transactionNode',
          position: { x: xOffset, y: yOffset },
          data: { transaction: tx },
        });

        // 2. Draw standard transaction connection edges (horizontal chain)
        if (txIndex === 0) {
          // Connect Pool Root to First Transaction
          listEdges.push({
            id: `edge-${pool.id}-${txNodeId}`,
            source: pool.id,
            target: txNodeId,
            animated: true,
            style: { stroke: '#1A1A1A', strokeWidth: 1.5 },
          });
        } else {
          // Connect previous transaction node to current transaction node
          const prevTxNodeId = `node-${sortedTxs[txIndex - 1].id}-${pool.id}`;
          listEdges.push({
            id: `edge-${prevTxNodeId}-${txNodeId}`,
            source: prevTxNodeId,
            target: txNodeId,
            style: { stroke: '#8C8C85', strokeWidth: 1.2 },
          });
        }

        // 3. Draw inter-pool TRANSFER connection edges (crossing lanes)
        if (tx.type === 'transfer' && tx.sourcePoolId === pool.id && tx.destinationPoolId) {
          // If this is the origin node, draw a directed edge from this transfer transaction node
          // to the destination pool root node!
          // But check if destination pool is loaded in the filtered preview list
          const destPoolExists = filteredPools.some((p) => p.id === tx.destinationPoolId);
          if (destPoolExists) {
            listEdges.push({
              id: `transfer-edge-${tx.id}`,
              source: txNodeId,
              target: tx.destinationPoolId,
              label: `Transfer ${formatCurrency(tx.amount)}`,
              animated: true,
              labelBgPadding: [4, 2],
              labelBgStyle: { fill: '#EFF6FF', color: '#1E40AF', stroke: '#BFDBFE', strokeWidth: 1 },
              labelStyle: { fill: '#1E40AF', fontSize: 8, fontWeight: 'bold', fontFamily: 'monospace' },
              style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4' },
            });
          }
        }
      });
    });

    return { nodes: listNodes, edges: listEdges };
  }, [pools, transactions, categoryFilter, searchQuery]);

  return (
    <div 
      className="fixed inset-0 bg-[#FAF9F5] flex flex-col h-screen w-screen overflow-hidden text-left z-40"
      id="ledger-flow-visualizer-page"
    >
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 py-4 border-b border-[#DCDAD2] gap-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-none">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center">
                Visual Ledger Flow Map
                <span className="ml-2 text-[9px] uppercase tracking-widest font-sans font-bold bg-[#F9F8F6] border border-[#DCDAD2] px-1.5 py-0.5 text-[#8C8C85]">
                  React Flow Route
                </span>
              </h3>
              <p className="text-[11px] text-[#8C8C85] font-serif italic">
                Interactive chronological timelines and rebalancing routes across all accounts
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mapped pools..."
                className="pl-8 pr-3 py-1.5 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs text-[#1A1A1A] focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] w-48 transition-all"
              />
            </div>

            {/* Filter Category */}
            <div className="flex items-center space-x-1 border border-[#DCDAD2] p-1 bg-white">
              <Filter className="w-3 h-3 text-[#8C8C85] ml-1" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] bg-transparent focus:outline-hidden pr-3 cursor-pointer"
              >
                <option value="all">All Groups</option>
                {Object.keys(CATEGORY_DETAILS).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_DETAILS[cat as PoolCategory].label.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F9F8F6] text-[#1A1A1A] hover:text-black border border-[#1A1A1A] transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-4"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Informative micro header */}
        <div className="bg-[#F9F8F6] border-b border-[#DCDAD2] px-6 py-2.5 flex items-center justify-between text-[11px] text-[#6B6B66] font-serif italic">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span>Map layout: Rows reflect separate assets lanes chronologically. Dashed blue lines indicate cash transfers tracking ledger paths.</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#8C8C85]">
            Use scroll wheel to zoom • Drag canvas to pan
          </span>
        </div>

        {/* Visualizer canvas */}
        <div className="flex-1 min-h-[400px] bg-[#FAF9F5] relative select-none">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="p-3 bg-[#F9F8F6] border border-[#DCDAD2] text-[#8C8C85] mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A]">No active nodes matched your query</p>
              <p className="text-xs text-[#8C8C85] mt-1.5 max-w-sm font-serif italic leading-relaxed">
                Try widening your category filters or creating new saving / investment pools with active transactional history.
              </p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={2}
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background color="#DCDAD2" gap={16} size={1} />
              <Controls className="!bg-white !rounded-none !border !border-[#DCDAD2] !shadow-xs" />
              <MiniMap 
                nodeColor={() => '#F9F8F6'} 
                nodeStrokeColor={(node) => (node.type === 'poolNode' ? '#1A1A1A' : '#DCDAD2')} 
                maskColor="rgba(26, 26, 26, 0.05)"
                className="!bg-white !rounded-none !border !border-[#DCDAD2] !shadow-xs"
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
}

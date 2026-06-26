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
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Holding, Transaction, HoldingCategory, TransactionType, Instrument } from '../types';
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
  Search,
  Filter,
  Info
} from 'lucide-react';

interface LedgerFlowVisualizerProps {
  holdings: Holding[];
  instruments: Instrument[];
  transactions: Transaction[];
  onAddHolding: (holdingData: {
    instrumentId: string;
    quantity?: number;
    initialBalance: number;
  }) => void;
  onAddTransaction: (txData: {
    type: TransactionType;
    holdingId: string;
    sourceHoldingId?: string;
    destinationHoldingId?: string;
    amount: number;
    newValuation?: number;
    note: string;
  }) => void;
  onDeleteHolding: (holdingId: string) => void;
  onClose: () => void;
  onAddInstrument?: () => void;
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

// 1. --- Custom POOL NODE Component with Direct Actions ---
const HoldingNodeComponent = ({ data }: { data: any }) => {
  const holding = data.holding as Holding;
  const instrument = data.instrument as Instrument;
  const catDetails = CATEGORY_DETAILS[instrument?.category || 'other'];
  
  return (
    <div className="bg-white border border-[#1A1A1A] p-4 min-w-[240px] text-left shadow-md transition-all relative select-none">
      {/* Target handle - top */}
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#1A1A1A]" />
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-[#DCDAD2] pb-2 mb-2.5">
        <span 
          className="p-1 px-1.5 text-white flex items-center justify-center font-bold" 
          style={{ backgroundColor: catDetails?.color || '#1A1A1A' }}
        >
          {getCategoryIcon(instrument?.category || 'other')}
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-serif font-bold text-xs text-[#1A1A1A] block truncate pr-2">
            {instrument?.name || 'Unknown Asset'}
          </span>
          {instrument?.ticker && (
            <span className="text-[9px] text-[#8C8C85] block truncate font-serif italic mt-0.5">
              Ticker: {instrument.ticker}
            </span>
          )}
          {holding.quantity !== undefined && holding.quantity > 0 && (
            <span className="text-[9px] text-[#6B6B66] block font-mono font-semibold mt-0.5">
              Qty: {holding.quantity}
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#8C8C85] font-serif italic">Ledger Value:</span>
          <span className="font-bold text-[#1A1A1A] font-serif pr-1">
            {formatCurrency(holding.currentValuation)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-[#8C8C85] font-serif italic">Raw Cost Basis:</span>
          <span className="font-bold text-[#6B6B66] font-serif pr-1">
            {formatCurrency(holding.investedAmount)}
          </span>
        </div>
      </div>

      {/* Interactivity quick-bar */}
      <div className="mt-3.5 pt-2.5 border-t border-[#F1EFEA] flex justify-between gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddTx('deposit'); }}
          className="px-1.5 py-1 bg-[#F9F8F6] border border-[#DCDAD2] hover:border-[#1A1A1A] text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A] cursor-pointer"
          title="Deposit funds"
        >
          + Inflow
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddTx('withdrawal'); }}
          className="px-1.5 py-1 bg-[#F9F8F6] border border-[#DCDAD2] hover:border-[#1A1A1A] text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A] cursor-pointer"
          title="Withdraw cash"
        >
          - Outflow
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddTx('valuation_adjustment'); }}
          className="px-1.5 py-1 bg-[#F9F8F6] border border-[#DCDAD2] hover:border-[#1A1A1A] text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A] cursor-pointer"
          title="Update value balance"
        >
          Value
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
          className="p-1 text-rose-700 hover:bg-[#FFF0F0] border border-transparent hover:border-[#FCD2D2] cursor-pointer flex items-center justify-center"
          title="Delete this holding"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Source handle - bottom */}
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-[#1A1A1A]" />
    </div>
  );
};

// 2. --- Custom TRANSACTION NODE Component ---
const TransactionNodeComponent = ({ data }: { data: any }) => {
  const tx = data.transaction as Transaction;
  const type = tx.type;
  const badge = getTransactionBadgeDetails(type);
  
  const isAdjustment = type === 'valuation_adjustment';
  const displayAmount = isAdjustment && tx.newValuation !== undefined && tx.previousValuation !== undefined
    ? tx.newValuation - tx.previousValuation
    : tx.amount;
  
  const isPositive = displayAmount >= 0;

  return (
    <div className="bg-[#F9F8F6] border border-[#DCDAD2] hover:border-[#1A1A1A] p-3.5 min-w-[240px] text-left transition-all relative select-none">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#8C8C85]" />

      <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-1.5 mb-2">
        <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </span>
        <span className="text-[9px] text-[#8C8C85] font-mono">
          {formatDateString(tx.timestamp)}
        </span>
      </div>

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

        {tx.note && (
          <div className="text-[9px] text-[#6B6B66] font-serif italic leading-relaxed line-clamp-2 mt-1.5 border-t border-[#EAE9E2] pt-1.5">
            &ldquo;{tx.note}&rdquo;
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#8C8C85]" />
    </div>
  );
};

const nodeTypes = {
  holdingNode: HoldingNodeComponent,
  transactionNode: TransactionNodeComponent,
};

export default function LedgerFlowVisualizer({
  holdings,
  instruments,
  transactions,
  onAddHolding,
  onAddTransaction,
  onDeleteHolding,
  onClose,
  onAddInstrument,
}: LedgerFlowVisualizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // --- State for Interactive Features inside Flow ---
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('deposit');
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  // Form State: Holding creation
  const [newHoldingInstrumentId, setNewHoldingInstrumentId] = useState('');
  const [newHoldingQuantity, setNewHoldingQuantity] = useState('');
  const [newHoldingInitialBalance, setNewHoldingInitialBalance] = useState('');

  // Form State: Transactions / Transfers
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txNewValuation, setTxNewValuation] = useState('');
  const [sourceHoldingId, setSourceHoldingId] = useState('');
  const [destinationHoldingId, setDestinationHoldingId] = useState('');
  const [formError, setFormError] = useState('');

  // Custom connection helper: drawing wire automatically triggers Transfer dialog
  const handleConnect = (params: Connection) => {
    const srcId = params.source;
    const destId = params.target;

    // Check if both are valid holdings
    const srcHolding = holdings.find((p) => p.id === srcId);
    const destHolding = holdings.find((p) => p.id === destId);

    if (srcHolding && destHolding && srcHolding.id !== destHolding.id) {
      setTxType('transfer');
      setSourceHoldingId(srcHolding.id);
      setSelectedHolding(srcHolding);
      setDestinationHoldingId(destHolding.id);
      setTxAmount('');
      setTxNote(`Rebalancing reallocation to ${destHolding.name}`);
      setFormError('');
      setIsTxModalOpen(true);
    }
  };

  // Setup callbacks for node triggers
  const handleOpenAddTxModal = (holding: Holding, type: TransactionType) => {
    setSelectedHolding(holding);
    setTxType(type);
    setSourceHoldingId('');
    setDestinationHoldingId('');
    setTxAmount('');
    setTxNote('');
    setFormError('');
    if (type === 'valuation_adjustment') {
      setTxNewValuation(holding.currentValuation.toString());
    } else {
      setTxNewValuation('');
    }
    setIsTxModalOpen(true);
  };

  const handleOpenAddHoldingModal = () => {
    setNewHoldingInstrumentId(instruments.length > 0 ? instruments[0].id : '');
    setNewHoldingQuantity('');
    setNewHoldingInitialBalance('0');
    setFormError('');
    setIsHoldingModalOpen(true);
  };

  // Form Submitters
  const handleHoldingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoldingInstrumentId) {
      setFormError('An underlying asset/fund is required.');
      return;
    }

    const initialVal = parseFloat(newHoldingInitialBalance) || 0;
    if (initialVal < 0) {
      setFormError('Initial capital cannot be negative.');
      return;
    }

    const parsedQty = newHoldingQuantity.trim() ? parseFloat(newHoldingQuantity) : undefined;
    if (parsedQty !== undefined && (isNaN(parsedQty) || parsedQty < 0)) {
      setFormError('Quantity must be a positive number if specified.');
      return;
    }

    onAddHolding({
      instrumentId: newHoldingInstrumentId,
      quantity: parsedQty,
      initialBalance: initialVal,
    });

    setIsHoldingModalOpen(false);
  };

  const handleTxFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (txType === 'transfer') {
      const srcIdToUse = sourceHoldingId || (selectedHolding ? selectedHolding.id : '');
      const destIdToUse = destinationHoldingId;

      if (!srcIdToUse || !destIdToUse) {
        setFormError('You must specify both Source and Target holdings.');
        return;
      }
      if (srcIdToUse === destIdToUse) {
        setFormError('Source and Target holdings cannot be identical.');
        return;
      }

      const amt = parseFloat(txAmount);
      if (isNaN(amt) || amt <= 0) {
        setFormError('Please input a valid amount greater than zero.');
        return;
      }

      const srcHolding = holdings.find((p) => p.id === srcIdToUse);
      if (srcHolding && srcHolding.currentValuation < amt) {
        setFormError(`Insufficient balance. Max transferable is ${formatCurrency(srcHolding.currentValuation)}.`);
        return;
      }

      onAddTransaction({
        type: 'transfer',
        holdingId: srcIdToUse, // Source holding acts as primary anchor
        sourceHoldingId: srcIdToUse,
        destinationHoldingId: destIdToUse,
        amount: amt,
        note: txNote || `Transferred assets internally`,
      });

    } else {
      // Deposit, Withdrawal, Valuation Adjustment
      if (!selectedHolding) {
        setFormError('Source holding is unresolved.');
        return;
      }

      if (txType === 'valuation_adjustment') {
        const newVal = parseFloat(txNewValuation);
        if (isNaN(newVal) || newVal < 0) {
          setFormError('Please enter a valid ending valuation balance.');
          return;
        }

        onAddTransaction({
          type: 'valuation_adjustment',
          holdingId: selectedHolding.id,
          amount: 0,
          newValuation: newVal,
          note: txNote || 'Revalued account statement balance',
        });

      } else {
        const amt = parseFloat(txAmount);
        if (isNaN(amt) || amt <= 0) {
          setFormError('Please input a valid transaction amount.');
          return;
        }

        if (txType === 'withdrawal' && selectedHolding.currentValuation < amt) {
          setFormError(`Withdrawing too much! Max available from this vault is ${formatCurrency(selectedHolding.currentValuation)}.`);
          return;
        }

        onAddTransaction({
          type: txType,
          holdingId: selectedHolding.id,
          amount: amt,
          note: txNote || `${txType === 'deposit' ? 'Capital deposit' : 'Atm cash withdrawal'}`,
        });
      }
    }

    setIsTxModalOpen(false);
  };

  // Generate Nodes and Edges based on state
  const { nodes, edges } = useMemo(() => {
    const listNodes: Node[] = [];
    const listEdges: Edge[] = [];

    // Filter holdings dynamically
    const filteredHoldings = holdings.filter((p) => {
      const inst = instruments.find(i => i.id === p.instrumentId);
      const matchesCategory = categoryFilter === 'all' || (inst ? inst.category === categoryFilter : false);
      const matchesSearch = inst ? (
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      ) : false;
      return matchesCategory && matchesSearch;
    });

    // 1. Render Columns of Holdings (Top to Bottom flow)
    filteredHoldings.forEach((holding, holdingIndex) => {
      const xOffset = holdingIndex * 320 + 50;
      const instrument = instruments.find(i => i.id === holding.instrumentId);

      // Holding Node containing the dynamic handlers inside data
      listNodes.push({
        id: holding.id,
        type: 'holdingNode',
        position: { x: xOffset, y: 50 },
        data: { 
          holding,
          instrument,
          onAddTx: (type: TransactionType) => handleOpenAddTxModal(holding, type),
          onDelete: () => {
            const nameToConfirm = instrument ? instrument.name : 'this holding';
            if (window.confirm(`Are you sure you want to permanently delete holding for "${nameToConfirm}"? This deletes its history.`)) {
              onDeleteHolding(holding.id);
            }
          }
        },
      });

      // Filter transactions for this holding
      const directTxs = transactions.filter(
        (tx) => tx.holdingId === holding.id || tx.sourceHoldingId === holding.id || tx.destinationHoldingId === holding.id
      );

      // Sort transactions chronologically ascending
      const sortedTxs = [...directTxs].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Map Transactions vertically as children in timeline below the holding root
      sortedTxs.forEach((tx, txIndex) => {
        const txNodeId = `node-${tx.id}-${holding.id}`; // custom node id per column instance
        const yOffset = 280 + txIndex * 240;

        listNodes.push({
          id: txNodeId,
          type: 'transactionNode',
          position: { x: xOffset, y: yOffset },
          data: { transaction: tx },
        });

        // 2. Draw standard transaction connection edges (horizontal chain)
        if (txIndex === 0) {
          // Connect Holding Root to First Transaction
          listEdges.push({
            id: `edge-${holding.id}-${txNodeId}`,
            source: holding.id,
            target: txNodeId,
            animated: true,
            style: { stroke: '#1A1A1A', strokeWidth: 1.5 },
          });
        } else {
          // Connect previous transaction node to current transaction node
          const prevTxNodeId = `node-${sortedTxs[txIndex - 1].id}-${holding.id}`;
          listEdges.push({
            id: `edge-${prevTxNodeId}-${txNodeId}`,
            source: prevTxNodeId,
            target: txNodeId,
            style: { stroke: '#8C8C85', strokeWidth: 1.2 },
          });
        }

        // 3. Draw inter-holding TRANSFER connection edges (crossing lanes)
        if (tx.type === 'transfer' && tx.sourceHoldingId === holding.id && tx.destinationHoldingId) {
          // If this is the origin node, draw a directed edge from this transfer transaction node
          // to the destination holding root node!
          const destHoldingExists = filteredHoldings.some((p) => p.id === tx.destinationHoldingId);
          if (destHoldingExists) {
            listEdges.push({
              id: `transfer-edge-${tx.id}`,
              source: txNodeId,
              target: tx.destinationHoldingId,
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
  }, [holdings, transactions, categoryFilter, searchQuery]);

  return (
    <div 
      className="fixed inset-0 bg-[#FAF9F5] flex flex-col h-screen w-screen overflow-hidden text-left z-40"
      id="ledger-flow-visualizer-page"
    >
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* --- DYNAMIC FLOATING SEARCH / FILTER BAR --- */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-3 bg-white p-2.5 border border-[#DCDAD2] shadow-md">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search holdings..."
              className="pl-8 pr-3 py-1 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs text-[#1A1A1A] focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] w-40 sm:w-48 transition-all"
            />
          </div>

          {/* Filter Category */}
          <div className="flex items-center space-x-1 border border-[#DCDAD2] p-0.5 bg-white">
            <Filter className="w-3 h-3 text-[#8C8C85] ml-1" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] bg-transparent focus:outline-hidden pr-3 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_DETAILS).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_DETAILS[cat as HoldingCategory].label.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- FLOATING TOP-LEFT CONTROLS CONTAINER --- */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
          {/* Instruction Box */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-white border border-[#DCDAD2]/80 px-2.5 py-1 text-[10px] text-[#8C8C85] font-serif italic max-w-sm rounded-none shadow-xs">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shrink-0" />
            <span>Drag from one Holding Node to another to transfer funds internally.</span>
          </div>

          {/* Back to Dashboard */}
          <button
            onClick={onClose}
            className="p-2.5 bg-[#1A1A1A] text-white hover:bg-black transition-all cursor-pointer flex items-center justify-center shadow-md border border-[#1A1A1A]"
            title="Back to Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Add Element Ledger Button with Dropdown Popup */}
          <div className="relative">
            <button 
              onClick={() => setIsActionPopupOpen(!isActionPopupOpen)}
              className="p-2.5 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white shadow-md flex items-center justify-center cursor-pointer border border-[#1A1A1A]"
              title="Add Element Ledger"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            {isActionPopupOpen && (
              <div className="absolute left-0 mt-2 bg-white border border-[#1A1A1A] p-4 w-72 flex flex-col text-left space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl z-30">
                <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-1.5 mb-1.5">
                  <h4 className="font-serif font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                    Create / Connect Entry
                  </h4>
                  <button 
                    onClick={() => setIsActionPopupOpen(false)}
                    className="text-[#8C8C85] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => { setIsActionPopupOpen(false); handleOpenAddHoldingModal(); }}
                  className="w-full text-left p-2.5 hover:bg-[#F9F8F6] text-[11px] font-bold text-[#1A1A1A] border border-[#DCDAD2] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Create New Savings/Asset Holding</span>
                </button>
                <button
                  onClick={() => { setIsActionPopupOpen(false); setTxType('deposit'); setSelectedHolding(holdings[0] || null); setSourceHoldingId(''); setDestinationHoldingId(''); setTxAmount(''); setTxNote(''); setFormError(''); setIsTxModalOpen(true); }}
                  className="w-full text-left p-2.5 hover:bg-[#F9F8F6] text-[11px] font-bold text-[#1A1A1A] border border-[#DCDAD2] flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={holdings.length === 0}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Inflow Capital Contribution</span>
                </button>
                <button
                  onClick={() => { setIsActionPopupOpen(false); setTxType('withdrawal'); setSelectedHolding(holdings[0] || null); setSourceHoldingId(''); setDestinationHoldingId(''); setTxAmount(''); setTxNote(''); setFormError(''); setIsTxModalOpen(true); }}
                  className="w-full text-left p-2.5 hover:bg-[#F9F8F6] text-[11px] font-bold text-[#1A1A1A] border border-[#DCDAD2] flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={holdings.length === 0}
                >
                  <Minus className="w-3.5 h-3.5 text-rose-700" />
                  <span>Outflow Capital Withdrawal</span>
                </button>
                <button
                  onClick={() => { setIsActionPopupOpen(false); setTxType('transfer'); setSourceHoldingId(holdings[0]?.id || ''); setDestinationHoldingId(holdings[1]?.id || ''); setTxAmount(''); setTxNote(''); setFormError(''); setIsTxModalOpen(true); }}
                  className="w-full text-left p-2.5 hover:bg-[#F9F8F6] text-[11px] font-bold text-[#1A1A1A] border border-[#DCDAD2] flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={holdings.length < 2}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-700" />
                  <span>Capital Route Rebalancing</span>
                </button>
                <button
                  onClick={() => { setIsActionPopupOpen(false); setTxType('valuation_adjustment'); setSelectedHolding(holdings[0] || null); setSourceHoldingId(''); setDestinationHoldingId(''); setTxNote(''); setFormError(''); if (holdings[0]) setTxNewValuation(holdings[0].currentValuation.toString()); setIsTxModalOpen(true); }}
                  className="w-full text-left p-2.5 hover:bg-[#F9F8F6] text-[11px] font-bold text-[#1A1A1A] border border-[#DCDAD2] flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={holdings.length === 0}
                >
                  <Scale className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>Asset Valuation Adjustment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visualizer canvas */}
        <div className="flex-1 w-full h-full bg-[#FAF9F5] relative select-none">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 bg-[#FAF9F5]/90">
              <div className="p-3 bg-[#F9F8F6] border border-[#DCDAD2] text-[#8C8C85] mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A]">No active nodes matched your query</p>
              <p className="text-xs text-[#8C8C85] mt-1.5 max-w-sm font-serif italic leading-relaxed">
                Try widening your category filters or creating new saving / investment holdings with active transactional history.
              </p>
              <button
                onClick={handleOpenAddHoldingModal}
                className="mt-4 p-2.5 bg-[#1A1A1A] text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-black border border-[#1A1A1A]"
              >
                + Create Asset Holding Node
              </button>
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
              onConnect={handleConnect}
            >
              <Background color="#DCDAD2" gap={16} size={1} />
              <Controls orientation="horizontal" position="bottom-center" className="!bg-white !rounded-none !border !border-[#DCDAD2] !shadow-xs" />
              <MiniMap 
                nodeColor={() => '#F9F8F6'} 
                nodeStrokeColor={(node) => (node.type === 'holdingNode' ? '#1A1A1A' : '#DCDAD2')} 
                maskColor="rgba(26, 26, 26, 0.05)"
                className="!bg-white !rounded-none !border !border-[#DCDAD2] !shadow-xs"
              />
            </ReactFlow>
          )}
        </div>

        {/* --- MODAL DIALOGS EMBEDDED --- */}

        {/* 1. COMPACT ADD POOL MODAL */}
        {isHoldingModalOpen && (
          <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#DCDAD2] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-3 mb-4">
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">
                  Create Saving / Asset Vault
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsHoldingModalOpen(false)}
                  className="p-1 text-[#8C8C85] hover:text-[#1A1A1A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] mb-3">
                  {formError}
                </div>
              )}

              <form onSubmit={handleHoldingFormSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block">
                      Underlying Asset / Fund <span className="text-rose-700">*</span>
                    </label>
                    {onAddInstrument && (
                      <button
                        type="button"
                        onClick={onAddInstrument}
                        className="text-[10px] font-bold text-[#1A1A1A] hover:text-[#8C8C85] transition-colors uppercase tracking-wider flex items-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Create New
                      </button>
                    )}
                  </div>
                  {instruments.length === 0 ? (
                    <div className="p-2.5 bg-[#FFF0F0] text-rose-850 text-xs font-serif italic border border-[#FCD2D2] flex items-center justify-between">
                      <span>No Assets or Funds available.</span>
                      {onAddInstrument && (
                        <button
                          type="button"
                          onClick={onAddInstrument}
                          className="text-[10px] font-bold text-rose-800 hover:text-rose-950 underline uppercase tracking-wider cursor-pointer"
                        >
                          + Create One
                        </button>
                      )}
                    </div>
                  ) : (
                    <select
                      value={newHoldingInstrumentId}
                      onChange={(e) => {
                        if (e.target.value === 'CREATE_NEW') {
                          if (onAddInstrument) onAddInstrument();
                        } else {
                          setNewHoldingInstrumentId(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A] cursor-pointer"
                    >
                      {instruments.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} {inst.ticker ? `(${inst.ticker})` : ''}
                        </option>
                      ))}
                      {onAddInstrument && (
                        <option value="CREATE_NEW" className="font-bold text-[#1a1a1a]">
                          + Create New Asset / Fund...
                        </option>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                    Quantity / Units (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 10 shares, 0.25 BTC"
                    value={newHoldingQuantity}
                    onChange={(e) => setNewHoldingQuantity(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                    Initial Invested Capital (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newHoldingInitialBalance}
                    onChange={(e) => setNewHoldingInitialBalance(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A]"
                  />
                </div>

                <div className="flex space-x-3 pt-3 border-t border-[#DCDAD2]">
                  <button
                    type="button"
                    onClick={() => setIsHoldingModalOpen(false)}
                    className="flex-1 py-2 border border-[#DCDAD2] text-[10px] uppercase font-bold tracking-widest hover:bg-[#F9F8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] uppercase font-bold tracking-widest"
                  >
                    Add Holding Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. COMPACT TRANSACTION / TRANSFER MODAL */}
        {isTxModalOpen && (
          <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#DCDAD2] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#DCDAD2] pb-3 mb-4">
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base capitalize flex items-center">
                  {txType === 'deposit' && 'Inflow capital contribution (Deposit)'}
                  {txType === 'withdrawal' && 'Outflow capital withdrawal'}
                  {txType === 'transfer' && 'Route fund rebalancing'}
                  {txType === 'valuation_adjustment' && 'Asset Valuation statement adjust'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="p-1 text-[#8C8C85] hover:text-[#1A1A1A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-[#FFF0F0] text-rose-800 text-xs font-serif italic border border-[#FCD2D2] mb-3">
                  {formError}
                </div>
              )}

              <form onSubmit={handleTxFormSubmit} className="space-y-4">
                {/* Source selection */}
                {txType !== 'transfer' ? (
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                      Target Vault Node
                    </label>
                    <select
                      value={selectedHolding?.id || ''}
                      onChange={(e) => {
                        const matched = holdings.find((p) => p.id === e.target.value);
                        setSelectedHolding(matched || null);
                        if (txType === 'valuation_adjustment' && matched) {
                          setTxNewValuation(matched.currentValuation.toString());
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm font-semibold text-[#1A1A1A]"
                    >
                      {holdings.map((p) => {
                        const inst = instruments.find(i => i.id === p.instrumentId);
                        return (
                          <option key={p.id} value={p.id}>
                            {inst ? inst.name : 'Unknown Asset'} ({formatCurrency(p.currentValuation)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  // Transfer selects
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                        From Holding (Source)
                      </label>
                      <select
                        value={sourceHoldingId || selectedHolding?.id || ''}
                        onChange={(e) => setSourceHoldingId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A]"
                      >
                        {holdings.map((p) => {
                          const inst = instruments.find(i => i.id === p.instrumentId);
                          return (
                            <option key={p.id} value={p.id}>
                              {inst ? inst.name : 'Unknown Asset'} ({formatCurrency(p.currentValuation)})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                        To Holding (Target)
                      </label>
                      <select
                        value={destinationHoldingId}
                        onChange={(e) => setDestinationHoldingId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A]"
                      >
                        <option value="">-- Select Destination --</option>
                        {holdings
                          .filter((p) => p.id !== (sourceHoldingId || selectedHolding?.id))
                          .map((p) => {
                            const inst = instruments.find(i => i.id === p.instrumentId);
                            return (
                              <option key={p.id} value={p.id}>
                                {inst ? inst.name : 'Unknown Asset'}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                )}

                {/* Amount / balance adjustment */}
                {txType !== 'valuation_adjustment' ? (
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                      Transaction Amount (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      placeholder="e.g. 500"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm font-bold text-[#1A1A1A]"
                    />
                    {txType === 'withdrawal' && selectedHolding && (
                      <span className="text-[10px] text-[#8C8C85] italic font-serif mt-1 block">
                        Max withdrawable balance: {formatCurrency(selectedHolding.currentValuation)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                      Statement Balance (New Total USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 10000"
                      value={txNewValuation}
                      onChange={(e) => setTxNewValuation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm font-bold text-[#1A1A1A]"
                    />
                    {selectedHolding && (
                      <span className="text-[10px] text-[#8C8C85] italic font-serif mt-1 block">
                        Previous statement value: {formatCurrency(selectedHolding.currentValuation)}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-[#8C8C85] uppercase tracking-widest block mb-1">
                    Notes / Description
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Payday savings, portfolio gains..."
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#DCDAD2] text-sm text-[#1A1A1A]"
                  />
                </div>

                <div className="flex space-x-3 pt-3 border-t border-[#DCDAD2]">
                  <button
                    type="button"
                    onClick={() => setIsTxModalOpen(false)}
                    className="flex-1 py-2 border border-[#DCDAD2] text-[10px] uppercase font-bold tracking-widest hover:bg-[#F9F8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#3E3E39] text-white text-[10px] uppercase font-bold tracking-widest"
                  >
                    Post Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Transaction, Holding, TransactionType } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { getCategoryIcon } from './HoldingCard';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  ArrowRightLeft,
  Scale,
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  holdings: Holding[];
  onClearAll?: () => void;
}

export default function TransactionHistory({ transactions, holdings, onClearAll }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [holdingFilter, setHoldingFilter] = useState<string>('all');

  const getHoldingName = (id: string) => {
    const h = holdings.find((holding) => holding.id === id);
    return h ? h.name : 'Unknown Holding';
  };

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case 'creation':
        return {
          icon: <Sparkles className="w-3 h-3 text-[#1A1A1A]" />,
          bg: 'bg-white border-[#DCDAD2]',
          text: 'text-[#1A1A1A]',
          label: 'Inception',
        };
      case 'deposit':
        return {
          icon: <Plus className="w-3 h-3 text-emerald-700" />,
          bg: 'bg-[#F9F8F6] border-[#DCDAD2]',
          text: 'text-emerald-800',
          label: 'Deposit',
        };
      case 'withdrawal':
        return {
          icon: <Minus className="w-3 h-3 text-rose-700" />,
          bg: 'bg-[#F9F8F6] border-[#DCDAD2]',
          text: 'text-rose-800',
          label: 'Withdrawal',
        };
      case 'transfer':
        return {
          icon: <ArrowRightLeft className="w-3 h-3 text-blue-700" />,
          bg: 'bg-white border-[#DCDAD2]',
          text: 'text-blue-800',
          label: 'Transfer',
        };
      case 'valuation_adjustment':
        return {
          icon: <Scale className="w-3 h-3 text-[#1A1A1A]" />,
          bg: 'bg-white border-[#DCDAD2]',
          text: 'text-[#1A1A1A]',
          label: 'Revaluation',
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter Logic
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((tx) => {
      // Search matching holding name, note, or type
      const searchLower = searchTerm.toLowerCase();
      const holdingName = getHoldingName(tx.holdingId).toLowerCase();
      const srcName = tx.sourceHoldingId ? getHoldingName(tx.sourceHoldingId).toLowerCase() : '';
      const destName = tx.destinationHoldingId ? getHoldingName(tx.destinationHoldingId).toLowerCase() : '';
      const note = tx.note.toLowerCase();
      
      const matchesSearch =
        holdingName.includes(searchLower) ||
        srcName.includes(searchLower) ||
        destName.includes(searchLower) ||
        note.includes(searchLower);

      // Filter by type
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;

      // Filter by holding
      const matchesHolding =
        holdingFilter === 'all' ||
        tx.holdingId === holdingFilter ||
        tx.sourceHoldingId === holdingFilter ||
        tx.destinationHoldingId === holdingFilter;

      return matchesSearch && matchesType && matchesHolding;
    });

  return (
    <div 
      className="bg-white border border-[#DCDAD2] rounded-none p-6 flex flex-col h-full"
      id="transaction-history-card"
    >
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight">Ledger Operations</h3>
          <p className="text-xs text-[#8C8C85] font-serif italic mt-0.5">Chronological record of contributions and revaluations</p>
        </div>
        
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-[10px] uppercase tracking-widest font-bold px-3 py-2 border border-[#DCDAD2] hover:border-[#1A1A1A] hover:bg-[#F9F8F6] text-[#1A1A1A] rounded-none transition-all cursor-pointer self-start sm:self-center"
          >
            Clear Ledger History
          </button>
        )}
      </div>

      {/* Filter Header and Controls */}
      <div className="space-y-3 mb-6">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords or note..."
            className="w-full pl-9 pr-3 py-2 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all text-[#1A1A1A] placeholder:text-[#8C8C85]"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Type selector */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:bg-white cursor-pointer"
            >
              <option value="all">Any Type</option>
              <option value="deposit">Deposit (+)</option>
              <option value="withdrawal">Withdrawal (-)</option>
              <option value="transfer">Transfer</option>
              <option value="valuation_adjustment">Status Update</option>
              <option value="creation">Inception</option>
            </select>
          </div>

          {/* Holding Selector */}
          <div>
            <select
              value={holdingFilter}
              onChange={(e) => setHoldingFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:bg-white cursor-pointer"
            >
              <option value="all">All Holdings</option>
              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table/Cards List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <FolderOpen className="w-8 h-8 text-[#8C8C85] mb-2" />
            <p className="text-sm font-medium text-[#8C8C85]">No transactions match your filters</p>
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('all'); setHoldingFilter('all'); }}
              className="text-xs text-blue-800 hover:text-blue-900 font-serif italic mt-2 underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DCDAD2]">
            {filteredTransactions.map((tx) => {
              const badge = getTransactionBadge(tx.type);
              
              const isTransfer = tx.type === 'transfer';
              const isAdjustment = tx.type === 'valuation_adjustment';
              
              let typeLabel = '';
              let valueDisplay = '';
              let valueColor = 'text-[#1A1A1A]';

              if (tx.type === 'deposit' || tx.type === 'creation') {
                valueDisplay = `+${formatCurrency(tx.amount)}`;
                valueColor = 'text-emerald-700';
              } else if (tx.type === 'withdrawal') {
                valueDisplay = `-${formatCurrency(tx.amount)}`;
                valueColor = 'text-[#6B6B66]';
              } else if (isTransfer) {
                valueDisplay = formatCurrency(tx.amount);
                valueColor = 'text-blue-700';
              } else if (isAdjustment && tx.previousValuation !== undefined && tx.newValuation !== undefined) {
                const diff = tx.newValuation - tx.previousValuation;
                valueDisplay = `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`;
                valueColor = diff >= 0 ? 'text-emerald-700' : 'text-rose-700';
              }

              return (
                <div key={tx.id} className="py-4.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="p-2 border border-[#DCDAD2] rounded-none bg-[#F9F8F6] flex-shrink-0">
                      {badge.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none bg-[#1A1A1A] text-white">
                          {badge.label}
                        </span>
                        
                        <p className="text-[10px] uppercase tracking-wide font-bold text-[#8C8C85]">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>

                      <p className="text-sm font-serif italic text-[#1A1A1A] truncate mt-1.5">
                        {tx.note}
                      </p>

                      {/* Display Affected holdings details */}
                      <p className="text-xs text-[#6B6B66] mt-1 font-sans">
                        {isTransfer ? (
                          <span className="inline-flex items-center">
                            <strong className="text-[#1A1A1A] font-semibold">{getHoldingName(tx.sourceHoldingId || '')}</strong>
                            <span className="mx-1">→</span>
                            <strong className="text-[#1A1A1A] font-semibold">{getHoldingName(tx.destinationHoldingId || '')}</strong>
                          </span>
                        ) : (
                          <span>
                            Holding: <strong className="text-[#1A1A1A] font-semibold">{getHoldingName(tx.holdingId)}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Transaction amount panel */}
                  <div className="text-right flex-shrink-0">
                    <span className={`text-base font-serif font-bold ${valueColor}`}>
                      {valueDisplay}
                    </span>
                    {isAdjustment && tx.previousValuation !== undefined && tx.newValuation !== undefined && (
                      <span className="block text-[9px] text-[#8C8C85] font-serif italic">
                        Adjusted: {formatCurrency(tx.previousValuation)} → {formatCurrency(tx.newValuation)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

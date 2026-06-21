/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pool, Holding, Transaction, TransactionType } from '../types';
import { CATEGORY_DETAILS } from '../data';
import { getCategoryIcon } from './HoldingCard';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Clock, 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  Scale, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';

interface PoolTimelineProps {
  pool: Pool;
  holdings: Holding[];
  transactions: Transaction[];
  onClose: () => void;
}

export default function PoolTimeline({ pool, holdings, transactions, onClose }: PoolTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [holdingFilter, setHoldingFilter] = useState<string>('all');

  const getHoldingDetails = (holdingId: string) => {
    const h = holdings.find((holding) => holding.id === holdingId);
    return h ? { name: h.name, category: h.category } : null;
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

  // Filter transaction records Scoped to this Pool's holdings
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((tx) => {
      // Must be a holding inside this pool
      const holding = getHoldingDetails(tx.holdingId);
      const sourceHolding = tx.sourceHoldingId ? getHoldingDetails(tx.sourceHoldingId) : null;
      const destHolding = tx.destinationHoldingId ? getHoldingDetails(tx.destinationHoldingId) : null;

      // Note keyword search
      const searchLower = searchTerm.toLowerCase();
      const noteMatch = tx.note.toLowerCase().includes(searchLower);
      const nameMatch = (holding?.name.toLowerCase() || '').includes(searchLower);
      const srcNameMatch = (sourceHolding?.name.toLowerCase() || '').includes(searchLower);
      const destNameMatch = (destHolding?.name.toLowerCase() || '').includes(searchLower);
      const matchesSearch = noteMatch || nameMatch || srcNameMatch || destNameMatch;

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
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Visual Header */}
      <header className="bg-white border-b border-[#DCDAD2] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-[#1A1A1A] hover:text-[#8C8C85] transition-colors cursor-pointer mr-2 flex items-center justify-center"
              title="Return to Pool detail view"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C8C85]">Transaction History Timeline</span>
              <h1 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight mt-0.5">
                {pool.title}
              </h1>
            </div>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer rounded-none"
            >
              Back to Pool
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Filters Card Panel */}
        <div className="bg-white border border-[#DCDAD2] p-6 rounded-none space-y-4">
          <div className="flex items-center space-x-2 text-[#1A1A1A]">
            <Calendar className="w-4 h-4 text-[#8C8C85]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filter Timeline History</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C8C85] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search memo or holding..."
                className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-[#1A1A1A] transition-all text-[#1A1A1A] placeholder:text-[#8C8C85]"
              />
            </div>

            {/* Type selector */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:bg-white cursor-pointer"
              >
                <option value="all">Any Transaction Type</option>
                <option value="deposit">Deposit (+)</option>
                <option value="withdrawal">Withdrawal (-)</option>
                <option value="transfer">Transfer</option>
                <option value="valuation_adjustment">Status Update</option>
                <option value="creation">Holding Inception</option>
              </select>
            </div>

            {/* Holding Selector */}
            <div>
              <select
                value={holdingFilter}
                onChange={(e) => setHoldingFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#DCDAD2] rounded-none text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:bg-white cursor-pointer"
              >
                <option value="all">All Holdings in Pool</option>
                {holdings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Table Card */}
        <div className="bg-white border border-[#DCDAD2] rounded-none p-6 overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Clock className="w-10 h-10 text-[#8C8C85] mb-3" />
              <p className="text-sm font-medium text-[#1A1A1A]">No transaction events tracked</p>
              <p className="text-xs text-[#8C8C85] font-serif italic mt-1 max-w-sm mx-auto leading-relaxed">
                No ledger actions match your filters. Try clearing search fields or re-evaluating query constraints.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="timeline-table">
              <thead>
                <tr className="border-b border-[#1A1A1A] text-[9px] font-bold text-[#8C8C85] uppercase tracking-widest bg-[#F9F8F6]/60">
                  <th className="py-4 px-4 font-bold">Timestamp</th>
                  <th className="py-4 px-4 font-bold">Holding Target</th>
                  <th className="py-4 px-4 font-bold">Category</th>
                  <th className="py-4 px-4 font-bold">Action type</th>
                  <th className="py-4 px-4 font-bold text-right">Value Change (USD)</th>
                  <th className="py-4 px-4 font-bold">Notes / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDAD2] text-xs text-[#1A1A1A]">
                {filteredTransactions.map((tx) => {
                  const badge = getTransactionBadge(tx.type);
                  const isTransfer = tx.type === 'transfer';
                  const isAdjustment = tx.type === 'valuation_adjustment';
                  
                  const targetHolding = getHoldingDetails(tx.holdingId);
                  const catDetails = targetHolding ? CATEGORY_DETAILS[targetHolding.category] : null;

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
                    <tr key={tx.id} className="hover:bg-[#F9F8F6]/45 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-4.5 px-4 font-mono text-[10px] text-[#8C8C85] group-hover:text-[#1A1A1A] transition-colors whitespace-nowrap">
                        {formatDate(tx.timestamp)}
                      </td>

                      {/* Target Holding */}
                      <td className="py-4.5 px-4 font-serif font-bold">
                        {isTransfer ? (
                          <div className="flex items-center space-x-1">
                            <span>{getHoldingDetails(tx.sourceHoldingId || '')?.name}</span>
                            <span className="text-[#8C8C85] font-sans text-[10px]">➔</span>
                            <span>{getHoldingDetails(tx.destinationHoldingId || '')?.name}</span>
                          </div>
                        ) : (
                          <span>{targetHolding?.name || 'Unknown'}</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4.5 px-4 whitespace-nowrap">
                        {catDetails && (
                          <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-[#8C8C85] bg-[#F9F8F6] border border-[#DCDAD2] px-2 py-0.5">
                            <span className="mr-1">{getCategoryIcon(targetHolding?.category || '')}</span>
                            {catDetails.label}
                          </span>
                        )}
                      </td>

                      {/* Action Type */}
                      <td className="py-4.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none ${badge.bg} border ${badge.text}`}>
                          <span className="mr-1">{badge.icon}</span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Value Change */}
                      <td className={`py-4.5 px-4 text-right font-serif font-bold whitespace-nowrap ${valueColor}`}>
                        {valueDisplay}
                        {isAdjustment && tx.previousValuation !== undefined && tx.newValuation !== undefined && (
                          <span className="block text-[8px] text-[#8C8C85] font-serif italic font-normal tracking-normal mt-0.5">
                            {formatCurrency(tx.previousValuation)} → {formatCurrency(tx.newValuation)}
                          </span>
                        )}
                      </td>

                      {/* Notes / Description */}
                      <td className="py-4.5 px-4 font-serif italic text-[#6B6B66] min-w-[150px] max-w-[300px] truncate" title={tx.note}>
                        {tx.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#DCDAD2] py-8 text-center text-xs text-[#8C8C85] mt-auto">
        <div className="max-w-7xl mx-auto px-4 font-serif italic space-y-1">
          <p>© 2026 Savings and Investment Tracker • Secured Locally via State Persistence Engine</p>
          <p className="text-[10px] font-sans not-italic uppercase tracking-widest text-[#B5B3AC]">Designed with desktop density and micro-animations for clean wealth overview</p>
        </div>
      </footer>
    </div>
  );
}
